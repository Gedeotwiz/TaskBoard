import { projectMembers, state, statuses, TASKS_API_URL } from '../data/store.js';
import { esc, showToast } from '../utils.js';
import {
  closeModal,
  showModal,
  watchFormDraft,
  wireModalCloseButtons,
} from './modal.js';

export async function openTaskForm(
  task = null,
  status = 'todo',
  draft = null,
  refresh,
) {
  const editing = Boolean(task);
  const values = {
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || status,
    due: task?.due || '',
    category: task?.category || 'General',
    priority: task?.priority || 'Medium',
    members: task?.members || [],
    projectId: task?.projectId || state.selectedProjectId,
    ...draft?.values,
  };
  const assigneeProject = state.projects.find(
    (project) => project.id === values.projectId,
  );

  
showModal(
  `
    <form id="task-form" class="modal-form">

      <div class="modal-heading">
        <div>
          <p class="eyebrow">
            ${editing ? 'TASK DETAILS' : 'NEW TASK'}
          </p>

          <h2>
            ${editing ? 'Edit task' : 'Create a task'}
          </h2>
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
        Task name

        <input
          name="title"
          required
          maxlength="100"
          placeholder="What needs to get done?"
          value="${esc(values.title)}"
        >
      </label>

      <label class="field-label">
        Description
        <span class="optional">OPTIONAL</span>

        <textarea
          name="description"
          rows="3"
          placeholder="Add a few details..."
        >${esc(values.description)}</textarea>
      </label>

      <div class="form-row">

        <label class="field-label">
          Status

          <select name="status">
            ${statuses
              .map(
                (item) => `
                  <option
                    value="${item.id}"
                    ${item.id === values.status ? 'selected' : ''}
                  >
                    ${item.label}
                  </option>
                `
              )
              .join('')}
          </select>
        </label>

        <label class="field-label">
          Due date

          <input
            type="date"
            name="due"
            value="${esc(values.due)}"
          >
        </label>

      </div>

      <div class="form-row">

        <label class="field-label">
          Category

          <input
            name="category"
            maxlength="24"
            placeholder="e.g. Design"
            value="${esc(values.category)}"
          >
        </label>

        <label class="field-label">
          Priority

          <select name="priority">
            ${['Low', 'Medium', 'High']
              .map(
                (priority) => `
                  <option
                    ${priority === values.priority ? 'selected' : ''}
                  >
                    ${priority}
                  </option>
                `
              )
              .join('')}
          </select>
        </label>

      </div>

      <fieldset class="assignee-field">

        <legend>
          Assignees for ${esc(assigneeProject?.name || 'this project')}
        </legend>

        <div class="assignee-options">

          ${
            projectMembers(values.projectId)
              .map(
                (member) => `
                  <label class="assignee-option">

                    <input
                      type="checkbox"
                      name="members"
                      value="${member.id}"
                      ${values.members.includes(member.id) ? 'checked' : ''}
                    >

                    <span
                      class="assignee-avatar"
                      style="--avatar:${member.color}"
                    >
                      ${esc(member.initials)}
                    </span>

                    <span>${esc(member.name)}</span>

                  </label>
                `
              )
              .join('') ||
            '<span class="muted">Add a member to this project first.</span>'
          }

        </div>

      </fieldset>

      <div class="modal-actions">

        ${
          editing
            ? '<button type="button" class="delete-button" id="delete-task">Delete task</button>'
            : ''
        }

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
          ${editing ? 'Save changes' : 'Create task'}
        </button>

      </div>

    </form>
  `,
);

  wireModalCloseButtons();

  const form = document.getElementById('task-form');
  watchFormDraft(form, 'task', {
    taskId: task?.id || null,
    status: values.status,
  });
  form.onsubmit = (event) => {
    event.preventDefault();
    const submitButton = form.querySelector('[type="submit"]');
    submitButton.disabled = true;
    const data = new FormData(event.currentTarget);
    const updatedTask = {
      id: task?.id || `t${Date.now()}`,
      projectId: values.projectId,
      title: data.get('title').trim(),
      description: data.get('description').trim(),
      status: data.get('status'),
      due: data.get('due'),
      category: data.get('category').trim() || 'General',
      priority: data.get('priority'),
      members: data.getAll('members'),
      subtasks: task?.subtasks || 0,
      done: task?.done || 0,
    };

    const request = editing
      ? fetch(`${TASKS_API_URL}/${encodeURIComponent(task.id)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedTask),
        })
      : fetch(TASKS_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedTask),
        });

    request
      .then((response) => {
        if (!response.ok) throw new Error(`Request failed (${response.status})`);
        return response.json();
      })
      .then((result) => {
        const savedTask = result.task || result.data || result;
        if (editing) {
          state.tasks = state.tasks.map((item) =>
            item.id === task.id ? { ...updatedTask, ...savedTask } : item,
          );
        } else {
          state.tasks.unshift({ ...updatedTask, ...savedTask });
        }
        closeModal();
        refresh();
      })
      .catch((error) => {
        console.error('Error saving task:', error);
        showToast(`Could not ${editing ? 'update' : 'create'} task. Please try again.`);
        submitButton.disabled = false;
      });
  };

  const deleteButton = document.getElementById('delete-task');
  if (deleteButton) {
    deleteButton.onclick = () => {
      deleteButton.disabled = true;
      fetch(`${TASKS_API_URL}/${encodeURIComponent(task.id)}`, { method: 'DELETE' })
        .then((response) => {
          if (!response.ok) throw new Error(`Request failed (${response.status})`);
          state.tasks = state.tasks.filter((item) => item.id !== task.id);
          closeModal();
          refresh();
        })
        .catch((error) => {
          console.error('Error deleting task:', error);
          showToast('Could not delete task. Please try again.');
          deleteButton.disabled = false;
        });
    };
  }
}
