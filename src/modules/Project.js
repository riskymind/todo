import { toDate, isToday, isThisWeek, subDays } from "date-fns";

export default class Project {
  constructor(name) {
    this.name = name;
    this.tasks = [];
  }

  setName(name) {
    this.name = name;
  }

  getName() {
    return this.name;
  }

  setTasks(tasks) {
    this.tasks = tasks;
  }

  getTasks() {
    return this.tasks;
  }

  getTask(name) {
    return this.tasks.find((task) => {
      return task.getName() === name;
    });
  }

  contains(name) {
    return this.tasks.some((task) => {
      task.getName() === name;
    });
  }

  addTask(newTask) {
    if (this.getTask(newTask.name)) return;
    this.tasks.push(newTask);
  }

  deleteTask(taskName) {
    this.tasks = this.tasks.filter((task) => task.name !== taskName);
  }

  getTasksToday() {
    return this.tasks.filter((task) => {
      const taskDate = new Date(task.getFormattedDate());
      return isToday(toDate(taskDate));
    });
  }

  getTasksThisWeek() {
    return this.tasks.filter((task) => {
      const taskDate = new Date(task.getFormattedDate());
      return isThisWeek(subDays(toDate(taskDate), 1));
    });
  }
}
