(() => {
  if (window.__cafassoAnimatorWorldInstalled) return;
  window.__cafassoAnimatorWorldInstalled = true;

  const root = document.documentElement;
  const BG = 'https://static.wixstatic.com/media/47bf07_2465a68b3ac64824b43bc20531ce6fd4~mv2.png';
  const RUAH_API = 'https://federicomaresca.wixstudio.com/my-site-1/_functions/cafassoRuah';
  const STYLE_ID = 'cafassoAnimatorWorldStyles';
  let dailyWordRef = null;
  let profileView = false;
  let ruahTouched = false;
  let soundContext = null;
  let ambientNodes = [];
  let ambientTimer = null;
  let ambientStep = 0;
  let soundEnabled = true;

  try { soundEnabled = localStorage.getItem('cafassoSoundEnabled') !== '0'; } catch (error) { /* storage unavailable */ }
  window.CafassoSoundEnabled = () => soundEnabled;

  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#039;' }[char]));
  const home = () => document.querySelector('.cafasso-home-v2');
  const isHome = () => (location.hash || '#inicio').replace(/^#/, '') === 'inicio';
  const reveal = () => {
    const app = document.getElementById('app');
    if (!app) return;
    app.style.transition = 'none';
    app.classList.add('cafasso-boot-ready');
    requestAnimationFrame(() => app.style.removeProperty('transition'));
  };

  function audioContext() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return null;
    if (!soundContext) soundContext = new AudioContext();
    if (soundContext.state === 'suspended') soundContext.resume().catch(() => {});
    return soundContext;
  }

  const REAL_ZONE_AUDIO = {
    casa: './audio/casa-door.mp3',
    parroquia: './audio/parroquia-bells.mp3',
    patio: './audio/patio-murmur.mp3',
    escuela: './audio/escuela-ambience.mp3'
  };
  const zoneAudio = {};

  function playZoneSound(zone) {
    if (!soundEnabled) return;
    const source = REAL_ZONE_AUDIO[zone];
    if (!source) return;
    try {
      const audio = zoneAudio[zone] || (zoneAudio[zone] = new Audio(source));
      audio.volume = zone === 'parroquia' ? 0.7 : 0.8;
      audio.currentTime = 0;
      audio.play().catch(() => {});
    } catch (error) { /* Audio may be unavailable in this browser. */ }
  }

  // Legacy synthesized prototype retained only for reference; zone clicks use
  // the real recordings above.
  function noiseBurst(context, now, duration, filterType, frequency, gainLevel) {
    const sampleRate = context.sampleRate;
    const buffer = context.createBuffer(1, Math.ceil(sampleRate * duration), sampleRate);
    const data = buffer.getChannelData(0);
    for (let index = 0; index < data.length; index += 1) data[index] = (Math.random() * 2 - 1) * 0.7;
    const source = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();
    source.buffer = buffer;
    filter.type = filterType;
    filter.frequency.value = frequency;
    filter.Q.value = 0.7;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(gainLevel, now + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    source.connect(filter).connect(gain).connect(context.destination);
    source.start(now);
    source.stop(now + duration + 0.02);
  }

  function playZoneSoundGenerated(zone) {
    if (!soundEnabled) return;
    const context = audioContext();
    if (!context) return;
    const now = context.currentTime;
    try {
      if (zone === 'casa') {
        noiseBurst(context, now, 0.34, 'lowpass', 900, 0.055);
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(145, now);
        oscillator.frequency.exponentialRampToValueAtTime(72, now + 0.3);
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.07, now + 0.035);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.34);
        oscillator.connect(gain).connect(context.destination);
        oscillator.start(now);
        oscillator.stop(now + 0.36);
      } else if (zone === 'parroquia') {
        [392, 523.25, 659.25].forEach((frequency, index) => {
          const start = now + index * 0.18;
          [1, 2.01, 3.02].forEach((partial, partialIndex) => {
            const oscillator = context.createOscillator();
            const gain = context.createGain();
            oscillator.type = partialIndex === 0 ? 'sine' : 'triangle';
            oscillator.frequency.value = frequency * partial;
            gain.gain.setValueAtTime(0.0001, start);
            gain.gain.exponentialRampToValueAtTime(partialIndex === 0 ? 0.1 : 0.025, start + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.95);
            oscillator.connect(gain).connect(context.destination);
            oscillator.start(start);
            oscillator.stop(start + 1.02);
          });
        });
      } else if (zone === 'patio') {
        noiseBurst(context, now, 0.62, 'bandpass', 720, 0.035);
        [165, 208].forEach((frequency, index) => {
          const oscillator = context.createOscillator();
          const gain = context.createGain();
          oscillator.type = 'triangle';
          oscillator.frequency.value = frequency;
          gain.gain.setValueAtTime(0.0001, now + index * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.018, now + index * 0.08 + 0.08);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.62);
          oscillator.connect(gain).connect(context.destination);
          oscillator.start(now + index * 0.08);
          oscillator.stop(now + 0.68);
        });
      } else if (zone === 'escuela') {
        noiseBurst(context, now, 0.28, 'highpass', 2400, 0.04);
        [659.25, 783.99].forEach((frequency, index) => {
          const start = now + index * 0.11;
          const oscillator = context.createOscillator();
          const gain = context.createGain();
          oscillator.type = 'triangle';
          oscillator.frequency.value = frequency;
          gain.gain.setValueAtTime(0.0001, start);
          gain.gain.exponentialRampToValueAtTime(0.055, start + 0.025);
          gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.38);
          oscillator.connect(gain).connect(context.destination);
          oscillator.start(start);
          oscillator.stop(start + 0.42);
        });
      }
    } catch (error) { /* Audio may be blocked until a user gesture. */ }
  }

  function startAmbient() {
    if (!soundEnabled || ambientNodes.length) return;
    const context = audioContext();
    if (!context) return;
    // Base mayor en 6/8: más cercana a una canción acústica que a un
    // xilófono. Los acordes se arpegian como una guitarra/ukelele suave.
    const chords = [
      [261.63, 329.63, 392],   // C
      [196.00, 246.94, 293.66],// G
      [220.00, 261.63, 329.63],// Am
      [174.61, 220.00, 261.63] // F
    ];
    const lead = [523.25, 587.33, 659.25, 783.99, 659.25, 587.33, 523.25, 659.25];
    let chordStep = 0;
    const playNote = () => {
      if (!soundEnabled || !soundContext) return;
      const now = context.currentTime;
      const chord = chords[Math.floor(chordStep / 8) % chords.length];
      const frequency = lead[chordStep % lead.length];
      const filter = context.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 1800;
      filter.Q.value = 0.7;
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = 'sawtooth';
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.028, now + 0.018);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);
      oscillator.connect(filter).connect(gain).connect(context.destination);
      oscillator.start(now);
      oscillator.stop(now + 0.32);
      ambientNodes.push(oscillator);

      // Dos notas de acompañamiento por pulso, como un rasgueo muy leve.
      [chord[chordStep % 3], chord[(chordStep + 1) % 3]].forEach((tone, index) => {
        const bass = context.createOscillator();
        const bassGain = context.createGain();
        bass.type = 'triangle';
        bass.frequency.value = tone / 2;
        bassGain.gain.setValueAtTime(0.0001, now + index * 0.055);
        bassGain.gain.exponentialRampToValueAtTime(0.018, now + index * 0.055 + 0.015);
        bassGain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.055 + 0.34);
        bass.connect(bassGain).connect(context.destination);
        bass.start(now + index * 0.055);
        bass.stop(now + index * 0.055 + 0.38);
        ambientNodes.push(bass);
      });
      ambientStep += 1;
      chordStep += 1;
    };
    playNote();
    ambientTimer = window.setInterval(playNote, 360);
  }

  function stopAmbient() {
    if (ambientTimer) { window.clearInterval(ambientTimer); ambientTimer = null; }
    ambientNodes.forEach(node => { try { node.stop?.(); node.disconnect?.(); } catch (error) {} });
    ambientNodes = [];
  }

  /* Keep this separate from the ambient melody: it is used for the RUAH reward. */
  function playRuahSound() {
    if (!soundEnabled) return;
    const context = audioContext();
    if (!context) return;
    const now = context.currentTime;
    [392, 523.25, 659.25, 783.99].forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      oscillator.type = index ? 'triangle' : 'sine';
      oscillator.frequency.value = frequency;
      const gain = context.createGain();
      gain.gain.setValueAtTime(0.0001, now + index * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.12, now + index * 0.1 + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.1 + 0.3);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start(now + index * 0.1);
      oscillator.stop(now + index * 0.1 + 0.32);
    });
  }

  function installSoundControl(world) {
    if (world.querySelector('[data-cafasso-sound]')) return;
    const button = document.createElement('button');
    button.className = 'cafasso-sound-toggle';
    button.type = 'button';
    button.dataset.cafassoSound = '1';
    const update = () => { button.textContent = soundEnabled ? '✦ Efectos' : '♪ Silencio'; button.setAttribute('aria-pressed', String(soundEnabled)); };
    update();
    button.addEventListener('click', event => {
      event.stopPropagation();
      soundEnabled = !soundEnabled;
      try { localStorage.setItem('cafassoSoundEnabled', soundEnabled ? '1' : '0'); } catch (error) {}
      if (!soundEnabled) stopAmbient();
      update();
    });
    world.querySelector('.cafasso-world-hud')?.appendChild(button);
  }

  function applyRuah(ruah) {
    const state = window.CafassoAnimatorState;
    if (!state || !ruah) return;
    state.data = state.data || {};
    state.data.progress = Array.isArray(state.data.progress) ? state.data.progress : [];
    let row = state.data.progress.find(item => item.courseId === '__cafasso_ruah__' && item.userId === state.session?.user?._id);
    if (!row) { row = { userId: state.session?.user?._id, courseId: '__cafasso_ruah__' }; state.data.progress.push(row); }
    Object.assign(row, { almitasApproved: Number(ruah.bonusAlmitas || 0), ruahCurrent: Number(ruah.current || 0), ruahLastDate: ruah.lastDate || '', ruahHistory: ruah.history || [], ruahBonusAlmitas: Number(ruah.bonusAlmitas || 0), ruahBonusEvents: ruah.bonusEvents || [] });
    const world = document.querySelector('.cafasso-world');
    if (world) {
      const total = (state.data.progress || []).reduce((sum, item) => sum + Number(item.almitasApproved || 0), 0);
      world.querySelector('[data-world-stat="almitas"] b')?.replaceChildren(document.createTextNode(String(total)));
      world.querySelector('[data-world-stat="ruah"] b')?.replaceChildren(document.createTextNode(`${Number(ruah.current || 0)} días`));
    }
  }

  async function touchRuah() {
    if (ruahTouched || !window.CafassoAnimatorState?.session) return;
    ruahTouched = true;
    try {
      const response = await fetch(RUAH_API, { method: 'POST', cache: 'no-store' });
      const payload = await response.json();
      if (response.ok && payload.ok) { applyRuah(payload.ruah); if (payload.credited) playRuahSound(); window.dispatchEvent(new CustomEvent('cafasso:state-ready')); }
    } catch (error) { console.warn('CAFASSO: no se pudo actualizar RUAH.', error); }
  }

  function styles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      html[data-cafasso-home-v2="1"] body{background:#102F35 url('${BG}') center/cover fixed no-repeat!important;overflow-x:hidden}
      html[data-cafasso-home-v2="1"] .shell{display:block!important;min-height:100vh!important}
      html[data-cafasso-home-v2="1"] main{width:100%!important;max-width:none!important;min-height:100vh;padding:0!important}
      html[data-cafasso-home-v2="1"] .side{display:none!important}
      html[data-cafasso-home-v2="1"] .mobilebar,html[data-cafasso-home-v2="1"] .mobile-nav,html[data-cafasso-home-v2="1"] .mobile-head{display:none!important}
      html[data-cafasso-home-v2="1"] .side .nav{margin-top:0!important;gap:7px!important}html[data-cafasso-home-v2="1"] .side .nav button{background:rgba(8,35,39,.42)!important;border:1px solid rgba(244,216,137,.18)!important;backdrop-filter:blur(8px);color:#FFF9E8!important}html[data-cafasso-home-v2="1"] .side .nav button.active,html[data-cafasso-home-v2="1"] .side .nav button:hover{background:rgba(244,216,137,.9)!important;color:#17302F!important}
      html[data-cafasso-home-v2="1"] .cafasso-home-v2{max-width:none!important;min-height:100vh;padding:0!important;position:relative}
      .cafasso-world{position:relative;min-height:100vh;overflow:hidden;background:linear-gradient(180deg,rgba(5,27,32,.12),rgba(5,27,32,.28));padding:28px 6vw 32px}
      .cafasso-world:after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,rgba(5,27,32,.12),transparent 26%,rgba(5,27,32,.2));pointer-events:none}
      .cafasso-world-hud{position:relative;z-index:4;display:flex;justify-content:space-between;align-items:flex-start;gap:20px;color:#FFF9E8;text-shadow:0 2px 12px rgba(0,0,0,.45)}
      .cafasso-world-kicker{font:850 10px/1.2 Inter,system-ui;letter-spacing:.16em;text-transform:uppercase;color:#F4D889;margin-bottom:7px}.cafasso-world-title{font:400 39px/1 Georgia,serif;margin:0}.cafasso-world-sub{font-size:12px;color:#DDE9DF;margin-top:8px}
      .cafasso-world-stats{display:flex;gap:9px;flex-wrap:wrap;justify-content:flex-end}.cafasso-world-stat{display:flex;align-items:center;gap:7px;padding:9px 12px;border:1px solid rgba(244,216,137,.4);border-radius:999px;background:rgba(8,35,39,.65);backdrop-filter:blur(8px);font:850 11px Inter,system-ui;color:#FFF9E8;cursor:pointer}.cafasso-world-stat:hover{background:rgba(244,216,137,.2);border-color:#F4D889}.cafasso-world-stat b{color:#F4D889;font-size:15px}.cafasso-sound-toggle{position:absolute;right:0;top:54px;border:1px solid rgba(244,216,137,.42);border-radius:999px;background:rgba(8,35,39,.62);color:#FFF9E8;padding:7px 10px;font:850 10px Inter,system-ui;cursor:pointer}.cafasso-sound-toggle:hover{background:rgba(244,216,137,.2)}
      .cafasso-world-map{position:absolute;z-index:2;inset:0}.cafasso-world-zone{position:absolute;appearance:none;border:0;background:transparent;color:#FFF9E8;text-align:left;cursor:pointer;text-shadow:0 2px 8px rgba(0,0,0,.7);transition:transform .2s ease,filter .2s ease;filter:drop-shadow(0 7px 10px rgba(0,0,0,.28))}.cafasso-world-zone:hover{transform:translateY(-5px) scale(1.025);filter:drop-shadow(0 10px 15px rgba(0,0,0,.4))}.cafasso-world-zone:focus-visible{outline:3px solid #F4D889;outline-offset:5px;border-radius:16px}
      .cafasso-world-zone-label{display:inline-flex;align-items:center;gap:7px;padding:8px 12px;border-radius:999px;background:rgba(8,35,39,.75);border:1px solid rgba(244,216,137,.6);backdrop-filter:blur(7px);font:850 11px Inter,system-ui;letter-spacing:.1em;text-transform:uppercase}.cafasso-world-zone-label i{font-style:normal;font-size:16px}.cafasso-world-zone-copy{display:block;max-width:155px;margin:7px 0 0;font-size:11px;line-height:1.35;color:#F3F5E9}
      .cafasso-world-zone[data-zone="casa"]{left:8%;bottom:22%}.cafasso-world-zone[data-zone="patio"]{left:50%;top:48%;transform:translate(-50%,-50%)}.cafasso-world-zone[data-zone="patio"]:hover{transform:translate(-50%,-55%) scale(1.025)}.cafasso-world-zone[data-zone="escuela"]{right:13%;top:24%}.cafasso-world-zone[data-zone="parroquia"]{right:7%;bottom:20%}
      .cafasso-world-panel{position:absolute;z-index:8;width:min(355px,32vw);padding:18px 20px;border:1px solid rgba(244,216,137,.58);border-radius:18px;background:rgba(8,35,39,.9);backdrop-filter:blur(15px);color:#FFF9E8;box-shadow:0 16px 42px rgba(0,0,0,.32);display:none}.cafasso-world-panel.show{display:block;animation:cafassoWorldPanelIn .2s ease-out both}.cafasso-world-panel.near-casa{left:6%;bottom:32%}.cafasso-world-panel.near-patio{left:29%;bottom:28%}.cafasso-world-panel.near-escuela{right:20%;top:27%}.cafasso-world-panel.near-parroquia{right:5%;bottom:30%}.cafasso-world-panel h3{font:400 25px/1.1 Georgia,serif;color:#F4D889;margin:0 0 6px}.cafasso-world-panel p{margin:0;color:#DDE9DF;font-size:12px;line-height:1.5}.cafasso-world-panel button{margin-top:14px;border:0;border-radius:999px;background:#F1C85B;color:#17302F;padding:10px 14px;font:850 11px Inter,system-ui;cursor:pointer}.cafasso-world-panel .close{position:absolute;right:10px;top:8px;margin:0;padding:3px 7px;background:transparent;color:#FFF9E8;font-size:18px}
      .cafasso-world-panel .cafasso-daily-word{margin-top:13px!important;background:#102F35!important;border:1px solid rgba(244,216,137,.48)!important;box-shadow:0 8px 18px rgba(0,0,0,.22)!important;border-radius:10px!important;padding:14px!important;color:#FFF9E8!important}.cafasso-world-panel .cafasso-dw-shell{display:block!important}.cafasso-world-panel .cafasso-dw-symbol{background:#2E6658!important;color:#F4D889!important}.cafasso-world-panel .cafasso-dw-kicker{color:#F4D889!important}.cafasso-world-panel .cafasso-dw-main strong,.cafasso-world-panel .cafasso-dw-main span,.cafasso-world-panel .cafasso-dw-readings,.cafasso-world-panel .cafasso-dw-readings b,.cafasso-world-panel .cafasso-dw-season{color:#FFF9E8!important}.cafasso-world-panel .cafasso-dw-readings em{color:#F4D889!important}.cafasso-world-panel .cafasso-dw-action{margin-top:10px!important}.cafasso-world-panel .cafasso-dw-link{background:#F1C85B!important;color:#17302F!important}
      .cafasso-world-profile{display:grid;grid-template-columns:58px 1fr;gap:11px;align-items:center;margin:4px 0 14px}.cafasso-world-profile-avatar{width:58px;height:58px;border-radius:50%;display:grid;place-items:center;overflow:hidden;background:#F1C85B;color:#17302F;font:850 18px Georgia,serif;border:2px solid #F4D889}.cafasso-world-profile-avatar img{width:100%;height:100%;object-fit:cover}.cafasso-world-profile strong{display:block;font:400 20px Georgia,serif;color:#FFF9E8}.cafasso-world-profile small{display:block;margin-top:4px;color:#C9DDD1;font-size:10px}.cafasso-world-profile-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px}.cafasso-world-profile-stat{padding:9px 10px;border-radius:11px;background:rgba(255,255,255,.08);border:1px solid rgba(244,216,137,.18)}.cafasso-world-profile-stat b{display:block;color:#F4D889;font:400 20px Georgia,serif}.cafasso-world-profile-stat span{display:block;margin-top:3px;color:#C9DDD1;font-size:9px;text-transform:uppercase;letter-spacing:.08em}.cafasso-ledger{display:grid;gap:7px;margin-top:13px;max-height:250px;overflow:auto}.cafasso-ledger-row{display:grid;grid-template-columns:24px 1fr;gap:8px;align-items:start;padding:8px 9px;border-radius:10px;background:rgba(255,255,255,.07);border:1px solid rgba(244,216,137,.14)}.cafasso-ledger-row>span{color:#F4D889;font-size:16px}.cafasso-ledger-row strong{display:block;color:#FFF9E8;font-size:11px}.cafasso-ledger-row small{display:block;color:#C9DDD1;font-size:9px;margin-top:3px}.cafasso-ledger-empty{padding:12px;color:#C9DDD1;font-size:11px;text-align:center}.cafasso-ruah-current{display:flex;align-items:baseline;gap:8px;margin-top:13px;padding:11px 13px;border-radius:12px;background:rgba(244,216,137,.12);border:1px solid rgba(244,216,137,.24)}.cafasso-ruah-current strong{font:400 27px Georgia,serif;color:#F4D889}.cafasso-ruah-current small{color:#C9DDD1;font-size:10px}
      .cafasso-profile-screen{min-height:100vh;padding:34px 7vw 54px;color:#FFF9E8;background:linear-gradient(180deg,rgba(5,27,32,.12),rgba(5,27,32,.36))}.cafasso-profile-shell{position:relative;z-index:2;max-width:1040px;margin:0 auto}.cafasso-profile-back{appearance:none;border:1px solid rgba(244,216,137,.45);background:rgba(8,35,39,.68);color:#FFF9E8;border-radius:999px;padding:9px 14px;font:850 11px Inter,system-ui;cursor:pointer}.cafasso-profile-kicker{margin-top:28px;color:#F4D889;font:850 10px Inter,system-ui;letter-spacing:.18em;text-transform:uppercase}.cafasso-profile-title{font:400 44px/1 Georgia,serif;margin:7px 0 24px;text-shadow:0 2px 13px rgba(0,0,0,.4)}.cafasso-profile-hero{display:grid;grid-template-columns:1.25fr .75fr;gap:16px}.cafasso-profile-identity,.cafasso-profile-level,.cafasso-profile-stat-card,.cafasso-profile-achievements{border:1px solid rgba(244,216,137,.42);background:rgba(8,35,39,.84);backdrop-filter:blur(14px);box-shadow:0 16px 38px rgba(0,0,0,.25);border-radius:20px}.cafasso-profile-identity{display:flex;align-items:center;gap:18px;padding:22px}.cafasso-profile-avatar{width:92px;height:92px;flex:0 0 auto;border-radius:50%;display:grid;place-items:center;overflow:hidden;background:#F1C85B;border:3px solid #F4D889;color:#17302F;font:400 30px Georgia,serif}.cafasso-profile-avatar img{width:100%;height:100%;object-fit:cover}.cafasso-profile-identity h2{font:400 28px/1.1 Georgia,serif;margin:0;color:#FFF9E8}.cafasso-profile-identity p{margin:7px 0 0;color:#C9DDD1;font-size:12px}.cafasso-profile-level{padding:21px}.cafasso-profile-level-label{display:flex;justify-content:space-between;gap:10px;color:#C9DDD1;font:850 10px Inter,system-ui;letter-spacing:.08em;text-transform:uppercase}.cafasso-profile-level-label b{color:#F4D889}.cafasso-profile-level h3{font:400 27px Georgia,serif;margin:9px 0 5px;color:#FFF9E8}.cafasso-profile-level p{margin:0;color:#C9DDD1;font-size:11px;line-height:1.4}.cafasso-profile-xp{height:9px;margin:15px 0 0;border-radius:99px;background:rgba(255,255,255,.14);overflow:hidden}.cafasso-profile-xp span{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,#F4D889,#F1C85B)}.cafasso-profile-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-top:16px}.cafasso-profile-stat-card{padding:16px}.cafasso-profile-stat-card b{display:block;font:400 28px Georgia,serif;color:#F4D889}.cafasso-profile-stat-card span{display:block;margin-top:5px;color:#C9DDD1;font-size:10px;text-transform:uppercase;letter-spacing:.08em}.cafasso-profile-bottom{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:16px}.cafasso-profile-achievements{padding:20px}.cafasso-profile-achievements h3{font:400 24px Georgia,serif;margin:0 0 14px;color:#FFF9E8}.cafasso-profile-badges{display:flex;flex-wrap:wrap;gap:9px}.cafasso-profile-badge{padding:10px 12px;border-radius:12px;background:rgba(244,216,137,.13);border:1px solid rgba(244,216,137,.28);color:#F4D889;font:850 10px Inter,system-ui}.cafasso-profile-quest{padding:20px;border-radius:20px;background:linear-gradient(145deg,rgba(244,216,137,.93),rgba(206,163,57,.88));color:#17302F;box-shadow:0 16px 38px rgba(0,0,0,.22)}.cafasso-profile-quest small{font:850 10px Inter,system-ui;letter-spacing:.14em;text-transform:uppercase}.cafasso-profile-quest h3{font:400 26px Georgia,serif;margin:10px 0 6px}.cafasso-profile-quest p{margin:0;font-size:12px;line-height:1.5}.cafasso-profile-quest button{margin-top:16px;border:0;border-radius:999px;background:#17302F;color:#FFF9E8;padding:10px 14px;font:850 11px Inter,system-ui;cursor:pointer}
      @media(max-width:680px){.cafasso-profile-screen{padding:20px 14px 34px}.cafasso-profile-kicker{margin-top:23px}.cafasso-profile-title{font-size:34px;margin-bottom:18px}.cafasso-profile-hero,.cafasso-profile-bottom{grid-template-columns:1fr}.cafasso-profile-identity{padding:17px;gap:13px}.cafasso-profile-avatar{width:72px;height:72px;font-size:24px}.cafasso-profile-identity h2{font-size:23px}.cafasso-profile-stats{grid-template-columns:1fr 1fr;gap:9px}.cafasso-profile-stat-card{padding:14px}.cafasso-profile-stat-card b{font-size:24px}}
      @keyframes cafassoWorldPanelIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
      @media(max-width:680px){html[data-cafasso-home-v2="1"] .side{display:none!important}.cafasso-world{min-height:100svh;padding:20px 14px 84px}.cafasso-world-hud{display:block}.cafasso-world-title{font-size:31px}.cafasso-world-sub{font-size:11px}.cafasso-world-stats{justify-content:flex-start;margin-top:13px}.cafasso-world-map{inset:0}.cafasso-world-zone-label{font-size:9px;padding:7px 9px}.cafasso-world-zone-copy{font-size:9px;max-width:105px}.cafasso-world-zone[data-zone="casa"]{left:3%;bottom:24%}.cafasso-world-zone[data-zone="patio"]{left:50%;top:48%;transform:translate(-50%,-50%)}.cafasso-world-zone[data-zone="patio"]:hover{transform:translate(-50%,-55%) scale(1.025)}.cafasso-world-zone[data-zone="escuela"]{right:2%;top:29%}.cafasso-world-zone[data-zone="parroquia"]{right:2%;bottom:25%}.cafasso-world-panel,.cafasso-world-panel.near-casa,.cafasso-world-panel.near-patio,.cafasso-world-panel.near-escuela,.cafasso-world-panel.near-parroquia{left:14px;right:14px;bottom:79px;width:auto}.cafasso-home-profile-chip{z-index:5!important}}
    `;
    document.head.appendChild(style);
  }

  function readStats() {
    const almitas = document.querySelector('[data-almitas-total]')?.textContent?.trim() || '0';
    const ruah = document.querySelector('.cafasso-home-ruah-total')?.textContent?.trim() || '0 semanas';
    const title = document.querySelector('.cafasso-home-title')?.textContent?.trim() || 'Hola';
    const state = window.CafassoAnimatorState;
    const ruahRow = (state?.data?.progress || []).find(item => item.courseId === '__cafasso_ruah__');
    return { almitas, ruah: ruahRow ? `${Number(ruahRow.ruahCurrent || 0)} días` : ruah, title };
  }

  function showProfile() {
    const old = home();
    if (!old) return;
    profileView = true;
    styles();
    let session = null;
    try { session = JSON.parse(localStorage.getItem('cafassoSession') || 'null'); } catch (error) { session = null; }
    const user = session?.user || {};
    const state = window.CafassoAnimatorState || {};
    const data = state.data || {};
    const name = String(user.name || 'Animador/a');
    const photo = String(user.avatarData || '');
    const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase() || 'A';
    const stats = readStats();
    const almitasNumber = Number(String(stats.almitas).replace(/[^0-9]/g, '')) || 0;
    const level = Math.max(1, Math.floor(almitasNumber / 100) + 1);
    const levelProgress = Math.min(100, almitasNumber % 100);
    const courses = Array.isArray(data.courses) ? data.courses : [];
    const progress = Array.isArray(data.progress) ? data.progress.filter(item => item.userId === user._id) : [];
    const average = progress.length ? Math.round(progress.reduce((sum, item) => sum + Number(item.percent || 0), 0) / progress.length) : 0;
    old.innerHTML = `<section class="cafasso-profile-screen"><div class="cafasso-profile-shell"><button class="cafasso-profile-back" data-profile-back>← Volver al mundo</button><div class="cafasso-profile-kicker">Casa · Tu perfil de animador</div><h1 class="cafasso-profile-title">Tu camino hasta acá</h1><div class="cafasso-profile-hero"><article class="cafasso-profile-identity"><div class="cafasso-profile-avatar">${photo ? `<img src="${esc(photo)}" alt="Foto de ${esc(name)}">` : initials}</div><div><h2>${esc(name)}</h2><p>${esc(user.groupName || user.role || 'Animador/a')} · Habitante de CAFASSO</p></div></article><article class="cafasso-profile-level"><div class="cafasso-profile-level-label"><span>Nivel de recorrido</span><b>Nivel ${level}</b></div><h3>Corazón en camino</h3><p>${levelProgress < 100 ? `${100 - levelProgress} almitas para alcanzar el próximo nivel.` : '¡Alcanzaste un nuevo nivel!'}</p><div class="cafasso-profile-xp"><span style="width:${levelProgress || (almitasNumber ? 100 : 8)}%"></span></div></article></div><div class="cafasso-profile-stats"><article class="cafasso-profile-stat-card"><b>${esc(stats.almitas)}</b><span>Almitas</span></article><article class="cafasso-profile-stat-card"><b>${esc(stats.ruah)}</b><span>RUAH</span></article><article class="cafasso-profile-stat-card"><b>${courses.length}</b><span>Cursos</span></article><article class="cafasso-profile-stat-card"><b>${average}%</b><span>Recorrido</span></article></div><div class="cafasso-profile-bottom"><article class="cafasso-profile-achievements"><h3>Señales de tu camino</h3><div class="cafasso-profile-badges"><span class="cafasso-profile-badge">✦ Primer paso</span><span class="cafasso-profile-badge">⌂ Casa abierta</span><span class="cafasso-profile-badge">🤝 Corazón presente</span><span class="cafasso-profile-badge">✝ Mirada creyente</span></div></article><article class="cafasso-profile-quest"><small>Próxima misión personal</small><h3>Seguí haciendo hogar</h3><p>Tu presencia, tu escucha y tus pequeños gestos también construyen el oratorio.</p><button data-profile-back>Volver al mundo →</button></article></div></div></section>`;
    old.querySelectorAll('[data-profile-back]').forEach(button => button.addEventListener('click', () => {
      profileView = false;
      root.removeAttribute('data-cafasso-profile');
      document.querySelector('[data-view="inicio"]')?.click();
    }));
  }

  function buildWorld() {
    if (!isHome()) {
      root.removeAttribute('data-cafasso-home-v2');
      stopAmbient();
      return;
    }
    // La pantalla inicial debe reactivar siempre el mundo y su fondo,
    // incluso cuando se llega desde un curso mediante history.pushState.
    root.dataset.cafassoHomeV2 = '1';
    if (profileView) return;
    const old = home();
    if (!old || old.querySelector('.cafasso-world')) return;
    styles();
    const stats = readStats();
    const courseButton = old.querySelector('#cafassoHomeContinue');
    const dailyWord = dailyWordRef || document.getElementById('cafassoDailyWord');
    if (dailyWord) dailyWordRef = dailyWord;
    document.querySelectorAll('.cafasso-daily-word').forEach(node => node.remove());
    old.innerHTML = `<div class="cafasso-world"><header class="cafasso-world-hud"><div><div class="cafasso-world-kicker">Tu mundo CAFASSO</div><h1 class="cafasso-world-title">${esc(stats.title)}</h1><p class="cafasso-world-sub">Elegí un lugar y seguí caminando.</p></div><div class="cafasso-world-stats"><button class="cafasso-world-stat" data-world-stat="almitas">✦ <b data-almitas-total>${esc(stats.almitas)}</b> almitas</button><button class="cafasso-world-stat" data-world-stat="ruah">RUAH · <b>${esc(stats.ruah)}</b></button></div></header><div class="cafasso-world-map"><button class="cafasso-world-zone" data-zone="casa"><span class="cafasso-world-zone-label"><i>⌂</i> Casa</span><span class="cafasso-world-zone-copy">Un lugar para volver, descansar y reconocer lo que llevás dentro.</span></button><button class="cafasso-world-zone" data-zone="patio"><span class="cafasso-world-zone-label"><i>✦</i> Patio</span><span class="cafasso-world-zone-copy">El corazón del encuentro, el juego y la comunidad.</span></button><button class="cafasso-world-zone" data-zone="escuela"><span class="cafasso-world-zone-label"><i>◇</i> Escuela</span><span class="cafasso-world-zone-copy">Tus cursos, misiones y próximos pasos.</span></button><button class="cafasso-world-zone" data-zone="parroquia"><span class="cafasso-world-zone-label"><i>✝</i> Parroquia</span><span class="cafasso-world-zone-copy">La Palabra, la oración y el sentido del camino.</span></button></div><section class="cafasso-world-panel" aria-live="polite"><button class="close" aria-label="Cerrar">×</button><div class="cafasso-world-panel-content"></div></section></div>`;
    const world = old.querySelector('.cafasso-world');
    installSoundControl(world);
    const panel = old.querySelector('.cafasso-world-panel');
    const content = old.querySelector('.cafasso-world-panel-content');
    const state = window.CafassoAnimatorState || {};
    const openLedger = kind => {
      panel.className = `cafasso-world-panel show near-patio`;
      if (kind === 'almitas') {
        const rewards = (state.data?.submissions || []).filter(item => item.almitasAwarded === true && Number(item.rewardAlmitas || 0) > 0);
        const bonus = (state.data?.progress || []).find(item => item.courseId === '__cafasso_ruah__')?.ruahBonusEvents || [];
        const rows = [...rewards.map(item => ({ date: item.almitasAwardedAt || item._updatedDate, amount: Number(item.rewardAlmitas || 0), label: `${item.courseTitle || 'Curso'} · ${item.type || 'Desafío'}` })), ...bonus.map(item => ({ date: item.date, amount: Number(item.amount || 50), label: `RUAH · ${item.streak} días de racha` }))].sort((a,b) => String(b.date || '').localeCompare(String(a.date || '')));
        content.innerHTML = `<h3>Almitas</h3><p>Acá podés ver cómo fueron creciendo tus almitas.</p><div class="cafasso-ledger">${rows.length ? rows.map(row => `<div class="cafasso-ledger-row"><span>✦</span><div><strong>+${row.amount} almitas</strong><small>${esc(row.label)} · ${esc(String(row.date || '').slice(0,10))}</small></div></div>`).join('') : '<div class="cafasso-ledger-empty">Todavía no tenés recompensas registradas.</div>'}</div>`;
      } else {
        const row = (state.data?.progress || []).find(item => item.courseId === '__cafasso_ruah__') || {};
        const history = Array.isArray(row.ruahHistory) ? row.ruahHistory.slice().reverse().slice(0,30) : [];
        content.innerHTML = `<h3>RUAH</h3><p>Tu racha cuenta un solo ingreso por día. Si dejás pasar un día, vuelve a cero.</p><div class="cafasso-ruah-current"><strong>${Number(row.ruahCurrent || 0)} días</strong><small>racha actual</small></div><div class="cafasso-ledger">${history.length ? history.map(date => `<div class="cafasso-ledger-row"><span>✓</span><div><strong>Ingreso registrado</strong><small>${esc(date)}</small></div></div>`).join('') : '<div class="cafasso-ledger-empty">Todavía no hay ingresos registrados.</div>'}</div>`;
      }
    };
    old.querySelector('[data-world-stat="almitas"]').addEventListener('click', () => openLedger('almitas'));
    old.querySelector('[data-world-stat="ruah"]').addEventListener('click', () => openLedger('ruah'));
    const openPanel = zone => {
      playZoneSound(zone);
      const copy = {
        casa: ['Casa', 'Acá podés revisar tus almitas, tu RUAH y tu identidad como animador.', 'Ver mi perfil'],
        patio: ['Patio', 'El lugar de la cercanía: pequeños gestos, comunidad y vida compartida.', 'Continuar recorrido'],
        escuela: ['Escuela', 'Tus cursos viven acá. Cada misión completada abre un nuevo tramo del camino.', 'Entrar a mi curso'],
        parroquia: ['Parroquia', 'Un espacio para detenerte, escuchar la Palabra y volver a poner el corazón en el camino.', 'Abrir la Palabra del día']
      }[zone];
      panel.className = `cafasso-world-panel show near-${zone}`;
      if (zone === 'casa') {
        let session = null;
        try { session = JSON.parse(localStorage.getItem('cafassoSession') || 'null'); } catch (error) { session = null; }
        const user = session?.user || {};
        const photo = String(user.avatarData || '');
        const name = String(user.name || 'Animador/a');
        const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase() || 'A';
        content.innerHTML = `<h3>Casa</h3><div class="cafasso-world-profile"><div class="cafasso-world-profile-avatar">${photo ? `<img src="${esc(photo)}" alt="Foto de ${esc(name)}">` : initials}</div><div><strong>${esc(name)}</strong><small>${esc(user.groupName || user.role || 'Animador/a')}</small></div></div><p>Tu lugar personal dentro de CAFASSO. Acá se reúne todo lo que vas construyendo.</p><div class="cafasso-world-profile-grid"><div class="cafasso-world-profile-stat"><b>${esc(stats.almitas)}</b><span>Almitas</span></div><div class="cafasso-world-profile-stat"><b>${esc(stats.ruah)}</b><span>RUAH</span></div></div><button data-world-action="casa">Abrir perfil completo →</button>`;
      } else if (zone === 'parroquia') content.innerHTML = `<h3>${copy[0]}</h3><p>${copy[1]}</p>`;
      else content.innerHTML = `<h3>${copy[0]}</h3><p>${copy[1]}</p><button data-world-action="${zone}">${copy[2]} →</button>`;
      if (zone === 'parroquia') {
        if (dailyWord && dailyWord.parentNode) dailyWord.remove();
        try { document.dispatchEvent(new CustomEvent('cafasso:parish-open')); } catch (error) { /* custom events may be unavailable */ }
      }
    };
    old.querySelectorAll('[data-zone]').forEach(zone => zone.addEventListener('click', () => openPanel(zone.dataset.zone)));
    panel.querySelector('.close').addEventListener('click', () => panel.classList.remove('show'));
    panel.addEventListener('click', event => {
      const action = event.target.closest('[data-world-action]');
      if (!action) return;
      const zone = action.dataset.worldAction;
      if (zone === 'escuela' || zone === 'patio') courseButton?.click();
      if (zone === 'casa') showProfile();
      if (zone === 'parroquia') document.getElementById('cafassoDailyWord')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    reveal();
  }

  function boot() {
    const observer = new MutationObserver(() => {
      document.querySelectorAll('.cafasso-daily-word').forEach(node => {
        dailyWordRef = node;
        if (!node.closest('.cafasso-world-panel')) node.remove();
      });
      if (isHome()) buildWorld();
    });
    observer.observe(document.getElementById('app') || document.body, { childList: true, subtree: true });
    window.addEventListener('hashchange', () => setTimeout(buildWorld, 80));
    if (!isHome() && location.hash !== '#cursos') reveal();
    buildWorld();
    const touchWhenReady = () => {
      if (window.CafassoAnimatorState?.session) { touchRuah(); return true; }
      return false;
    };
    if (!touchWhenReady()) {
      const wait = setInterval(() => { if (touchWhenReady()) clearInterval(wait); }, 250);
      setTimeout(() => clearInterval(wait), 12000);
    }
    setTimeout(buildWorld, 220);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true }); else boot();
})();

