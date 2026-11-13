import './style.css';

const app = document.getElementById('app');
const initialMembers = [
    { id: 'm1', name: 'Jordan Davis', initials: 'JD', color: '#7657e8' },
    { id: 'm2', name: 'Maya Chen', initials: 'MC', color: '#e88762' },
    { id: 'm3', name: 'Alex Morgan', initials: 'AM', color: '#39a98b' },
    { id: 'm4', name: 'Sam Rivera', initials: 'SR', color: '#5080df' },
];
const today = new Date();
const dateAfter = (n) => {
    const d = new Date();
    d.setDate(d.getDate() + n);
    return d.toISOString().slice(0, 10);
};
const seedTasks = [
    {
        id: 't1',
        title: 'Design landing page layout',
        category: 'Design',
        status: 'todo',
        due: dateAfter(2),
        members: ['m1', 'm2'],
        subtasks: 4,
        done: 6,
        priority: 'High',
        description: 'Create a clean, welcoming landing page experience.',
    },
    {
        id: 't2',
        title: 'Research competitor apps',
        category: 'Research',
        status: 'todo',
        due: dateAfter(0),
        members: ['m3'],
        subtasks: 0,
        done: 0,
        priority: 'Medium',
        description: '',
    },
    {
        id: 't3',
        title: 'Prepare sprint planning notes',
        category: 'Planning',
        status: 'todo',
        due: dateAfter(4),
        members: ['m4'],
        subtasks: 0,
        done: 0,
        priority: 'Low',
        description: '',
    },
    {
        id: 't4',
        title: 'Build authentication flow',
        category: 'Development',
        status: 'progress',
        due: dateAfter(1),
        members: ['m1', 'm3'],
        subtasks: 3,
        done: 5,
        priority: 'High',
        description: 'Implement sign in, sign up, and password reset.',
    },
    {
        id: 't5',
        title: 'Write onboarding guide',
        category: 'Content',
        status: 'progress',
        due: dateAfter(3),
        members: ['m2'],
        subtasks: 2,
        done: 4,
        priority: 'Medium',
        description: '',
    },
    {
        id: 't6',
        title: 'Set up project repository',
        category: 'Development',
        status: 'done',
        due: dateAfter(-2),
        members: ['m1', 'm4'],
        subtasks: 0,
        done: 0,
        priority: 'Low',
        description: '',
    },
    {
        id: 't7',
        title: 'Create initial wireframes',
        category: 'Design',
        status: 'done',
        due: dateAfter(-3),
        members: ['m2'],
        subtasks: 0,
        done: 0,
        priority: 'Low',
        description: '',
    },
];
const read = (key, fallback) => {
    try {
        return JSON.parse(localStorage.getItem(key)) || fallback;
    } catch {
        return fallback;
    }
};
let members = read('taskboard-members', initialMembers);
let tasks = read('taskboard-tasks', seedTasks);
let view = 'board';
let query = '';
let filter = 'all';
let sort = 'default';
const statuses = [
    { id: 'todo', label: 'To do', icon: '○' },
    { id: 'progress', label: 'In progress', icon: '◷' },
    { id: 'done', label: 'Completed', icon: '✓' },
];
const esc = (value) =>
    String(value ?? '').replace(
        /[&<>"']/g,
        (c) =>
            ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
            c
            ],
    );
const formatDate = (value) =>
    value
        ? new Date(`${value}T12:00:00`).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
        })
        : 'No due date';
const persist = () => {
    localStorage.setItem('taskboard-tasks', JSON.stringify(tasks));
    localStorage.setItem('taskboard-members', JSON.stringify(members));
};
function avatar(member, small = false) {
    return `<span class="avatar ${small ? 'avatar-small' : ''}" style="--avatar:${member.color}" title="${esc(member.name)}">${esc(member.initials)}</span>`;
}
function filteredTasks() {
    let result = tasks.filter(
        (task) =>
            task.title.toLowerCase().includes(query.toLowerCase()) ||
            task.category.toLowerCase().includes(query.toLowerCase()),
    );
    if (filter !== 'all')
        result = result.filter((task) => task.priority.toLowerCase() === filter);
    if (sort === 'due')
        result = [...result].sort((a, b) =>
            (a.due || '9999').localeCompare(b.due || '9999'),
        );
    if (sort === 'name')
        result = [...result].sort((a, b) => a.title.localeCompare(b.title));
    return result;
}
function card(task) {
    const assigned = members.filter((m) => task.members.includes(m.id));
    const overdue = task.due && task.due < dateAfter(0) && task.status !== 'done';
    return `<article class="task-card" draggable="true" data-task="${task.id}">
    <div class="card-top"><span class="tag tag-${esc(task.category.toLowerCase())}">${esc(task.category)}</span><button class="icon-button task-menu" data-edit="${task.id}" aria-label="Edit task">•••</button></div>
    <button class="task-title" data-edit="${task.id}">${esc(task.title)}</button>
    ${task.description ? `<p class="task-description">${esc(task.description)}</p>` : ''}
    ${task.subtasks ? `<div class="subtask-line"><span class="check-square">✓</span><span>${task.done}/${task.subtasks} subtasks</span></div>` : ''}
    <div class="card-bottom"><div class="avatar-stack">${assigned.map((m) => avatar(m, true)).join('') || '<span class="unassigned">Unassigned</span>'}</div><span class="due ${overdue ? 'overdue' : task.status === 'done' ? 'complete-date' : ''}">${task.status === 'done' ? '✓ Done' : '◷'} ${formatDate(task.due)}</span></div>
  </article>`;
}
function board() {
    const visible = filteredTasks();
    return `<section class="board">${statuses
        .map((status, i) => {
            const inColumn = visible.filter((t) => t.status === status.id);
return `
  <div
    class="column column-${status.id}"
    data-status="${status.id}"
  >
    <div class="column-heading">
      <div>
        <span class="column-dot dot-${status.id}"></span>
        <h2>${status.label}</h2>
        <span class="count">${inColumn.length}</span>
      </div>

      <button
        class="icon-button column-menu"
        data-menu="${status.id}"
        aria-label="Column options"
      >
        •••
      </button>
    </div>

    <div class="column-cards">
      ${inColumn.map(card).join('')}
    </div>

    <button class="add-inline" data-add="${status.id}">
      <span>＋</span>
      Add a task
    </button>
  </div>
`;        })
        .join('')}</section>`;
}
function calendar() {
    const base = new Date();
    const start = new Date(base);
    start.setDate(base.getDate() - ((base.getDay() + 6) % 7));
    const days = Array.from({ length: 14 }, (_, i) => {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        const key = d.toISOString().slice(0, 10);
        return `<div class="calendar-day ${key === dateAfter(0) ? 'today' : ''}"><div class="day-heading"><span>${d.toLocaleDateString(undefined, { weekday: 'short' })}</span><strong>${d.getDate()}</strong></div>${filteredTasks()
            .filter((t) => t.due === key)
            .map(
                (t) =>
                    `<button class="calendar-task task-${t.status}" data-edit="${t.id}">${esc(t.title)}</button>`,
            )
            .join('')}</div>`;
    }).join('');
    return `<section class="view-panel"><div class="view-heading"><div><p class="eyebrow">PLAN AHEAD</p><h2>Your calendar</h2></div><span class="muted">${new Date().toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</span></div><div class="calendar-grid">${days}</div></section>`;
}
function timeline() {
    const upcoming = filteredTasks()
        .filter((t) => t.due)
        .sort((a, b) => a.due.localeCompare(b.due));
    return `<section class="view-panel"><div class="view-heading"><div><p class="eyebrow">PROJECT SCHEDULE</p><h2>Task timeline</h2></div><span class="muted">${upcoming.length} scheduled tasks</span></div><div class="timeline-list">${upcoming
            .map(
                (t) =>
                    `<div class="timeline-row"><div class="timeline-date"><strong>${new Date(`${t.due}T12:00:00`).toLocaleDateString(undefined, { day: '2-digit' })}</strong><span>${new Date(`${t.due}T12:00:00`).toLocaleDateString(undefined, { month: 'short' })}</span></div><div class="timeline-marker marker-${t.status}"></div><button class="timeline-task" data-edit="${t.id}"><span class="tag tag-${esc(t.category.toLowerCase())}">${esc(t.category)}</span><strong>${esc(t.title)}</strong><span class="timeline-status">${statuses.find((s) => s.id === t.status).label}</span><span class="avatar-stack">${members
                        .filter((m) => t.members.includes(m.id))
                        .map((m) => avatar(m, true))
                        .join('')}</span></button></div>`,
            )
            .join('') ||
        '<p class="empty-state">Add a due date to a task to see it here.</p>'
        }</div></section>`;
}
function membersView() {
    return `<section class="view-panel"><div class="view-heading"><div><p class="eyebrow">YOUR TEAM</p><h2>Members <span class="count">${members.length}</span></h2></div><button class="primary-button" id="add-member">＋ Add member</button></div><div class="member-grid">${members
        .map(
            (m) =>
                `<article class="member-card"><div class="member-profile">${avatar(m)}<div><strong>${esc(m.name)}</strong><span>Team member</span></div><button class="icon-button" data-member-delete="${m.id}" aria-label="Remove member">•••</button></div><div class="member-work"><span>Assigned tasks</span><strong>${tasks.filter((t) => t.members.includes(m.id) && t.status !== 'done').length}</strong></div><div class="member-tasks">${tasks
                    .filter((t) => t.members.includes(m.id))
                    .slice(0, 3)
                    .map(
                        (t) =>
                            `<div><span class="mini-dot dot-${t.status}"></span>${esc(t.title)}</div>`,
                    )
                    .join('') || '<span class="muted">No tasks assigned</span>'
                }</div></article>`,
        )
        .join('')}</div></section>`;
}

function render() {
  const visibleCount = tasks.filter(
    (t) => t.status !== 'done',
  ).length;

  app.innerHTML = `
    <header class="topbar">
      <a class="brand" href="#" aria-label="TaskBoard home">
        <span class="brand-mark">✓</span>
        <span>
          taskboard<span class="brand-period">.</span>
        </span>
      </a>

      <nav class="main-nav">
        ${[
          ['board', '▦', 'Board'],
          ['calendar', '▦', 'Calendar'],
          ['timeline', '↗', 'Timeline'],
          ['members', '♧', 'Members'],
        ]
          .map(
            ([id, icon, label]) => `
              <button
                class="nav-link ${view === id ? 'active' : ''}"
                data-view="${id}"
              >
                <span>${icon}</span>
                ${label}
              </button>
            `,
          )
          .join('')}
      </nav>

      <label class="search-box">
        <span>⌕</span>
        <input
          id="search"
          placeholder="Search tasks..."
          value="${esc(query)}"
        >
      </label>

      <button id="add-task" class="primary-button">
        ＋ <span>New task</span>
      </button>

      <button
        id="profile"
        class="profile-avatar"
        title="Your profile"
      >
        JD
      </button>
    </header>

    <main class="workspace">
      <section class="project-header">
        <div>
          <div class="project-kicker">
            <span class="project-icon">✳</span>
            PRODUCT TEAM
            <span class="slash">/</span>
            SPRINT 12
          </div>

          <h1>
            My project
            <span class="project-badge">Active sprint</span>
          </h1>

          <p class="project-summary">
            A little progress each day adds up to big results.
          </p>
        </div>

        <div class="header-actions">
          <button class="utility-button" id="filter-button">
            ☷ <span>Filter</span>
            ${filter !== 'all' ? '<i></i>' : ''}
          </button>

          <button class="utility-button" id="sort-button">
            ↕ <span>Sort</span>
          </button>

          <button class="utility-button" id="share-button">
            ↗ <span>Share</span>
          </button>
        </div>
      </section>

      <div class="board-meta">
        <div class="meta-tabs">
          <span class="meta-tab active">
            All tasks <b>${tasks.length}</b>
          </span>

          <span class="meta-tab">
            My tasks
            <b>
              ${tasks.filter((t) => t.members.includes('m1')).length}
            </b>
          </span>

          <span class="meta-tab">
            Needs attention
            <b class="attention-count">
              ${
                tasks.filter(
                  (t) => t.due < dateAfter(0) && t.status !== 'done',
                ).length
              }
            </b>
          </span>
        </div>

        <span class="team-label">
          ${visibleCount} tasks in progress

          <span class="avatar-stack">
            ${members
              .slice(0, 3)
              .map((m) => avatar(m, true))
              .join('')}
          </span>
        </span>
      </div>

      <div id="content">
        ${
          view === 'board'
            ? board()
            : view === 'calendar'
              ? calendar()
              : view === 'timeline'
                ? timeline()
                : membersView()
        }
      </div>

      <footer class="workspace-footer">
        <span>
          Made for focused work <span>✳</span>
        </span>

        <span>
          ${tasks.filter((t) => t.status === 'done').length}
          tasks completed this sprint
        </span>
      </footer>
    </main>

    <div id="modal-root"></div>
  `;

  wire();
}

function showModal(content) {
    document.getElementById('modal-root').innerHTML =
        `<div class="modal-backdrop" id="backdrop"><section class="modal" role="dialog" aria-modal="true">${content}</section></div>`;
    document.getElementById('backdrop').addEventListener('click', (e) => {
        if (e.target.id === 'backdrop') closeModal();
    });
    document.addEventListener('keydown', escModal, { once: true });
}
function escModal(e) {
    if (e.key === 'Escape') closeModal();
}
function closeModal() {
    document.getElementById('modal-root').innerHTML = '';
}
function taskModal(task = null, status = 'todo') {
    const editing = !!task;
    const selectedStatus = task?.status || status;
    showModal(
        `<form id="task-form" class="modal-form"><div class="modal-heading"><div><p class="eyebrow">${editing ? 'TASK DETAILS' : 'NEW TASK'}</p><h2>${editing ? 'Edit task' : 'Create a task'}</h2></div><button type="button" class="close-button" id="close-modal">×</button></div><label class="field-label">Task name<input name="title" required maxlength="100" placeholder="What needs to get done?" value="${esc(task?.title || '')}"></label><label class="field-label">Description <span class="optional">OPTIONAL</span><textarea name="description" rows="3" placeholder="Add a few details...">${esc(task?.description || '')}</textarea></label><div class="form-row"><label class="field-label">Status<select name="status">${statuses.map((s) => `<option value="${s.id}" ${s.id === selectedStatus ? 'selected' : ''}>${s.label}</option>`).join('')}</select></label><label class="field-label">Due date<input type="date" name="due" value="${esc(task?.due || '')}"></label></div><div class="form-row"><label class="field-label">Category<input name="category" maxlength="24" placeholder="e.g. Design" value="${esc(task?.category || 'General')}"></label><label class="field-label">Priority<select name="priority">${['Low', 'Medium', 'High'].map((p) => `<option ${p === (task?.priority || 'Medium') ? 'selected' : ''}>${p}</option>`).join('')}</select></label></div><fieldset class="assignee-field"><legend>Assignees</legend><div class="assignee-options">${members.map((m) => `<label class="assignee-option"><input type="checkbox" name="members" value="${m.id}" ${(task?.members || []).includes(m.id) ? 'checked' : ''}><span class="assignee-avatar" style="--avatar:${m.color}">${esc(m.initials)}</span><span>${esc(m.name)}</span></label>`).join('') || '<span class="muted">Add a team member first.</span>'}</div></fieldset><div class="modal-actions">${editing ? `<button type="button" class="delete-button" id="delete-task">Delete task</button>` : ''}<button type="button" class="secondary-button" id="cancel-modal">Cancel</button><button class="primary-button" type="submit">${editing ? 'Save changes' : 'Create task'}</button></div></form>`,
    );
    document.getElementById('close-modal').onclick = closeModal;
    document.getElementById('cancel-modal').onclick = closeModal;
    document.getElementById('task-form').onsubmit = (e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        const item = {
            id: task?.id || `t${Date.now()}`,
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
        if (editing) tasks = tasks.map((t) => (t.id === task.id ? item : t));
        else tasks.unshift(item);
        persist();
        closeModal();
        render();
    };
    const del = document.getElementById('delete-task');
    if (del)
        del.onclick = () => {
            tasks = tasks.filter((t) => t.id !== task.id);
            persist();
            closeModal();
            render();
        };
}
function memberModal() {
    showModal(
  `<form id="member-form" class="modal-form">
    <div class="modal-heading">
      <div>
        <p class="eyebrow">GROW YOUR TEAM</p>
        <h2>Add a member</h2>
      </div>
      <button type="button" class="close-button" id="close-modal">×</button>
    </div>

    <label class="field-label">
      Full name
      <input name="name" required maxlength="60" placeholder="e.g. Taylor Lee">
    </label>

    <label class="field-label">
      Email address
      <input type="email" name="email" placeholder="taylor@company.com">
    </label>

    <div class="modal-actions">
      <button type="button" class="secondary-button" id="cancel-modal">Cancel</button>
      <button class="primary-button" type="submit">Add member</button>
    </div>
  </form>`,
);
    document.getElementById('close-modal').onclick = closeModal;
    document.getElementById('cancel-modal').onclick = closeModal;
    document.getElementById('member-form').onsubmit = (e) => {
        e.preventDefault();
        const name = new FormData(e.currentTarget).get('name').trim();
        const initials = name
            .split(/\s+/)
            .map((x) => x[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();
        members.push({
            id: `m${Date.now()}`,
            name,
            initials,
            color: ['#7657e8', '#e88762', '#39a98b', '#5080df', '#ca6594'][
                members.length % 5
            ],
        });
        persist();
        closeModal();
        render();
    };
}
function wire() {
    document.querySelectorAll('[data-view]').forEach(
        (button) =>
        (button.onclick = () => {
            view = button.dataset.view;
            render();
        }),
    );
    document.getElementById('add-task').onclick = () => taskModal();
    document
        .querySelectorAll('[data-add]')
        .forEach(
            (button) => (button.onclick = () => taskModal(null, button.dataset.add)),
        );
    document
        .querySelectorAll('[data-edit]')
        .forEach(
            (button) =>
            (button.onclick = () =>
                taskModal(tasks.find((t) => t.id === button.dataset.edit))),
        );
    const search = document.getElementById('search');
    search.oninput = () => {
        query = search.value;
        const cursor = search.selectionStart;
        render();
        const input = document.getElementById('search');
        input.focus();
        input.setSelectionRange(cursor, cursor);
    };
    document.getElementById('filter-button').onclick = () => {
        const options = ['all', 'high', 'medium', 'low'];
        filter = options[(options.indexOf(filter) + 1) % options.length];
        render();
    };
    document.getElementById('sort-button').onclick = () => {
        const options = ['default', 'due', 'name'];
        sort = options[(options.indexOf(sort) + 1) % options.length];
        render();
    };
    document.getElementById('share-button').onclick = async () => {
        try {
            await navigator.clipboard.writeText(location.href);
            showToast('Project link copied to clipboard');
        } catch {
            showToast('You are viewing your private project');
        }
    };
    document.getElementById('profile').onclick = () =>
        showToast('Signed in as Jordan Davis');
    const addMember = document.getElementById('add-member');
    if (addMember) addMember.onclick = memberModal;
    document.querySelectorAll('[data-member-delete]').forEach(
        (button) =>
        (button.onclick = () => {
            const member = members.find(
                (m) => m.id === button.dataset.memberDelete,
            );
            if (!confirm(`Remove ${member.name} from the team?`)) return;
            members = members.filter((m) => m.id !== member.id);
            tasks = tasks.map((t) => ({
                ...t,
                members: t.members.filter((id) => id !== member.id),
            }));
            persist();
            render();
        }),
    );
    document
        .querySelectorAll('[data-menu]')
        .forEach(
            (button) =>
            (button.onclick = () =>
                showToast('Drag tasks between columns to update their status')),
        );
    document.querySelectorAll('.column').forEach((column) => {
        column.ondragover = (e) => {
            e.preventDefault();
            column.classList.add('drop-target');
        };
        column.ondragleave = (e) => {
            if (!column.contains(e.relatedTarget))
                column.classList.remove('drop-target');
        };
        column.ondrop = (e) => {
            e.preventDefault();
            column.classList.remove('drop-target');
            const id = e.dataTransfer.getData('text/plain');
            tasks = tasks.map((t) =>
                t.id === id ? { ...t, status: column.dataset.status } : t,
            );
            persist();
            render();
        };
    });
    document.querySelectorAll('.task-card').forEach((element) => {
        element.ondragstart = (e) => {
            e.dataTransfer.setData('text/plain', element.dataset.task);
            element.classList.add('dragging');
        };
        element.ondragend = () => element.classList.remove('dragging');
    });
}
function showToast(message) {
    const old = document.querySelector('.toast');
    if (old) old.remove();
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.append(toast);
    setTimeout(() => toast.remove(), 2600);
}
render();
