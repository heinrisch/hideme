let replacements = [];

const ELEMENTS = {
  list: () => document.getElementById('replacementList'),
  addButton: () => document.getElementById('addButton'),
  findInput: () => document.getElementById('findInput'),
  replaceInput: () => document.getElementById('replaceInput')
};

async function loadSettings() {
  const result = await chrome.storage.sync.get(['replacements']);
  replacements = result.replacements || [];
  renderReplacements();
}

async function saveSettings() {
  await chrome.storage.sync.set({ replacements });
}

function renderReplacements() {
  const list = ELEMENTS.list();

  if (!replacements.length) {
    list.innerHTML = `
      <div class="empty-state">
        <svg class="empty-state-icon" width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1ZM12 11.99H19C18.47 16.11 15.72 19.78 12 20.93V12H5V6.3L12 3.19V11.99Z" fill="currentColor"/>
        </svg>
        <p><strong>No custom replacements yet</strong><br>Add your personal information below to start protecting your privacy!</p>
      </div>`;
    return;
  }

  list.innerHTML = replacements.map((item, index) => `
    <div class="replacement-item">
      <div class="replacement-content">
        <div class="replacement-row">
          <span class="replacement-label">Find:</span>
          <span class="replacement-value">${escapeHtml(item.find)}</span>
        </div>
        <div class="replacement-row">
          <span class="replacement-label">Replace:</span>
          <span class="replacement-value">${escapeHtml(item.replace)}</span>
        </div>
        <div class="replacement-info"><span class="info-badge">Case-insensitive</span></div>
      </div>
      <button class="btn-delete" data-index="${index}" title="Delete replacement">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7H6V19ZM19 4H15.5L14.5 3H9.5L8.5 4H5V6H19V4Z" fill="currentColor"/>
        </svg>
      </button>
    </div>`).join('');

  list.querySelectorAll('.btn-delete').forEach(btn =>
    btn.addEventListener('click', handleDelete)
  );
}

async function handleAdd() {
  const findInput = ELEMENTS.findInput();
  const replaceInput = ELEMENTS.replaceInput();
  const find = findInput.value.trim();
  const replace = replaceInput.value.trim();

  if (!find || !replace) {
    if (!find) findInput.style.borderColor = 'var(--danger)';
    if (!replace) replaceInput.style.borderColor = 'var(--danger)';
    (!find ? findInput : replaceInput).focus();
    return;
  }

  findInput.style.borderColor = replaceInput.style.borderColor = '';

  replacements.push({ find, replace, caseInsensitive: true });

  findInput.value = replaceInput.value = '';
  await saveSettings();
  renderReplacements();
  findInput.focus();

  showSuccessFeedback();
}

function showSuccessFeedback() {
  const btn = ELEMENTS.addButton();
  const originalHtml = btn.innerHTML;

  btn.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor"/>
    </svg> Added!`;
  btn.style.background = 'var(--success)';

  setTimeout(() => {
    btn.innerHTML = originalHtml;
    btn.style.background = '';
  }, 1500);
}

async function handleDelete(e) {
  if (confirm('Are you sure you want to delete this replacement?')) {
    replacements.splice(parseInt(e.currentTarget.dataset.index), 1);
    await saveSettings();
    renderReplacements();
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

document.addEventListener('DOMContentLoaded', async () => {
  const confirmed = confirm(
    '⚠️ PRIVACY WARNING ⚠️\n\n' +
    'This page will display your personal information that you want to hide.\n\n' +
    'Make sure you are NOT currently:\n' +
    '• Screen sharing\n' +
    '• Recording your screen\n' +
    '• Streaming\n\n' +
    'Click OK only when you are in a private environment.'
  );

  if (!confirmed) {
    window.close();
    return;
  }

  await loadSettings();

  ELEMENTS.addButton().addEventListener('click', handleAdd);

  ELEMENTS.findInput().addEventListener('keypress', e => {
    if (e.key === 'Enter') ELEMENTS.replaceInput().focus();
  });

  ELEMENTS.replaceInput().addEventListener('keypress', e => {
    if (e.key === 'Enter') handleAdd();
  });

  [ELEMENTS.findInput(), ELEMENTS.replaceInput()].forEach(input => {
    input.addEventListener('input', () => input.style.borderColor = '');
  });
});
