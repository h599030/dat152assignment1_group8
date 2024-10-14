const template = document.createElement("template");
template.innerHTML = `
    <link rel="stylesheet" type="text/css" href="${import.meta.url.match(/.*\//)[0]}/tasklist.css"/>

    <div id="tasklist"></div>`;

const tasktable = document.createElement("template");
tasktable.innerHTML = `
    <table>
        <thead><tr><th>Task</th><th>Status</th></tr></thead>
        <tbody></tbody>
    </table>`;

const taskrow = document.createElement("template");
taskrow.innerHTML = `
    <tr>
        <td></td>
        <td></td>
        <td>
            <select>
                <option value="0" selected>&lt;Modify&gt;</option>
            </select>
        </td>
        <td><button type="button">Remove</button></td>
    </tr>`;

/**
  * TaskList
  * Manage view with list of tasks
  */
class TaskList extends HTMLElement {
#shadow;
#headerAdded;
#statuses;
    constructor() {
        //super runs the constructor of the inherited class
        super();

        //Opprette shadow DOM structure
        this.#shadow = this.attachShadow({mode : 'closed'});
        
        // Legg til hovedmalen i Shadow DOM, dette inkulderer link til styleshhet og div elementet (alt innhold i const template på topp av siden)
        this.#shadow.appendChild(template.content.cloneNode(true));
        this.#headerAdded = false;
        
        this.#statuses = [];
    }

    /**
     * @public
     * @param {Array} list with all possible task statuses
     */
    setStatuseslist(allstatuses) {
        
        this.#statuses = allstatuses;
        
    }

    /**
     * Add callback to run on change on change of status of a task, i.e. on change in the SELECT element
     * @public
     * @param {function} callback
     */
    changestatusCallback(callback) {   
        
        const select = this.#shadow.querySelector('select');
        
        if(select) {
            select.addEventListener('change', (event) => {
               if(event.target.tagName === 'SELECT') {
                const taskRow = event.target.closest('tr'); //finner nærmeste overordnede tr
                const taskId = taskRow.getAttribute('data-taskId');
                const taskName = taskRow.querySelector('td:nth-child(1)').textContent;
                const newStatus = event.target.value; //setter ny status for select
                
                const confirmWindow = window.confirm(`Set ${taskName} to ${newStatus}?`);
                
                if(confirmWindow) {
                    
                    callback({id: taskId, status: newStatus});   
                    } else {
                        const selectElement = event.target;
                        const currentStatus = taskRow.querySelector('td:nth-child(2)').textContent;
                        selectElement.value = currentStatus;
                    }
               }
            });
        } 
    }

    /**
     * Add callback to run on click on delete button of a task
     * @public
     * @param {function} callback
     */
    deletetaskCallback(callback) {
        
       const deleteButton = this.#shadow.querySelector('button');
       
       if(deleteButton && deleteButton.textContent === 'Remove') {
            deleteButton.addEventListener('click', (event) => {
                    const taskRow = event.target.closest('tr');
                    const taskId = taskRow.getAttribute('data-taskId');
                    const taskName = taskRow.querySelector('td:nth-child(1)').textContent;
                    
                    const confirmWindow = window.confirm(`Delete task ${taskName}?`)
                    
                    if(confirmWindow) {
                        callback({id: taskId});
             }
        });
       }
    }

    /**
     * Add task at top in list of tasks in the view
     * @public
     * @param {Object} task - Object representing a task
     */
    showTask(task) {
        
        //henter tasklist fra shadow DOM
        const showTable = this.#shadow.querySelector('#tasklist');
        
        //sjekker at det finnes oppgaver og legger til header hvis ja
        if(task && task.id && task.title && task.status) {
            if(!this.#headerAdded){
                showTable.appendChild(tasktable.content.cloneNode(true));
                this.#headerAdded =  true;
            }
        }   
       
        //viser task i tbody elementet
        const tableBody = this.#shadow.querySelector('tbody');
        
        if(tableBody){

            // Klon og oppdater raden fra taskrow mal
            const tableRow = taskrow.content.cloneNode(true).querySelector('tr');
            tableRow.setAttribute("data-taskId", task.id);
            //Legger tittel på fremste/overste td
            tableRow.querySelector('td:nth-child(1)').textContent = task.title; 
            //Legger til status på andre td
            tableRow.querySelector('td:nth-child(2)').textContent = task.status;
            
            console.log(`Oppretter oppgave med ID: ${task.id}`);
            const select = tableRow.querySelector('select');
                        this.#statuses.forEach(status => {
                            const option = document.createElement('option');
                            option.value = status;
                            option.textContent = status;
                            
                            if(status === task.status) {
                                option.selected = true;
                            }
                            select.appendChild(option);
                        });
                        
            //legger siste task overst
            tableBody.prepend(tableRow);
            
            this.changestatusCallback((updatedTask) => { this.updateTask(updatedTask);});
            this.deletetaskCallback((removedTask) => { this.removeTask(removedTask.id);});
            } 
    }

    /**
     * Update the status of a task in the view
     * @param {Object} task - Object with attributes {'id':taskId,'status':newStatus}
     */
    updateTask(task) {
        const taskRow = this.#shadow.querySelector(`tr[data-taskId="${task.id}"]`);
        
        if(taskRow) {
            const selectElement = taskRow.querySelector('select');
            selectElement.value = task.status;
        
            taskRow.querySelector('td:nth-child(2)').textContent = task.status;
        
        }
    }

    /**
     * Remove a task from the view
     * @param {Integer} task - ID of task to remove
     */
    removeTask(id) {
        
        const tableBody = this.#shadow.querySelector('tbody');
        const tableHeader = this.#shadow.querySelector('thead');
        
        if (!tableBody) {
                console.error('Fant ikke tbody i DOM-en.');
                return;
            }
        
        const deleteRow = tableBody.querySelector(`tr[data-taskId="${id}"]`);
         
         
         if(deleteRow) {
            console.log('Oppgave er funnet: ', deleteRow);
            deleteRow.remove();
            console.log('Oppgave er fjernet');
            }
         
        if(tableBody.children.length === 0){
            tableHeader.remove();
            this.#headerAdded = false;
        }
    }

    /**
     * @public
     * @return {Number} - Number of tasks on display in view
     */
    getNumtasks() {
        
        const tasks = this.#shadow.querySelectorAll('tbody tr[data-taskId]');
        
        return tasks.length;
        
    }
}
//assigns custom tag (task-list) til componenten (TaskList)
customElements.define('task-list', TaskList);