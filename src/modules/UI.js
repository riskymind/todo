import Project from "./Project";
import Storage from "./Storage";
import Task from "./Task";
import { format } from "date-fns";

export default class UI {
  static loadHomepage() {
    UI.loadProjects();
    UI.initProjectButtons();
    UI.openProject("Inbox", document.getElementById("button_inbox_projects"));
    document.addEventListener("keydown", UI.handleKeyboardInput);
  }

  static loadProjects() {
    Storage.getTodoList()
      .getProjects()
      .forEach((project) => {
        if (
          project.name !== "Inbox" &&
          project.name !== "Today" &&
          project.name !== "This week"
        ) {
          UI.createProject(project.name);
        }
      });
    UI.initAddProjectButtons();
  }

  static initAddProjectButtons() {
    const addProjectButton = document.getElementById("button_add_project");

    const addProjectPopupButton = document.getElementById(
      "button_add_project_popup"
    );

    const cancelProjectPopupButton = document.getElementById(
      "button_cancel_project_popup"
    );

    const addProjectPopupInput = document.getElementById(
      "input_add_project_popup"
    );

    addProjectButton.addEventListener("click", UI.openAddProjectPopup);
    addProjectPopupButton.addEventListener("click", UI.addProject);
    cancelProjectPopupButton.addEventListener("click", UI.closeAddProjectPopup);
    addProjectPopupInput.addEventListener(
      "keypress",
      UI.handleAddProjectInputPopup
    );
  }

  static openAddProjectPopup() {
    const addProjectPopup = document.getElementById("add_project_popup");
    const addProjectButton = document.getElementById("button_add_project");
    UI.closeAllPopups();
    addProjectPopup.classList.add("active");
    addProjectButton.classList.add("active");
  }

  static addProject() {
    const addProjectPopupInput = document.getElementById(
      "input_add_project_popup"
    );
    const projectName = addProjectPopupInput.value;

    if (projectName === "") {
      alert("Project name cannot be empty");
      return;
    }
    if (Storage.getTodoList().contains(projectName)) {
      addProjectPopupInput.value = "";
      alert("Project names must be different");
      return;
    }

    Storage.addProject(new Project(projectName));
    UI.createProject(projectName);
    UI.closeAddProjectPopup();
  }

  static closeAddProjectPopup() {
    const addProjectPopup = document.getElementById("add_project_popup");
    const addProjectButton = document.getElementById("button_add_project");
    const addProjectPopupInput = document.getElementById(
      "input_add_project_popup"
    );

    addProjectButton.classList.remove("active");
    addProjectPopup.classList.remove("active");
    addProjectPopupInput.value = "";
  }

  static handleAddProjectInputPopup(e) {
    if (e.key === "Enter") UI.addProject();
  }

  static closeAllPopups() {
    UI.closeAddProjectPopup();
  }

  // Create project
  static createProject(projectName) {
    const userProjects = document.getElementById("projects_list");
    userProjects.innerHTML += `
      <button class="button_project" data-project-button>
        <div class="left_project_panel">
          <i class="fas fa-tasks"></i>
          <span>${projectName}</span>
        </div>
        <div class="right_project_panel">
          <i class="fas fa-times"></i>
        </div>
      </button>
    `;
    UI.initProjectButtons();
  }

  static initProjectButtons() {
    const inboxProjectsButton = document.getElementById(
      "button_inbox_projects"
    );
    const todayProjectsButton = document.getElementById(
      "button_today_projects"
    );
    const weekProjectsButton = document.getElementById("button_week_projects");
    const projectButtons = document.querySelectorAll("[data-project-button]");
    const openNavButton = document.getElementById("button_open_nav");

    inboxProjectsButton.addEventListener("click", UI.openInboxTasks);
    todayProjectsButton.addEventListener("click", UI.openTodayTasks);
    weekProjectsButton.addEventListener("click", UI.openWeekTasks);

    openNavButton.addEventListener("click", UI.openNav);

    projectButtons.forEach((button) => {
      button.addEventListener("click", UI.handleProjectButton);
    });
  }

  static openInboxTasks() {
    UI.openProject("Inbox", this);
  }

  static openTodayTasks() {
    Storage.updateTodayProject();
    UI.openProject("Today", this);
  }

  static openWeekTasks() {
    Storage.updateWeekProject();
    UI.openProject("This week", this);
  }

  static openNav() {
    const nav = document.querySelector(".nav");

    UI.closeAllPopups();
    nav.classList.toggle("active");
  }

  static handleProjectButton(e) {
    const projectName = this.children[0].children[1].textContent;
    if (e.target.classList.contains("fa-times")) {
      UI.deleteProject(projectName, this);
      return;
    }
    UI.openProject(projectName, this);
  }

  static openProject(projectName, projectButton) {
    const defaultProjectButtons = document.querySelectorAll(
      ".button_default_project"
    );
    const projectButtons = document.querySelectorAll(".button_project");

    const buttons = [...defaultProjectButtons, ...projectButtons];

    buttons.forEach((btn) => btn.classList.remove("active"));
    projectButton.classList.add("active");

    UI.closeAddProjectPopup();
    UI.loadProjectContent(projectName);
  }

  static loadProjectContent(name) {
    const projectPreview = document.getElementById("project_preview");
    projectPreview.innerHTML = `
      <h1 class="project_name" id="project_name">${name}</h1>
      <div class="task_list" id="task_list"></div>`;

    if (name !== "Today" && name !== "This week") {
      projectPreview.innerHTML += `
            <button class="button_add_task" id="button_add_task"> 
              <i class="fas fa-plus"></i>
              Add Task
            </button>

            <div class="add_task_popup" id="add_task_popup">
              <input type="text" class="input_add_task_popup" id="input_add_task_popup"/>
              <div class="add_task_popup_buttons">
                <button class="button_add_task_popup" id="button_add_task_popup">Add</button>
                <button class="button_cancel_task_popup" id="button_cancel_task_popup">Cancel</button>
              </div>
            </div>            
          `;
    }

    UI.loadTasks(name);
  }

  static deleteProject(name, button) {
    if (button.classList.contains("active")) UI.clearProjectPreview();
    Storage.deleteProject(name);
    UI.clearProjects();
    UI.loadProjects();
  }

  static clearProjectPreview() {
    const projectPrev = document.getElementById("project_preview");
    projectPrev.textContent = "";
  }

  static clearProjects() {
    const projectList = document.getElementById("projects_list");
    projectList.textContent = "";
  }
  static handleKeyboardInput(e) {
    if (e.key === "Escape") {
      UI.closeAllPopups();
    }
  }

  // TASK
  static loadTasks(projectName) {
    // Get tasks from storage
    Storage.getTodoList()
      .getProject(projectName)
      .getTasks()
      .forEach((task) => UI.createTask(task.name, task.dueDate));

    if (projectName !== "Today" && projectName !== "This week") {
      UI.initAddTaskButtons();
    }
  }

  static initAddTaskButtons() {
    const addTaskButton = document.getElementById("button_add_task");
    const addTaskPopupButton = document.getElementById("button_add_task_popup");
    const cancelTaskPopupButton = document.getElementById(
      "button_cancel_task_popup"
    );
    const addTaskPopupInput = document.getElementById("input_add_task_popup");

    addTaskButton.addEventListener("click", UI.openAddTaskPopup);
    addTaskPopupButton.addEventListener("click", UI.addTask);
    cancelTaskPopupButton.addEventListener("click", UI.closeAddTaskPopup);
    addTaskPopupInput.addEventListener("keypress", UI.handleAddTaskPopupInput);
  }

  static openAddTaskPopup() {
    const addTaskPopup = document.getElementById("add_task_popup");
    const addTaskButton = document.getElementById("button_add_task");

    UI.closeAllPopups();
    addTaskPopup.classList.add("active");
    addTaskButton.classList.add("active");
  }

  static addTask() {
    const projectName = document.getElementById("project_name").textContent;
    const addTaskPopupInput = document.getElementById("input_add_task_popup");
    const taskName = addTaskPopupInput.value;

    if (taskName === "") {
      alert("Task name cannot be empty");
      return;
    }

    if (Storage.getTodoList().getProject(projectName).contains(taskName)) {
      alert("Task names must be different");
      addTaskPopupInput.value = "";
      return;
    }

    Storage.addTask(projectName, new Task(taskName));

    UI.createTask(taskName, "no Date");
    UI.closeAddTaskPopup();
  }

  static closeAddTaskPopup() {
    const addTaskPopup = document.getElementById("add_task_popup");
    const addTaskButton = document.getElementById("button_add_task");
    const addTaskInput = document.getElementById("input_add_task_popup");

    addTaskPopup.classList.remove("active");
    addTaskButton.classList.remove("active");
    addTaskInput.value = "";
  }

  static handleAddTaskPopupInput(e) {
    if (e.key === "Enter") UI.addTask();
  }

  static createTask(name, date) {
    const tasksList = document.getElementById("task_list");
    tasksList.innerHTML += `
      <button class="button_task" data-task-button>
        <div class="left_task_panel">
          <i class="far fa-circle"></i>
          <p class="task_content">${name}</p>
          <input type="text" class="input_task_name" data-input-task-name>
        </div>
        <div class="right_task_panel">
          <p class="due_date" id="due_date">${date}</p>
          <input type="date" class="input_due_date" data-input-due-date>
          <i class="fas fa-times"></i>
        </div>
      </button>
    `;

    UI.initTaskButtons();
  }

  static initTaskButtons() {
    const taskButtons = document.querySelectorAll("[data-task-button]");
    const taskNameInputs = document.querySelectorAll("[data-input-task-name]");
    const dueDateInputs = document.querySelectorAll("[data-input-due-date]");

    taskButtons.forEach((taskButton) => {
      taskButton.addEventListener("click", UI.hanldeTaskButton);
    });

    taskNameInputs.forEach((input) => {
      input.addEventListener("keypress", UI.renameTask);
    });

    dueDateInputs.forEach((input) => {
      input.addEventListener("change", UI.setTaskDate);
    });
  }

  static hanldeTaskButton(e) {
    if (e.target.classList.contains("fa-circle")) {
      UI.setTaskCompleted(this);
      return;
    }

    if (e.target.classList.contains("fa-times")) {
      UI.deleteTask(this);
      return;
    }

    if (e.target.classList.contains("task_content")) {
      UI.openRenameInput(this);
      return;
    }

    if (e.target.classList.contains("due_date")) {
      UI.openSetDateInput(this);
    }
  }

  static renameTask(e) {
    console.log("renaing");
    if (e.key !== "Enter") return;

    const projectName = document.getElementById("project_name").textContent;
    const taskName = this.previousElementSibling.textContent;
    const newTaskName = this.value;

    if (newTaskName === "") {
      alert("Task name can't be empty");
      return;
    }
    if (Storage.getTodoList().getProject(projectName).contains(newTaskName)) {
      this.value = "";
      alert("Task names must be different");
      return;
    }

    if (projectName === "Today" || projectName === "This week") {
      const mainProjectName = taskName.split("(")[1].split(")")[0];
      const mainTaskName = taskName.split(" ")[0];
      Storage.renameTask(
        projectName,
        taskName,
        `${newTaskName} (${mainProjectName})`
      );
      Storage.renameTask(mainProjectName, mainTaskName, newTaskName);
    } else {
      Storage.renameTask(projectName, taskName, newTaskName);
    }

    UI.clearTasks();
    UI.loadTasks(projectName);
    UI.closeRenameInput(this.parentNode.parentNode);
  }

  static setTaskDate() {
    const taskButton = this.parentNode.parentNode;
    const projectName = document.getElementById("project_name").textContent;
    const taskName = taskButton.children[0].children[1].textContent;
    const newDueDate = format(new Date(this.value), "dd/MM/yyyy");

    if (projectName === "Today" || projectName === "This week") {
      const mainProjectName = taskName.split("(")[1].split(")")[0];
      const mainTaskName = taskName.split(" (")[0];
      Storage.setTaskDate(projectName, taskName, newDueDate);
      Storage.setTaskDate(mainProjectName, mainTaskName, newDueDate);
      if (projectName === "Today") {
        Storage.updateTodayProject();
      } else {
        Storage.updateWeekProject();
      }
    } else {
      Storage.setTaskDate(projectName, taskName, newDueDate);
    }

    UI.clearTasks();
    UI.loadTasks(projectName);
    UI.closeSetDateInput(taskButton);
  }

  static setTaskCompleted(taskButton) {
    const projectName = document.getElementById("project_name").textContent;
    const taskName = taskButton.children[0].children[1].textContent;

    if (projectName === "Today" || projectName === "This week") {
      const parentProjectName = taskName.split("(")[1].split(")")[0];
      Storage.deleteTask(parentProjectName, taskName.split(" ")[0]);
      if (projectName === "Today") {
        Storage.updateTodayProject();
      } else {
        Storage.updateWeekProject();
      }
    } else {
      Storage.deleteTask(projectName, taskName);
    }

    UI.clearTasks();
    UI.loadTasks(projectName);
  }

  static deleteTask(taskButton) {
    const projectName = document.getElementById("project_name").textContent;
    const taskName = taskButton.children[0].children[1].textContent;
    if (projectName === "Today" || projectName === "This week") {
      const mainProjectName = taskName.split("(")[1].split(")")[0];
      Storage.deleteTask(mainProjectName, taskName);
    }
    Storage.deleteTask(projectName, taskName);
    UI.clearTasks();
    UI.loadTasks(projectName);
  }

  static openRenameInput(taskButton) {
    const taskNamePara = taskButton.children[0].children[1];
    let taskName = taskNamePara.textContent;
    const taskNameInput = taskButton.children[0].children[2];
    const projectName =
      taskButton.parentNode.parentNode.children[0].textContent;

    if (projectName === "Today" || projectName === "This week") {
      [taskName] = taskName.split(" (");
    }

    UI.closeAllPopups();
    taskNamePara.classList.add("active");
    taskNameInput.classList.add("active");
    taskNameInput.value = taskName;
  }

  static openSetDateInput(taskButton) {
    const dueDate = taskButton.children[1].children[0];
    const dueDateInput = taskButton.children[1].children[1];

    UI.closeAllPopups();
    dueDate.classList.add("active");
    dueDateInput.classList.add("active");
  }

  static clearTasks() {
    const tasksList = document.getElementById("task_list");
    tasksList.textContent = "";
  }

  static closeRenameInput(taskButton) {
    const taskName = taskButton.children[0].children[1];
    const taskNameInput = taskButton.children[0].children[2];

    taskName.classList.remove("active");
    taskNameInput.classList.remove("active");
    taskNameInput.value = "";
  }

  static closeSetDateInput(taskButton) {
    const dueDate = taskButton.children[1].children[0];
    const dueDateInput = taskButton.children[1].children[1];

    dueDate.classList.remove("active");
    dueDateInput.classList.remove("active");
  }
}
