// content.js

const PLACEHOLDER = chrome.runtime.getURL('default.png');

function setupImage(img) {
  if (img.dataset._init) return;
    // 1. Measure and lock dimensions:
  const { width, height } = img.getBoundingClientRect();
  img.style.width  = `${width}px`;
  img.style.height = `${height}px`;

  img.dataset._init = true;
  // store original
  img.dataset.orig = img.src;
  img.src = PLACEHOLDER;
//   img.style.position = 'relative';

  // create the eye-button
  const btn = document.createElement('button');
  btn.textContent = '👁';
  Object.assign(btn.style, {
    position: 'absolute',
    top: '4px',
    right: '4px',
    padding: '2px 4px',
    fontSize: '0.8em',
    background: 'rgba(0,0,0,0.5)',
    color: 'white',
    border: 'none',
    borderRadius: '3px',
    cursor: 'pointer',
    zIndex: 999,
  });
  // track lock state
  img.dataset.locked = 'false';

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    e.preventDefault();
    const isLocked = img.dataset.locked === 'true';
    img.dataset.locked = (!isLocked).toString();
    btn.textContent = isLocked ? '👁' : '👁‍🗨';
    // force toggle
    img.src = isLocked ? PLACEHOLDER : img.dataset.orig;
  });

  // hover preview
  img.addEventListener('mouseover', () => {
    img.src = img.dataset.orig;
  });
  img.addEventListener('mouseout', () => {
    if (img.dataset.locked !== 'true') {
      img.src = PLACEHOLDER;
    }
  });

  // wrap in a container to allow absolute-positioned button
  const wrapper = document.createElement('span');
  wrapper.style.display = 'inline-block';
  wrapper.style.position = 'relative';
  img.parentNode.insertBefore(wrapper, img);
  wrapper.appendChild(img);
  wrapper.appendChild(btn);
}

function processAll() {
  document.querySelectorAll('img').forEach(setupImage);
}

function watchNew() {
  new MutationObserver((mx) => {
    mx.forEach(m => {
      m.addedNodes.forEach(node => {
        if (node.nodeName === 'IMG') setupImage(node);
        else if (node.querySelectorAll) {
          node.querySelectorAll('img').forEach(setupImage);
        }
      });
    });
  }).observe(document.body, { childList: true, subtree: true });
}

processAll();
watchNew();
