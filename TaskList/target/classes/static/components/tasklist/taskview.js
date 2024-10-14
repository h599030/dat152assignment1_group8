import "./taskbox.js";
import "./tasklist.js";
const template = document.createElement("template");
template.innerHTML = `
<link rel="stylesheet" type="text/css" href="${import.meta.url.match(/.*\//)[0]}/taskview.css"/>

	<h1>Tasks</h1>
		<div id="message"><p>Waiting for server data.</p></div>

		<div id="newtask">
		    	<button type="button" id="newTaskBtn">New Task</button>
			</div>
			
	<!-- The task list -->
	<task-list></task-list>

	<!-- The Modal -->
	<task-box></task-box>
`;


class TaskView extends HTMLElement {
	#shadow
	#taskList = [];
	#taskBox;
	#newTaskBtn;

	constructor() {
		super();
		this.#shadow = this.attachShadow({mode : 'closed'});

		this.#shadow.appendChild(template.content.cloneNode(true));



		this.#taskList = this.#shadow.querySelector("task-list");
		this.#taskBox = this.#shadow.querySelector("task-box");
		const newTaskBtn = this.#shadow.querySelector("#newTaskBtn");

		newTaskBtn.addEventListener('click', () => this.#taskBox.show());

		this.#getTasks();
		this.#getStatuses();

		this.#taskBox.newTaskCallback((task) => this.#addTask(task));
		this.#taskList.changestatusCallback((id) => this.#updateStatus(id));
		this.#taskList.deletetaskCallback((id) => this.#deleteTask(id));
	}


	#updateMsg() {

		const numTasks = this.#taskList.getNumtasks();
		const msgElement = this.#shadow.querySelector("#message p");
		msgElement.textContent = `There are currently ${numTasks} tasks`;
	}

	async #getStatuses() {
		try {
			const response = await fetch(`${this.getAttribute('data-serviceurl')}/allstatuses`);
			const data = await response.json();
			console.log(data);
			if (data.responseStatus) {
				this.#taskList.setStatuseslist(data.allstatuses);
				this.#taskBox.setStatuslist(data.allstatuses);
			} else {
				console.error('Failed to load statuses.');
			}
		} catch (error) {
			console.error('Error fetching statuses:', error);
		}
	}

	async #getTasks() {
		try {
			const response = await fetch(`${this.getAttribute('data-serviceurl')}/tasklist`);
			const data = await response.json();
			console.log(data);
			if (data.responseStatus) {
				data.tasks.forEach(task => this.#taskList.showTask(task));
				this.#updateMsg();
				console.log(`number of tasks: ${this.#taskList.getNumtasks()}`);
			} else {
				console.error('Failed to load tasks.');
			}
		} catch (error) {
			console.error('Error fetching tasks:', error);
		}
	}

	async #addTask(task) {
		try {
			const response = await fetch(`${this.getAttribute('data-serviceurl')}/task`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(task)
			});
			const data = await response.json();
			if (data.responseStatus) {
				this.#taskList.showTask(data.task);  // Add the new task to the list
				this.#updateMsg(); // Update the number of tasks
			} else {
				console.error('Failed to add task.');
			}
		} catch (error) {
			console.error('Error adding task:', error);
		}
	}

	async #updateStatus(id) {

		try {
			const response = await fetch(`${this.getAttribute('data-serviceurl')}/task/${id}`, {
				method: 'PUT'
				
			});
			const data = await response.json();
			if (data.responseStatus) {
				this.#taskList.updateTask(data);
				console.log(`Task ${id} change`);
			} else {
				console.error('Failed to delete task.');
			}
		} catch (error) {
			console.error('Error deleting task:', error);
		}
	}



	async #deleteTask(id) {
		try {
			const response = await fetch(`${this.getAttribute('data-serviceurl')}/task/${id}`, {
				method: 'DELETE'
			});
			const data = await response.json();
			if (data.responseStatus) {
				this.#taskList.removeTask(id);  // Remove the task from the list
				console.log(`Task ${id} deleted`);
				this.#updateMsg();  // Update the number of tasks
			} else {
				console.error('Failed to delete task.');
			}
		} catch (error) {
			console.error('Error deleting task:', error);
		}
	}
}
customElements.define('task-view', TaskView);