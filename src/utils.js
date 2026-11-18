import { projectTasks, state } from './data/store.js';

export const dateAfter = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
};

export const esc = (value) =>
  String(value ?? '').replace(
    /[&<>"']/g,
    (character) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        character
      ],
  );

export const formatDate = (value) =>
  value
    ? new Date(`${value}T12:00:00`).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      })
    : 'No due date';

export const avatar = (member, small = false) =>
  `<span class="avatar ${small ? 'avatar-small' : ''}" style="--avatar:${member.color}" title="${esc(member.name)}">${esc(member.initials)}</span>`;

export const filteredTasks = () => {
  let result = projectTasks().filter(
    (task) =>
      task.title.toLowerCase().includes(state.query.toLowerCase()) ||
      task.category.toLowerCase().includes(state.query.toLowerCase()),
  );
  if (state.filter !== 'all') {
    result = result.filter(
      (task) => task.priority.toLowerCase() === state.filter,
    );
  }
  if (state.sort === 'due') {
    result = [...result].sort((a, b) =>
      (a.due || '9999').localeCompare(b.due || '9999'),
    );
  }
  if (state.sort === 'name') {
    result = [...result].sort((a, b) => a.title.localeCompare(b.title));
  }
  return result;
};

export const showToast = (message) => {
  document.querySelector('.toast')?.remove();
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.append(toast);
  setTimeout(() => toast.remove(), 2600);
};
