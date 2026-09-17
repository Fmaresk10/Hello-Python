from pathlib import Path
import math
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
import imageio.v2 as imageio

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "assets" / "cafasso-casa-interior-v2.jpg"
OUTPUT = ROOT / "assets" / "loops" / "house-sunset.mp4"

WIDTH, HEIGHT = 1280, 720
FPS = 24
DURATION = 12
FRAMES = FPS * DURATION

rng = np.random.default_rng(1846)
base = Image.open(SOURCE).convert("RGB")

# Cover resize preserving composition.
scale = max(WIDTH / base.width, HEIGHT / base.height)
resized = base.resize((round(base.width * scale), round(base.height * scale)), Image.Resampling.LANCZOS)
left = max(0, (resized.width - WIDTH) // 2)
top = max(0, (resized.height - HEIGHT) // 2)
base = resized.crop((left, top, left + WIDTH, top + HEIGHT))
base_arr = np.asarray(base).astype(np.float32) / 255.0

yy, xx = np.mgrid[0:HEIGHT, 0:WIDTH]
xn = xx / WIDTH
yn = yy / HEIGHT

# Low-angle warm light entering from the upper-right side.
beam_core = np.exp(-(((xn - 0.70) / 0.30) ** 2 + ((yn - 0.25) / 0.25) ** 2) * 1.65)
beam_tail = np.exp(-(((xn - 0.58) / 0.48) ** 2 + ((yn - 0.48) / 0.60) ** 2) * 1.10)
beam = np.clip(0.78 * beam_core + 0.42 * beam_tail, 0, 1)[..., None]

# Gentle edge falloff for late-afternoon depth.
cx, cy = 0.52, 0.48
dist = np.sqrt(((xn - cx) / 0.80) ** 2 + ((yn - cy) / 0.90) ** 2)
vignette = np.clip((dist - 0.48) / 0.62, 0, 1)[..., None]

# Dust motes: deterministic and seamless.
particles = []
for _ in range(18):
    particles.append({
        "x": rng.uniform(0.45, 0.79),
        "y": rng.uniform(0.16, 0.58),
        "r": rng.uniform(0.8, 1.9),
        "speed": rng.uniform(0.010, 0.026),
        "drift": rng.uniform(0.004, 0.016),
        "phase": rng.uniform(0, 2 * math.pi),
        "alpha": rng.uniform(14, 34),
    })

OUTPUT.parent.mkdir(parents=True, exist_ok=True)
writer = imageio.get_writer(
    OUTPUT,
    fps=FPS,
    codec="libx264",
    format="FFMPEG",
    macro_block_size=1,
    ffmpeg_params=[
        "-crf", "25",
        "-preset", "medium",
        "-pix_fmt", "yuv420p",
        "-movflags", "+faststart",
        "-an"
    ],
)

try:
    for i in range(FRAMES):
        phase = 2 * math.pi * i / FRAMES

        # Every animated term is periodic, so first/last frames meet cleanly.
        breathe = 0.96 + 0.045 * math.sin(phase) + 0.018 * math.sin(2 * phase + 0.7)
        arr = base_arr.copy()

        # Warm the scene naturally rather than applying a flat orange cast.
        arr[..., 0] *= 1.045
        arr[..., 1] *= 1.010
        arr[..., 2] *= 0.955

        warm = np.array([1.0, 0.69, 0.34], dtype=np.float32)
        arr = arr + beam * warm * (0.085 * breathe)
        arr = arr * (1.0 - vignette * 0.055)
        arr = np.clip(arr, 0, 1)

        frame = Image.fromarray((arr * 255).astype(np.uint8), "RGB").convert("RGBA")

        dust_layer = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
        draw = ImageDraw.Draw(dust_layer)
        for p in particles:
            # Circular paths keep the loop perfectly seamless.
            dx = math.sin(phase + p["phase"]) * p["drift"]
            dy = math.cos(phase + p["phase"]) * p["speed"]
            px = int((p["x"] + dx) * WIDTH)
            py = int((p["y"] + dy) * HEIGHT)
            shimmer = 0.45 + 0.55 * (0.5 + 0.5 * math.sin(phase * 2 + p["phase"]))
            alpha = int(p["alpha"] * shimmer)
            r = p["r"]
            draw.ellipse((px-r, py-r, px+r, py+r), fill=(255, 230, 176, alpha))

        dust_layer = dust_layer.filter(ImageFilter.GaussianBlur(0.7))
        frame = Image.alpha_composite(frame, dust_layer).convert("RGB")

        # Tiny cyclical camera breathing: max ~0.3%, invisible as an "effect".
        zoom = 1.0 + 0.003 * (0.5 - 0.5 * math.cos(phase))
        if zoom > 1.00001:
            zw = round(WIDTH * zoom)
            zh = round(HEIGHT * zoom)
            enlarged = frame.resize((zw, zh), Image.Resampling.LANCZOS)
            lx = (zw - WIDTH) // 2
            ty = (zh - HEIGHT) // 2
            frame = enlarged.crop((lx, ty, lx + WIDTH, ty + HEIGHT))

        writer.append_data(np.asarray(frame))
finally:
    writer.close()

print(f"Generated {OUTPUT} ({OUTPUT.stat().st_size / 1024 / 1024:.2f} MB)")
