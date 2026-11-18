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
state.tasks = read(
  'taskboard-tasks',
  seedTasks.map((task) => ({ ...task, projectId: 'p1' })),
).map((task) => ({
  ...task,
  projectId: task.projectId || state.projects[0].id,
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
  localStorage.setItem('taskboard-tasks', JSON.stringify(state.tasks));
  localStorage.setItem('taskboard-members', JSON.stringify(state.members));
  localStorage.setItem('taskboard-projects', JSON.stringify(state.projects));
  localStorage.setItem(
    'taskboard-selected-project',
    JSON.stringify(state.selectedProjectId),
  );
};
