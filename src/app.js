import {
  currentProject,
  MEMBER_API_URL,
  persist,
  state,
  TASKS_API_URL,
} from './data/store.js';
import { renderAppView } from './components/appView.js';
import { renderBoard } from './components/board.js';
import { renderCalendar } from './components/calendar.js';
import { renderMembers } from './components/members.js';
import { clearFormDraft, readFormDraft } from './components/modal.js';
import { openMemberForm } from './components/memberForm.js';
import { openProjectForm } from './components/projectForm.js';
import { openTaskForm } from './components/taskForm.js';
import { renderTimeline } from './components/timeline.js';
import { showToast } from './utils.js';

const app = document.getElementById('app');

function renderContent() {
  if (state.view === 'calendar') return renderCalendar();
  if (state.view === 'timeline') return renderTimeline();
  if (state.view === 'members') return renderMembers();
  return renderBoard();
}

function render() {
  app.innerHTML = renderAppView(renderContent());
  wire();
}

function restoreFormDraft() {
  const draft = readFormDraft();
  if (!draft) return;

  if (draft.type === 'member') {
    openMemberForm(draft, render);
    return;
  }
  if (draft.type === 'project') {
    openProjectForm(draft, render);
    return;
  }
  if (draft.type === 'task') {
    const task = draft.taskId
      ? state.tasks.find((item) => item.id === draft.taskId)
      : null;
    if (draft.taskId && !task) {
      clearFormDraft();
      return;
    }
    openTaskForm(task, draft.status || 'todo', draft, render);
    return;
  }
  clearFormDraft();
}

function wire() {
  document.querySelectorAll('[data-project]').forEach((button) => {
    button.onclick = () => {
      state.selectedProjectId = button.dataset.project;
      persist();
      render();
    };
  });

  document.getElementById('add-project').onclick = () =>
    openProjectForm(null, render);

  document.querySelectorAll('[data-view]').forEach((button) => {
    button.onclick = () => {
      state.view = button.dataset.view;
      render();
      restoreFormDraft();
    };
  });

  document.getElementById('add-task').onclick = () =>
    openTaskForm(null, 'todo', null, render);

  document.querySelectorAll('[data-add]').forEach((button) => {
    button.onclick = () => openTaskForm(null, button.dataset.add, null, render);
  });

  document.querySelectorAll('[data-edit]').forEach((button) => {
    button.onclick = () => {
      const task = state.tasks.find((item) => item.id === button.dataset.edit);
      if (task) openTaskForm(task, task.status, null, render);
    };
  });

  const search = document.getElementById('search');
  search.oninput = () => {
    state.query = search.value;
    const cursor = search.selectionStart;
    render();
    const input = document.getElementById('search');
    input.focus();
    input.setSelectionRange(cursor, cursor);
  };

  document.getElementById('filter-button').onclick = () => {
    const options = ['all', 'high', 'medium', 'low'];
    state.filter =
      options[(options.indexOf(state.filter) + 1) % options.length];
    render();
  };

  document.getElementById('sort-button').onclick = () => {
    const options = ['default', 'due', 'name'];
    state.sort = options[(options.indexOf(state.sort) + 1) % options.length];
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
  if (addMember) addMember.onclick = () => openMemberForm(null, render);

  document.querySelectorAll('[data-member-delete]').forEach((button) => {
    button.onclick = () => {
      const member = state.members.find(
        (item) => item.id === button.dataset.memberDelete,
      );
      if (!member) return;
      if (!confirm(`Remove ${member.name} from ${currentProject().name}?`)) {
        return;
      }
      const remainingProjectIds = member.projectIds.filter(
        (id) => id !== state.selectedProjectId,
      );
      const deleteMember = remainingProjectIds.length === 0;
      state.members = deleteMember
        ? state.members.filter((item) => item.id !== member.id)
        : state.members.map((item) =>
            item.id === member.id
              ? { ...item, projectIds: remainingProjectIds }
              : item,
          );
      state.tasks = state.tasks.map((task) => ({
        ...task,
        members:
          task.projectId === state.selectedProjectId || deleteMember
            ? task.members.filter((id) => id !== member.id)
            : task.members,
      }));
      persist();
      render();
    };
  });

  document.querySelectorAll('[data-menu]').forEach((button) => {
    button.onclick = () =>
      showToast('Drag tasks between columns to update their status');
  });

  document.querySelectorAll('.column').forEach((column) => {
    column.ondragover = (event) => {
      event.preventDefault();
      column.classList.add('drop-target');
    };
    column.ondragleave = (event) => {
      if (!column.contains(event.relatedTarget)) {
        column.classList.remove('drop-target');
      }
    };
    column.ondrop = (event) => {
      event.preventDefault();
      column.classList.remove('drop-target');
      const taskId = event.dataTransfer.getData('text/plain');
      const task = state.tasks.find((item) => String(item.id) === taskId);
      if (!task) return;
      const updatedTask = { ...task, status: column.dataset.status };
      fetch(`${TASKS_API_URL}/${encodeURIComponent(task.id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTask),
      })
        .then((response) => {
          if (!response.ok) throw new Error(`Request failed (${response.status})`);
          state.tasks = state.tasks.map((item) =>
            item.id === task.id ? updatedTask : item,
          );
          render();
        })
        .catch((error) => {
          console.error('Error updating task status:', error);
          showToast('Could not move task. Please try again.');
        });
    };
  });

  document.querySelectorAll('.task-card').forEach((element) => {
    element.ondragstart = (event) => {
      event.dataTransfer.setData('text/plain', element.dataset.task);
      element.classList.add('dragging');
    };
    element.ondragend = () => element.classList.remove('dragging');
  });
}

export function startApp() {
  Promise.all([
    fetch(TASKS_API_URL).then((response) => {
      if (!response.ok) throw new Error(`Tasks request failed (${response.status})`);
      return response.json();
    }),
    fetch(MEMBER_API_URL).then((response) => {
      if (!response.ok) throw new Error(`Members request failed (${response.status})`);
      return response.json();
    }),
  ])
    .then(([taskResult, memberResult]) => {
      const tasks = taskResult.tasks || taskResult.data || taskResult;
      const members = memberResult.members || memberResult.data || memberResult;
      if (!Array.isArray(tasks)) throw new Error('Unexpected tasks response');
      if (!Array.isArray(members)) throw new Error('Unexpected members response');

      state.tasks = tasks.map((task) => ({
        ...task,
        projectId: task.projectId || state.projects[0].id,
        members: task.members || [],
        subtasks: task.subtasks || 0,
        done: task.done || 0,
      }));
      state.members = members.map((member) => ({
        ...member,
        initials:
          member.initials ||
          member.name
            .split(/\s+/)
            .map((part) => part[0])
            .slice(0, 2)
            .join('')
            .toUpperCase(),
        color: member.color || '#7657e8',
        projectIds:
          member.projectIds ||
          (member.projectId ? [member.projectId] : state.projects.map((project) => project.id)),
      }));
      render();
      restoreFormDraft();
    })
    .catch((error) => {
      console.error('Error loading tasks:', error);
      render();
      showToast('Could not load tasks from the server.');
    });
}
