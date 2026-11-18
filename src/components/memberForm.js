import { persist, state } from '../data/store.js';
import { esc } from '../utils.js';
import {
  closeModal,
  showModal,
  watchFormDraft,
  wireModalCloseButtons,
} from './modal.js';

export function openMemberForm(draft = null, refresh) {
  const values = {
    name: '',
    email: '',
    projectId: state.selectedProjectId,
    ...draft?.values,
  };
  showModal(
    `
    <form id="member-form" class="modal-form">

        <div class="modal-heading">
            <div>
                <p class="eyebrow">GROW YOUR TEAM</p>
                <h2>Add a member</h2>
            </div>

            <button
                type="button"
                class="close-button"
                id="close-modal"
            >
                ×
            </button>
        </div>

        <label class="field-label">
            Full name
            <input
                name="name"
                required
                maxlength="60"
                placeholder="e.g. Taylor Lee"
                value="${esc(values.name)}"
            >
        </label>

        <label class="field-label">
            Email address
            <input
                type="email"
                name="email"
                placeholder="taylor@company.com"
                value="${esc(values.email)}"
            >
        </label>

        <label class="field-label">
            Add to project
            <select name="projectId" required>
                ${state.projects
                    .map(
                        (project) => `
                            <option
                                value="${esc(project.id)}"
                                ${project.id === values.projectId ? "selected" : ""}
                            >
                                ${esc(project.name)}
                            </option>
                        `
                    )
                    .join("")}
            </select>
        </label>

        <div class="modal-actions">
            <button
                type="button"
                class="secondary-button"
                id="cancel-modal"
            >
                Cancel
            </button>

            <button
                class="primary-button"
                type="submit"
            >
                Add member
            </button>
        </div>

    </form>
    `
);
  wireModalCloseButtons();
  const form = document.getElementById('member-form');
  watchFormDraft(form, 'member');
  form.onsubmit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = data.get('name').trim();
    const initials = name
      .split(/\s+/)
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
    state.members.push({
      id: `m${Date.now()}`,
      name,
      initials,
      projectIds: [data.get('projectId')],
      color: ['#7657e8', '#e88762', '#39a98b', '#5080df', '#ca6594'][
        state.members.length % 5
      ],
    });
    persist();
    closeModal();
    refresh();
  };
}
