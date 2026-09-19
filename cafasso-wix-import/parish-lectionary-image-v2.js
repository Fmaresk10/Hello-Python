(() => {
  const params = new URLSearchParams(location.search);
  if (params.get('space') !== 'parroquia') return;
  if (window.__cafassoParishLectionaryImageV2Installed) return;
  window.__cafassoParishLectionaryImageV2Installed = true;

  const IMAGE_URL = 'https://static.wixstatic.com/media/47bf07_cc8859dac793489ab88eec337ab07645~mv2.png';
  const STYLE_ID = 'cafassoParishLectionaryImageV2Styles';

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .cafasso-parish-lectionary{
        overflow:visible!important;
        background:transparent!important;
        background-color:transparent!important;
        border:0!important;
        box-shadow:none!important;
        filter:drop-shadow(0 14px 10px rgba(41,27,18,.34))!important;
      }
      .cafasso-parish-lectionary:hover{
        filter:drop-shadow(0 18px 13px rgba(41,27,18,.40)) brightness(1.025)!important;
      }
      .cafasso-parish-lectionary:before,
      .cafasso-parish-lectionary:after,
      .cafasso-parish-lectionary > :not(.cafasso-parish-lectionary__image){
        display:none!important;
      }
      .cafasso-parish-lectionary__image{
        display:block!important;
        width:100%!important;
        height:100%!important;
        object-fit:contain!important;
        object-position:center!important;
        background:transparent!important;
        border:0!important;
        box-shadow:none!important;
        pointer-events:none!important;
        user-select:none!important;
      }
      @media(prefers-reduced-motion:reduce){
        .cafasso-parish-lectionary{transition:none!important}
      }
    `;
    document.head.appendChild(style);
  }

  function apply() {
    const lectionary = document.querySelector('.cafasso-parish-lectionary');
    if (!lectionary) return false;

    ensureStyles();

    lectionary.classList.remove('is-realistic');
    lectionary.dataset.realisticLectionary = 'image-v2';

    const existing = lectionary.querySelector('.cafasso-parish-lectionary__image');
    if (!existing) {
      lectionary.innerHTML = '';
      const image = document.createElement('img');
      image.className = 'cafasso-parish-lectionary__image';
      image.src = IMAGE_URL;
      image.alt = '';
      image.setAttribute('aria-hidden', 'true');
      image.draggable = false;
      lectionary.appendChild(image);
    } else if (existing.src !== IMAGE_URL) {
      existing.src = IMAGE_URL;
    }

    return true;
  }

  let attempts = 0;
  const wait = () => {
    if (apply()) return;
    attempts += 1;
    if (attempts < 80) setTimeout(wait, 75);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', wait, { once:true });
  } else {
    wait();
  }

  const observer = new MutationObserver(() => {
    const lectionary = document.querySelector('.cafasso-parish-lectionary');
    if (lectionary && !lectionary.querySelector('.cafasso-parish-lectionary__image')) apply();
  });
  observer.observe(document.documentElement, { childList:true, subtree:true });
})();