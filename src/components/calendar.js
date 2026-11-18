import { dateAfter, esc, filteredTasks } from '../utils.js';

export function renderCalendar() {
  const base = new Date();
  const start = new Date(base);
  start.setDate(base.getDate() - ((base.getDay() + 6) % 7));
  const days = Array.from({ length: 14 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    const key = date.toISOString().slice(0, 10);
    const tasks = filteredTasks().filter((task) => task.due === key);
    return `<div class="calendar-day ${key === dateAfter(0) ? 'today' : ''}"><div class="day-heading"><span>${date.toLocaleDateString(undefined, { weekday: 'short' })}</span><strong>${date.getDate()}</strong></div>${tasks
      .map(
        (task) =>
          `<button class="calendar-task task-${task.status}" data-edit="${task.id}">${esc(task.title)}</button>`,
      )
      .join('')}</div>`;
  }).join('');

  return `<section class="view-panel"><div class="view-heading"><div><p class="eyebrow">PLAN AHEAD</p><h2>Your calendar</h2></div><span class="muted">${new Date().toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</span></div><div class="calendar-grid">${days}</div></section>`;
}
