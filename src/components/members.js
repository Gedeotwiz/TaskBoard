import { projectMembers, projectTasks } from '../data/store.js';
import { avatar, esc } from '../utils.js';
import { MEMBER_API_URL } from '../data/store.js';

export function renderMembers() {
  const tasks = projectTasks();
  const members = projectMembers();
  const cards = members
    .map((member) => {
      const assignedTasks = tasks.filter((task) =>
        task.members.includes(member.id),
      );
      const activeCount = assignedTasks.filter(
        (task) => task.status !== 'done',
      ).length;
      const taskList = assignedTasks
        .slice(0, 3)
        .map(
          (task) =>
            `<div><span class="mini-dot dot-${task.status}"></span>${esc(task.title)}</div>`,
        )
        .join('');

      return `<article class="member-card"><div class="member-profile">${avatar(member)}<div><strong>${esc(member.name)}</strong><span>Team member</span></div><button class="icon-button" data-member-delete="${member.id}" aria-label="Remove member">•••</button></div><div class="member-work"><span>Assigned tasks</span><strong>${activeCount}</strong></div><div class="member-tasks">${taskList || '<span class="muted">No tasks assigned</span>'}</div></article>`;
    })
    .join('');

  return `<section class="view-panel"><div class="view-heading"><div><p class="eyebrow">YOUR TEAM</p><h2>Members <span class="count">${members.length}</span></h2></div><button class="primary-button" id="add-member">＋ Add member</button></div><div class="member-grid">${cards}</div></section>`;
}
