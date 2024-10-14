const template = document.createElement("template");
template.innerHTML = `
	<link rel="stylesheet" type="text/css"
		href="${import.meta.url.match(/.*\//)[0]}/taskbox.css"/>
		
		<!-- The modal --> 
		<dialog>
		        <span class="close-button">&times;</span>
		        <div>
		            <label for="taskTitle">Title:</label>
		            <input type="text" id="taskTitle" size="25" maxlength="80" placeholder="Enter task title" autofocus/>
		        </div>
		        <div>
		            <label for="taskStatus">Status:</label>
		            <select id="taskStatus"></select>
		        </div>
		        <button type="submit" id="addTaskButton">Add Task</button>
		    </dialog>
`;

class TaskBox extends HTMLElement {

	#dialog;
	#taskTitleInput;
	#taskStatusDropdown;
	#addTaskButton;
	#newTaskCallback;

	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		this.shadowRoot.appendChild(template.content.cloneNode(true));

		this.#dialog = this.shadowRoot.querySelector('dialog');
		this.#taskTitleInput = this.shadowRoot.querySelector('#taskTitle');
		this.#taskStatusDropdown = this.shadowRoot.querySelector('#taskStatus');
		this.#addTaskButton = this.shadowRoot.querySelector('#addTaskButton');

		// Close the task box when the close button is clicked
		this.shadowRoot.querySelector('.close-button').addEventListener('click', () => this.close());

		// Handle the new task and add the task when button is clicked
		this.#addTaskButton.addEventListener('click', () => this.addNewTask());
	}

	show() {
		this.#dialog.showModal();
	}

	setStatuslist(list) {
		this.#taskStatusDropdown.textContent = ''; // Clearing existing options
		list.forEach(status => {
			const option = document.createElement('option');
			option.value = status;
			option.textContent = status;
			this.#taskStatusDropdown.appendChild(option);
		});
	}

	newTaskCallback(callback) {
		this.#newTaskCallback = callback;
	}

	// Takes the information for new task form user and sends it to taksview
	addNewTask() {
		const taskTitle = this.#taskTitleInput.value.trim();
		const taskStatus = this.#taskStatusDropdown.value;

		console.log(taskTitle, taskStatus);
		if (taskTitle && taskStatus) {
			if (this.#newTaskCallback) {
				const newTask = {
					title: taskTitle,
					status: taskStatus
				};
				console.log(newTask);
				this.#newTaskCallback(newTask);
				
				//console.log(newTask);
			}
			this.close();
		} else {
			alert("You need to add both a task title and a status.");
		}
	}

	// When the close "x" in the corner of the modal is clicked, close the modal
	close() {
		this.#dialog.close();
	}
}

customElements.define('task-box', TaskBox);