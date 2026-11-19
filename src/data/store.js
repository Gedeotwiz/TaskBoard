const initialMembers = [
  { id: 'm1', name: 'Jordan Davis', initials: 'JD', color: '#7657e8' },
  { id: 'm2', name: 'Maya Chen', initials: 'MC', color: '#e88762' },
  { id: 'm3', name: 'Alex Morgan', initials: 'AM', color: '#39a98b' },
  { id: 'm4', name: 'Sam Rivera', initials: 'SR', color: '#5080df' },
];

const dateAfter = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
};

const defaultProjects = [
  {
    id: 'p1',
    name: 'Product Launch',
    description: 'Plan and deliver the next product launch.',
    color: '#7355e9',
  },
];

const read = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch {
    return fallback;
  }
};

export const formDraftKey = 'taskboard-form-draft';
export const TASKS_API_URL = 'https://task-board-server-73bb.onrender.com/api/tasks';
export const MEMBER_API_URL = 'https://task-board-server-73bb.onrender.com/api/members';
export const state = {
  members: read('taskboard-members', initialMembers),
  projects: read('taskboard-projects', defaultProjects),
  tasks: [],
  selectedProjectId: read('taskboard-selected-project', 'p1'),
  view: 'board',
  query: '',
  filter: 'all',
  sort: 'default',
};

if (!state.projects.length) state.projects = defaultProjects;
state.members = state.members.map((member) => ({
  ...member,
  projectIds: member.projectIds || state.projects.map((project) => project.id),
}));
if (!state.projects.some((project) => project.id === state.selectedProjectId)) {
  state.selectedProjectId = state.projects[0].id;
}

export const statuses = [
  { id: 'todo', label: 'To do', icon: '○' },
  { id: 'progress', label: 'In progress', icon: '◷' },
  { id: 'done', label: 'Completed', icon: '✓' },
];

export const currentProject = () =>
  state.projects.find((project) => project.id === state.selectedProjectId) ||
  state.projects[0];

export const projectTasks = (projectId = state.selectedProjectId) =>
  state.tasks.filter((task) => task.projectId === projectId);

export const projectMembers = (projectId = state.selectedProjectId) =>
  state.members.filter((member) => member.projectIds.includes(projectId));

export const persist = () => {
  localStorage.setItem('taskboard-members', JSON.stringify(state.members));
  localStorage.setItem('taskboard-projects', JSON.stringify(state.projects));
  localStorage.setItem(
    'taskboard-selected-project',
    JSON.stringify(state.selectedProjectId),
  );
};
