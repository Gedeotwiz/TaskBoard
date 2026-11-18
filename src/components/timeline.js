import { state, statuses } from '../data/store.js';
import { avatar, esc, filteredTasks } from '../utils.js';

export function renderTimeline() {
  const upcoming = filteredTasks()
    .filter((task) => task.due)
    .sort((a, b) => a.due.localeCompare(b.due));
  const rows = upcoming
    .map((task) => {
      const date = new Date(`${task.due}T12:00:00`);
      const assignees = state.members
        .filter((member) => task.members.includes(member.id))
        .map((member) => avatar(member, true))
        .join('');
      return `<div class="timeline-row"><div class="timeline-date"><strong>${date.toLocaleDateString(undefined, { day: '2-digit' })}</strong><span>${date.toLocaleDateString(undefined, { month: 'short' })}</span></div><div class="timeline-marker marker-${task.status}"></div><button class="timeline-task" data-edit="${task.id}"><span class="tag tag-${esc(task.category.toLowerCase())}">${esc(task.category)}</span><strong>${esc(task.title)}</strong><span class="timeline-status">${statuses.find((status) => status.id === task.status).label}</span><span class="avatar-stack">${assignees}</span></button></div>`;
    })
    .join('');

  return `<section class="view-panel"><div class="view-heading"><div><p class="eyebrow">PROJECT SCHEDULE</p><h2>Task timeline</h2></div><span class="muted">${upcoming.length} scheduled tasks</span></div><div class="timeline-list">${rows || '<p class="empty-state">Add a due date to a task to see it here.</p>'}</div></section>`;
}
