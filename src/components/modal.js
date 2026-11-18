import { formDraftKey } from '../data/store.js';

export function showModal(content) {
  document.getElementById('modal-root').innerHTML =
    `<div class="modal-backdrop" id="backdrop"><section class="modal" role="dialog" aria-modal="true">${content}</section></div>`;
  document.getElementById('backdrop').addEventListener('click', (event) => {
    if (event.target.id === 'backdrop') closeModal();
  });
  document.addEventListener('keydown', handleModalKeydown, { once: true });
}

function handleModalKeydown(event) {
  if (event.key === 'Escape') closeModal();
}

export function saveFormDraft(type, metadata, form) {
  const values = Object.fromEntries(
    [...new FormData(form)].filter(([name]) => name !== 'members'),
  );
  if (form.querySelector('[name="members"]')) {
    values.members = [...form.querySelectorAll('[name="members"]:checked')].map(
      (input) => input.value,
    );
  }
  localStorage.setItem(
    formDraftKey,
    JSON.stringify({ type, ...metadata, values }),
  );
}

export function watchFormDraft(form, type, metadata = {}) {
  const save = () => saveFormDraft(type, metadata, form);
  form.addEventListener('input', save);
  form.addEventListener('change', save);
  save();
}

export function readFormDraft() {
  try {
    return JSON.parse(localStorage.getItem(formDraftKey));
  } catch {
    return null;
  }
}

export function clearFormDraft() {
  localStorage.removeItem(formDraftKey);
}

export function closeModal() {
  document.getElementById('modal-root').innerHTML = '';
  clearFormDraft();
}

export function wireModalCloseButtons() {
  document.getElementById('close-modal').onclick = closeModal;
  document.getElementById('cancel-modal').onclick = closeModal;
}
