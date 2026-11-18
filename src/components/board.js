import { state, statuses } from '../data/store.js';
import { avatar, dateAfter, esc, filteredTasks, formatDate } from '../utils.js';

function taskCard(task) {
  const assigned = state.members.filter((member) =>
    task.members.includes(member.id),
  );
  const overdue = task.due && task.due < dateAfter(0) && task.status !== 'done';

  return `<article class="task-card" draggable="true" data-task="${task.id}">
    <div class="card-top"><span class="tag tag-${esc(task.category.toLowerCase())}">${esc(task.category)}</span><button class="icon-button task-menu" data-edit="${task.id}" aria-label="Edit task">•••</button></div>
    <button class="task-title" data-edit="${task.id}">${esc(task.title)}</button>
    ${task.description ? `<p class="task-description">${esc(task.description)}</p>` : ''}
    ${task.subtasks ? `<div class="subtask-line"><span class="check-square">✓</span><span>${task.done}/${task.subtasks} subtasks</span></div>` : ''}
    <div class="card-bottom"><div class="avatar-stack">${assigned.map((member) => avatar(member, true)).join('') || '<span class="unassigned">Unassigned</span>'}</div><span class="due ${overdue ? 'overdue' : task.status === 'done' ? 'complete-date' : ''}">${task.status === 'done' ? '✓ Done' : '◷'} ${formatDate(task.due)}</span></div>
  </article>`;
}

export function renderBoard() {
  const visibleTasks = filteredTasks();
  return `<section class="board">${statuses
    .map((status) => {
      const columnTasks = visibleTasks.filter(
        (task) => task.status === status.id,
      );
      return `<div class="column column-${status.id}" data-status="${status.id}">
        <div class="column-heading"><div><span class="column-dot dot-${status.id}"></span><h2>${status.label}</h2><span class="count">${columnTasks.length}</span></div><button class="icon-button column-menu" data-menu="${status.id}" aria-label="Column options">•••</button></div>
        <div class="column-cards">${columnTasks.map(taskCard).join('')}</div>
        <button class="add-inline" data-add="${status.id}"><span>＋</span>Add a task</button>
      </div>`;
    })
    .join('')}</section>`;
}
