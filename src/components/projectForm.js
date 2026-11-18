import { persist, state } from '../data/store.js';
import { esc } from '../utils.js';
import {
  closeModal,
  showModal,
  watchFormDraft,
  wireModalCloseButtons,
} from './modal.js';

export function openProjectForm(draft = null, refresh) {
  const values = { name: '', description: '', ...draft?.values };
  showModal(
    `<form id="project-form" class="modal-form"><div class="modal-heading"><div><p class="eyebrow">NEW WORKSPACE</p><h2>Create a project</h2></div><button type="button" class="close-button" id="close-modal">×</button></div><label class="field-label">Project name<input name="name" required maxlength="60" placeholder="e.g. Website redesign" value="${esc(values.name)}"></label><label class="field-label">Description <span class="optional">OPTIONAL</span><textarea name="description" rows="3" maxlength="180" placeholder="What is this project about?">${esc(values.description)}</textarea></label><div class="modal-actions"><button type="button" class="secondary-button" id="cancel-modal">Cancel</button><button class="primary-button" type="submit">Create project</button></div></form>`,
  );
  wireModalCloseButtons();
  const form = document.getElementById('project-form');
  watchFormDraft(form, 'project');
  form.onsubmit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const project = {
      id: `p${Date.now()}`,
      name: data.get('name').trim(),
      description: data.get('description').trim(),
      color: '#7355e9',
    };
    state.projects.push(project);
    state.selectedProjectId = project.id;
    persist();
    closeModal();
    refresh();
  };
}
