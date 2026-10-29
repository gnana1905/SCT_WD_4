/**
 * To-Do List Application
 * Clean, modern vanilla JavaScript implementation.
 */

// Application State
let tasks = [];
let currentFilter = 'all';
let editingTaskId = null;

// DOM Elements
const taskInput = document.getElementById('task');
const datetimeInput = document.getElementById('datetime');
const addBtn = document.getElementById('add');
const taskForm = document.getElementById('taskForm');
const listElement = document.getElementById('list');
const searchInput = document.getElementById('search');
const clearSearchBtn = document.getElementById('clearSearch');
const filterBtns = document.querySelectorAll('.filter-btn');
const themeBtn = document.getElementById('theme');
const emptyState = document.getElementById('emptyState');
const emptyTitle = document.getElementById('emptyTitle');
const emptySubtitle = document.getElementById('emptySubtitle');
const taskStats = document.getElementById('taskStats');
const clearCompletedBtn = document.getElementById('clearCompleted');

// Modal Elements
const editModal = document.getElementById('editModal');
const editForm = document.getElementById('editForm');
const editTaskText = document.getElementById('editTaskText');
const editTaskDate = document.getElementById('editTaskDate');
const closeModalBtn = document.getElementById('closeModalBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const saveEditBtn = document.getElementById('saveEditBtn');

// Counter Elements
const countAll = document.getElementById('countAll');
const countPending = document.getElementById('countPending');
const countCompleted = document.getElementById('countCompleted');

/**
 * Initialize Application
 */
function init() {
  loadTheme();
  loadTasks();
  setupEventListeners();
  render();
}

/**
 * Load theme preference from localStorage
 */
function loadTheme() {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark');
  } else if (!savedTheme && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.body.classList.add('dark');
  }
}

/**
 * Toggle theme between light and dark
 */
function toggleTheme() {
  const isDark = document.body.classList.toggle('dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

/**
 * Load tasks from localStorage with backwards compatibility
 */
function loadTasks() {
  try {
    const stored = localStorage.getItem('tasks') || localStorage.tasks || '[]';
    tasks = JSON.parse(stored);
    if (!Array.isArray(tasks)) tasks = [];
  } catch (e) {
    console.error('Error reading tasks from localStorage:', e);
    tasks = [];
  }

  // Ensure every task has a unique id
  tasks.forEach((t, index) => {
    if (!t.id) {
      t.id = 'task_' + Date.now() + '_' + index + '_' + Math.random().toString(36).substring(2, 6);
    }
  });
}

/**
 * Persist tasks to localStorage and re-render
 */
function save() {
  const json = JSON.stringify(tasks);
  localStorage.setItem('tasks', json);
  localStorage.tasks = json; // Backwards compatibility
  render();
}

/**
 * Format datetime-local string to clean, readable text
 * e.g., "2026-10-30T14:30" -> "Oct 30, 2026, 2:30 PM"
 */
function formatDateTime(dateTimeString) {
  if (!dateTimeString) return null;
  const date = new Date(dateTimeString);
  if (isNaN(date.getTime())) return dateTimeString;

  const options = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  };
  return date.toLocaleString(undefined, options);
}

/**
 * Check if a date string is overdue (in the past)
 */
function isOverdue(dateTimeString) {
  if (!dateTimeString) return false;
  const taskDate = new Date(dateTimeString);
  if (isNaN(taskDate.getTime())) return false;
  return taskDate.getTime() < Date.now();
}

/**
 * Add a new task
 */
function addTask() {
  const text = taskInput.value.trim();
  const date = datetimeInput.value;

  // Prevent empty or whitespace-only tasks
  if (!text) {
    taskInput.focus();
    return;
  }

  const newTask = {
    id: 'task_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    text: text,
    date: date || '',
    done: false,
    createdAt: Date.now()
  };

  tasks.unshift(newTask); // Add to the top of the list
  taskInput.value = '';
  datetimeInput.value = '';
  taskInput.focus();

  save();
}

/**
 * Toggle task completion state
 */
function toggle(taskIdOrIndex) {
  const task = typeof taskIdOrIndex === 'string'
    ? tasks.find(t => t.id === taskIdOrIndex)
    : tasks[taskIdOrIndex];

  if (task) {
    task.done = !task.done;
    save();
  }
}

/**
 * Delete a task
 */
function del(taskIdOrIndex) {
  if (typeof taskIdOrIndex === 'string') {
    tasks = tasks.filter(t => t.id !== taskIdOrIndex);
  } else if (typeof taskIdOrIndex === 'number' && tasks[taskIdOrIndex]) {
    tasks.splice(taskIdOrIndex, 1);
  }
  save();
}

/**
 * Open Edit Task Modal
 */
function editTask(taskIdOrIndex) {
  const task = typeof taskIdOrIndex === 'string'
    ? tasks.find(t => t.id === taskIdOrIndex)
    : tasks[taskIdOrIndex];

  if (!task) return;

  editingTaskId = task.id;
  editTaskText.value = task.text;
  editTaskDate.value = task.date || '';

  editModal.classList.add('active');
  editModal.setAttribute('aria-hidden', 'false');
  editTaskText.focus();
}

/**
 * Close Edit Modal
 */
function closeEditModal() {
  editModal.classList.remove('active');
  editModal.setAttribute('aria-hidden', 'true');
  editingTaskId = null;
}

/**
 * Save edited task
 */
function saveEditedTask() {
  if (!editingTaskId) return;

  const newText = editTaskText.value.trim();
  if (!newText) {
    editTaskText.focus();
    return;
  }

  const task = tasks.find(t => t.id === editingTaskId);
  if (task) {
    task.text = newText;
    task.date = editTaskDate.value;
    save();
  }

  closeEditModal();
}

/**
 * Clear all completed tasks
 */
function clearCompletedTasks() {
  const completedCount = tasks.filter(t => t.done).length;
  if (completedCount === 0) return;

  tasks = tasks.filter(t => !t.done);
  save();
}

/**
 * Update filter counts and footer statistics
 */
function updateCounts() {
  const total = tasks.length;
  const completed = tasks.filter(t => t.done).length;
  const pending = total - completed;

  if (countAll) countAll.textContent = total;
  if (countPending) countPending.textContent = pending;
  if (countCompleted) countCompleted.textContent = completed;

  if (taskStats) {
    taskStats.textContent = `${pending} task${pending === 1 ? '' : 's'} remaining`;
  }

  if (clearCompletedBtn) {
    clearCompletedBtn.style.display = completed > 0 ? 'inline-block' : 'none';
  }
}

/**
 * Render task list based on search and filters
 */
function render() {
  const query = (searchInput.value || '').trim().toLowerCase();

  // Show/hide search clear button
  if (clearSearchBtn) {
    clearSearchBtn.style.display = query ? 'block' : 'none';
  }

  // Filter tasks
  const filteredTasks = tasks.filter(t => {
    const matchesFilter =
      currentFilter === 'all' ||
      (currentFilter === 'completed' && t.done) ||
      (currentFilter === 'pending' && !t.done);

    const matchesSearch = !query || t.text.toLowerCase().includes(query);

    return matchesFilter && matchesSearch;
  });

  listElement.innerHTML = '';

  if (filteredTasks.length === 0) {
    emptyState.classList.add('visible');
    if (query) {
      emptyTitle.textContent = 'No matching tasks';
      emptySubtitle.textContent = `No tasks matched "${query}". Try a different keyword.`;
    } else if (currentFilter === 'completed') {
      emptyTitle.textContent = 'No completed tasks';
      emptySubtitle.textContent = 'Tasks you mark as completed will appear here.';
    } else if (currentFilter === 'pending') {
      emptyTitle.textContent = 'No pending tasks';
      emptySubtitle.textContent = 'All caught up! Add a new task above.';
    } else {
      emptyTitle.textContent = 'No tasks yet';
      emptySubtitle.textContent = 'Add a task above to get started with your day.';
    }
  } else {
    emptyState.classList.remove('visible');

    filteredTasks.forEach(task => {
      const li = document.createElement('li');
      li.className = `task-item ${task.done ? 'is-completed' : ''}`;
      li.dataset.id = task.id;

      // Format date badge
      let dateBadgeHtml = '';
      if (task.date) {
        const formatted = formatDateTime(task.date);
        const overdue = !task.done && isOverdue(task.date);
        dateBadgeHtml = `
          <div class="task-meta">
            <span class="date-badge ${overdue ? 'is-overdue' : ''}" title="${overdue ? 'Overdue task!' : 'Due date'}">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <span>${formatted}${overdue ? ' (Overdue)' : ''}</span>
            </span>
          </div>
        `;
      }

      li.innerHTML = `
        <div class="task-main">
          <label class="task-checkbox-wrap" aria-label="Mark task as ${task.done ? 'pending' : 'completed'}">
            <input 
              type="checkbox" 
              class="task-checkbox" 
              ${task.done ? 'checked' : ''}
              data-id="${task.id}"
            >
          </label>
          <div class="task-details">
            <span class="task-text ${task.done ? 'done' : ''}">${escapeHtml(task.text)}</span>
            ${dateBadgeHtml}
          </div>
        </div>
        <div class="actions">
          <button 
            type="button" 
            class="action-btn edit-btn" 
            data-id="${task.id}" 
            title="Edit task" 
            aria-label="Edit task"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
          <button 
            type="button" 
            class="action-btn delete-btn" 
            data-id="${task.id}" 
            title="Delete task" 
            aria-label="Delete task"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
          </button>
        </div>
      `;

      listElement.appendChild(li);
    });
  }

  updateCounts();
}

/**
 * Basic HTML escaping helper to prevent XSS
 */
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Setup Event Listeners
 */
function setupEventListeners() {
  // Add task button & form submit
  if (addBtn) addBtn.onclick = addTask;
  if (taskForm) {
    taskForm.onsubmit = (e) => {
      e.preventDefault();
      addTask();
    };
  }

  // Allow pressing Enter in task input
  if (taskInput) {
    taskInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        addTask();
      }
    });
  }

  // Search input live filter
  if (searchInput) {
    searchInput.oninput = render;
  }

  // Clear search button
  if (clearSearchBtn) {
    clearSearchBtn.onclick = () => {
      searchInput.value = '';
      render();
      searchInput.focus();
    };
  }

  // Filter tabs
  filterBtns.forEach(btn => {
    btn.onclick = () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.f || btn.dataset.filter || 'all';
      render();
    };
  });

  // Delegated event listener for task list items (Check, Edit, Delete)
  listElement.addEventListener('click', (e) => {
    // Checkbox click
    const checkbox = e.target.closest('.task-checkbox');
    if (checkbox) {
      const id = checkbox.dataset.id;
      toggle(id);
      return;
    }

    // Edit button click
    const editBtn = e.target.closest('.edit-btn');
    if (editBtn) {
      const id = editBtn.dataset.id;
      editTask(id);
      return;
    }

    // Delete button click
    const deleteBtn = e.target.closest('.delete-btn');
    if (deleteBtn) {
      const id = deleteBtn.dataset.id;
      del(id);
      return;
    }
  });

  // Theme toggle
  if (themeBtn) {
    themeBtn.onclick = toggleTheme;
  }

  // Clear completed tasks
  if (clearCompletedBtn) {
    clearCompletedBtn.onclick = clearCompletedTasks;
  }

  // Modal event listeners
  if (closeModalBtn) closeModalBtn.onclick = closeEditModal;
  if (cancelEditBtn) cancelEditBtn.onclick = closeEditModal;
  if (saveEditBtn) saveEditBtn.onclick = saveEditedTask;
  if (editForm) {
    editForm.onsubmit = (e) => {
      e.preventDefault();
      saveEditedTask();
    };
  }

  // Close modal when clicking on backdrop
  if (editModal) {
    editModal.addEventListener('click', (e) => {
      if (e.target === editModal) {
        closeEditModal();
      }
    });
  }

  // Escape key to close modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && editModal.classList.contains('active')) {
      closeEditModal();
    }
  });
}

// Global functions for backward compatibility with any inline triggers or tests
window.toggle = toggle;
window.del = del;
window.editTask = editTask;
window.save = save;
window.render = render;
window.addTask = addTask;

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', init);
if (document.readyState === 'interactive' || document.readyState === 'complete') {
  init();
}