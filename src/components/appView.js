import { currentProject, projectTasks, state } from '../data/store.js';
import { avatar, dateAfter, esc } from '../utils.js';

export function renderAppView(content) {
  const project = currentProject();
  const tasks = projectTasks();
  const inProgressCount = tasks.filter(
    (task) =>
      task.status === 'progress' &&
      task.title.toLowerCase().includes(state.query.toLowerCase()),
  ).length;
  const needsAttentionCount = tasks.filter(
    (task) =>
      task.due < dateAfter(0) &&
      task.status !== 'done' &&
      task.title.toLowerCase().includes(state.query.toLowerCase()),
  ).length;
  const navItems = [
    ['board', '▦', 'Board'],
    ['calendar', '▦', 'Calendar'],
    ['timeline', '↗', 'Timeline'],
    ['members', '♧', 'Members'],
  ];

  return `<header class="topbar">
    <a class="brand" href="#" aria-label="TaskBoard home"><span class="brand-mark">✓</span><span>taskboard<span class="brand-period">.</span></span></a>
    <nav class="main-nav">${navItems
      .map(
        ([id, icon, label]) =>
          `<button class="nav-link ${state.view === id ? 'active' : ''}" data-view="${id}"><span>${icon}</span>${label}</button>`,
      )
      .join('')}</nav>
    <label class="search-box"><span>⌕</span><input id="search" placeholder="Search tasks..." value="${esc(state.query)}"></label>
    <button id="add-task" class="primary-button">＋ <span>New task</span></button>
    <button id="profile" class="profile-avatar" title="Your profile">JD</button>
  </header>

  <div class="app-layout">
    <aside class="project-sidebar" aria-label="Projects">
      <div class="sidebar-heading"><span>WORKSPACE</span><span class="sidebar-project-count">${state.projects.length}</span></div>
      <div class="sidebar-section-label">YOUR PROJECTS</div>
      <nav class="project-list" aria-label="Select a project">${state.projects
        .map(
          (item) =>
            `<button class="project-nav-item ${item.id === state.selectedProjectId ? 'active' : ''}" data-project="${esc(item.id)}" ${item.id === state.selectedProjectId ? 'aria-current="page"' : ''}><span class="project-nav-icon">${item.id === 'p1' ? '✳' : '◈'}</span><span class="project-nav-name">${esc(item.name)}</span><span class="project-nav-count">${projectTasks(item.id).length}</span></button>`,
        )
        .join('')}</nav>
      <button class="sidebar-add-project" id="add-project">＋ <span>New project</span></button>
      <div class="sidebar-footer"><span class="sidebar-footer-mark">✓</span><span>Keep your work<br>moving forward</span></div>
    </aside>

    <main class="workspace">
      <section class="project-header">
        <div><div class="project-kicker"><span class="project-icon">✳</span> YOUR PROJECTS</div><h1>${esc(project.name)}</h1><p class="project-summary">${esc(project.description || 'Tasks and progress for this project.')}</p></div>
        <div class="header-actions">
          <button class="utility-button" id="filter-button">☷ <span>Filter</span>${state.filter !== 'all' ? '<i></i>' : ''}</button>
          <button class="utility-button" id="sort-button">↕ <span>Sort</span></button>
          <button class="utility-button" id="share-button">↗ <span>Share</span></button>
        </div>
      </section>

      <div class="board-meta"><div class="meta-tabs">
        <span class="meta-tab active">All tasks <b>${tasks.length}</b></span>
        <span class="meta-tab">My tasks <b>${tasks.filter((task) => task.members.includes('m1')).length}</b></span>
        <span class="meta-tab">Needs attention <b class="attention-count">${needsAttentionCount}</b></span>
      </div>
      <span class="team-label">${inProgressCount} tasks in progress<span class="avatar-stack">${state.members
        .slice(0, 3)
        .map((member) => avatar(member, true))
        .join('')}</span></span></div>

      <div id="content">${content}</div>
      <footer class="workspace-footer"><span>Made for focused work <span>✳</span></span><span>${tasks.filter((task) => task.status === 'done').length} tasks completed in this project</span></footer>
    </main>
  </div>
  <div id="modal-root"></div>`;
}
