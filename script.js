class User {
  constructor(id, name, role) {
    this.id = id;
    this.name = name;
    this.role = role;
  }
}

class Task {
  constructor(id, name, description, assignedUser, dueDate, status, priority) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.assignedUser = assignedUser;
    this.dueDate = dueDate;
    this.status = status;
    this.priority = priority;
    this.createdAt = new Date().toLocaleString();
  }

  formatDescription() {
    return this.description.trim().charAt(0).toUpperCase() + this.description.trim().slice(1);
  }
}

class Project {
  constructor(name) {
    this.name = name;
    this.tasks = [];
    this.users = [];
  }

  addUser(user) {
    this.users.push(user);
  }

  createTask(task) {
    this.tasks.push(task);
    addNotification(`New task "${task.name}" assigned to ${task.assignedUser}`);
  }

  updateTask(id, updatedTask) {
    const index = this.tasks.findIndex(task => task.id === id);

    if (index !== -1) {
      this.tasks[index] = updatedTask;
      addNotification(`Task "${updatedTask.name}" was updated`);
    }
  }

  deleteTask(id) {
    const task = this.tasks.find(task => task.id === id);

    this.tasks = this.tasks.filter(task => task.id !== id);

    if (task) {
      addNotification(`Task "${task.name}" was deleted`);
    }
  }

  markComplete(id) {
    const task = this.tasks.find(task => task.id === id);

    if (task) {
      task.status = "Completed";
      addNotification(`Task "${task.name}" marked as completed`);
    }
  }

  assignTask(id, userName) {
    const task = this.tasks.find(task => task.id === id);

    if (task) {
      task.assignedUser = userName;
      addNotification(`Task "${task.name}" reassigned to ${userName}`);
    }
  }

  filterByStatus(status) {
    if (status === "All") {
      return this.tasks;
    }

    return this.tasks.filter(task => task.status === status);
  }

  sortTasksByPriority() {
    const priorityOrder = {
      High: 1,
      Medium: 2,
      Low: 3
    };

    this.tasks.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  }

  getReport() {
    const total = this.tasks.length;
    const pending = this.tasks.filter(task => task.status === "Pending").length;
    const progress = this.tasks.filter(task => task.status === "In Progress").length;
    const completed = this.tasks.filter(task => task.status === "Completed").length;

    const completionRate = total === 0 ? 0 : Math.round((completed / total) * 100);

    return {
      total,
      pending,
      progress,
      completed,
      completionRate
    };
  }
}

const project = new Project("Website Development Project");

project.addUser(new User(1, "Talha", "Project Manager"));
project.addUser(new User(2, "Ali", "Frontend Developer"));
project.addUser(new User(3, "Ahmed", "Backend Developer"));
project.addUser(new User(4, "Sara", "UI/UX Designer"));
project.addUser(new User(5, "Usman", "Tester"));

const taskForm = document.getElementById("taskForm");
const taskList = document.getElementById("taskList");
const assignedUser = document.getElementById("assignedUser");
const filterStatus = document.getElementById("filterStatus");
const notificationList = document.getElementById("notificationList");
const reportBox = document.getElementById("reportBox");
const taskNavigation = document.getElementById("taskNavigation");
const previousTask = document.getElementById("previousTask");
const nextTask = document.getElementById("nextTask");
const taskCounter = document.getElementById("taskCounter");
const viewButtons = document.querySelectorAll(".view-button");
const pageViews = document.querySelectorAll(".page-view");
const notificationCount = document.getElementById("notificationCount");

let visibleTasks = [];
let currentTaskIndex = 0;
let unreadNotifications = 0;

function showView(viewId) {
  pageViews.forEach(view => {
    view.hidden = view.id !== viewId;
  });

  viewButtons.forEach(button => {
    const isActive = button.dataset.view === viewId;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  if (viewId === "notificationView") {
    unreadNotifications = 0;
    notificationCount.textContent = "0";
    notificationCount.hidden = true;
  }
}

viewButtons.forEach(button => {
  button.addEventListener("click", function () {
    showView(button.dataset.view);
  });
});

function loadUsers() {
  project.users.forEach(user => {
    const option = document.createElement("option");
    option.value = user.name;
    option.textContent = `${user.name} - ${user.role}`;
    assignedUser.appendChild(option);
  });
}

taskForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const idValue = document.getElementById("taskId").value;

  const task = new Task(
    idValue ? Number(idValue) : Date.now(),
    document.getElementById("taskName").value,
    document.getElementById("taskDescription").value,
    document.getElementById("assignedUser").value,
    document.getElementById("dueDate").value,
    document.getElementById("status").value,
    document.getElementById("priority").value
  );

  if (idValue) {
    project.updateTask(Number(idValue), task);
  } else {
    project.createTask(task);
  }

  taskForm.reset();
  document.getElementById("taskId").value = "";

  displayTasks(project.tasks);
});

filterStatus.addEventListener("change", function () {
  const filteredTasks = project.filterByStatus(filterStatus.value);
  displayTasks(filteredTasks);
});

function displayTasks(tasks) {
  visibleTasks = tasks;
  currentTaskIndex = Math.min(currentTaskIndex, Math.max(tasks.length - 1, 0));
  taskList.innerHTML = "";

  if (tasks.length === 0) {
    taskList.innerHTML = "<p>No tasks found.</p>";
    taskNavigation.hidden = true;
    return;
  }

  const task = tasks[currentTaskIndex];
  const taskDiv = document.createElement("div");

  taskDiv.className = `task priority-${task.priority.toLowerCase()}`;

  taskDiv.innerHTML = `
      <h3>${task.name}</h3>
      <p><strong>Description:</strong> ${task.formatDescription()}</p>
      <p><strong>Assigned To:</strong> ${task.assignedUser}</p>
      <p><strong>Due Date:</strong> ${task.dueDate}</p>
      <p><strong>Status:</strong> ${task.status}</p>
      <p><strong>Priority:</strong> ${task.priority}</p>
      <p><strong>Created At:</strong> ${task.createdAt}</p>

      <div class="task-actions">
        <button onclick="editTask(${task.id})">Edit</button>
        <button class="complete-btn" onclick="completeTask(${task.id})">Complete</button>
        <button class="delete-btn" onclick="deleteTask(${task.id})">Delete</button>
      </div>
    `;

  taskList.appendChild(taskDiv);
  taskNavigation.hidden = false;
  taskCounter.textContent = `${currentTaskIndex + 1} of ${tasks.length}`;
  previousTask.disabled = currentTaskIndex === 0;
  nextTask.disabled = currentTaskIndex === tasks.length - 1;
}

previousTask.addEventListener("click", function () {
  if (currentTaskIndex > 0) {
    currentTaskIndex--;
    displayTasks(visibleTasks);
  }
});

nextTask.addEventListener("click", function () {
  if (currentTaskIndex < visibleTasks.length - 1) {
    currentTaskIndex++;
    displayTasks(visibleTasks);
  }
});

function editTask(id) {
  const task = project.tasks.find(task => task.id === id);

  if (task) {
    document.getElementById("taskId").value = task.id;
    document.getElementById("taskName").value = task.name;
    document.getElementById("taskDescription").value = task.description;
    document.getElementById("assignedUser").value = task.assignedUser;
    document.getElementById("dueDate").value = task.dueDate;
    document.getElementById("status").value = task.status;
    document.getElementById("priority").value = task.priority;
    showView("createView");
  }
}

function deleteTask(id) {
  project.deleteTask(id);
  displayTasks(project.tasks);
}

function completeTask(id) {
  project.markComplete(id);
  displayTasks(project.tasks);
}

function sortByPriority() {
  project.sortTasksByPriority();
  displayTasks(project.tasks);
  addNotification("Tasks sorted by priority");
}

function generateReport() {
  const report = project.getReport();

  reportBox.innerHTML = `
    <p><strong>Total Tasks:</strong> ${report.total}</p>
    <p><strong>Pending Tasks:</strong> ${report.pending}</p>
    <p><strong>In Progress Tasks:</strong> ${report.progress}</p>
    <p><strong>Completed Tasks:</strong> ${report.completed}</p>
    <p><strong>Completion Rate:</strong> ${report.completionRate}%</p>
  `;

  addNotification("Project progress report generated");
}

function addNotification(message) {
  const li = document.createElement("li");
  li.textContent = `${new Date().toLocaleTimeString()} - ${message}`;
  notificationList.prepend(li);

  if (document.getElementById("notificationView").hidden) {
    unreadNotifications++;
    notificationCount.textContent = unreadNotifications;
    notificationCount.hidden = false;
  }
}

loadUsers();
displayTasks(project.tasks);
showView("createView");