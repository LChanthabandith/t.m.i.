// Defining variables for chart objects and task lists
let taskChart, projectChart;
let uncompletedTaskList = document.getElementById('uncompleted-task-list');
let completedTaskList = document.getElementById('completed-task-list');

// Event listener to add tasks when the 'add-task' button is clicked
document.getElementById('add-task').addEventListener('click', function() {
    // Getting form values
    var value = document.getElementById('new-task').value;
    var project = document.getElementById('new-project').value;
    var description = document.getElementById('new-description').value;
    var dueDate = document.getElementById('new-due-date').value;
    var reminder = document.getElementById('new-reminder').value;

    // If there's a task value
    if (value) {
        // Call the addTask function
        addTask(value, false, project, description, dueDate, reminder);

        // Clear the form
        document.getElementById('new-task').value = '';
        document.getElementById('new-project').value = '';
        document.getElementById('new-description').value = '';
        document.getElementById('new-due-date').value = '';
        document.getElementById('new-reminder').value = '';

        // Store the task into local storage
        storeTaskInLocalStorage(value, false, project, description, dueDate, reminder);

        // Update the task and project charts
        updateChart();
        updateProjectChart();
    }
});

// Function to add tasks
function addTask(text, completed = false, project, description, dueDate, reminder) {
    // Creating a new list item for the task
    var item = document.createElement('li');

    // Adding a checkbox to the task for completion status
    var checkBox = document.createElement('input');
    checkBox.type = 'checkbox';
    checkBox.checked = completed;
    checkBox.addEventListener('change', function() {
        // If checked, strikethrough task text
        taskText.style.textDecoration = this.checked ? 'line-through' : 'none';

        // Also update this task's completed status in the local storage
        updateTaskInLocalStorage(text, this.checked);

        // Update the charts
        updateChart();
        updateProjectChart();

        // Move task to the other list (completed or uncompleted)
        var newCompleted = this.checked ? completedTaskList : uncompletedTaskList;
        newCompleted.appendChild(item);
    });
    item.appendChild(checkBox);

    // Adding a task icon using an image element
    var img = document.createElement('img');
    img.src = 'images/task-icon.png';  // task icon image
    img.style.width = "15px";  // Image width
    img.style.height = "15px"; // Image height
    img.style.marginRight = "5px"; // Add space to the right of the icon
    item.appendChild(img);

    // Adding task text
    var taskText = document.createElement('span');
    taskText.innerText = text;
    taskText.style.textDecoration = completed ? 'line-through' : 'none';
    item.appendChild(taskText);

    // Add additional task information like project, description, due date, and reminder
    var projectText = document.createElement('span');
    projectText.innerText = project;
    projectText.className = 'project-text';
    item.appendChild(projectText);

    var descriptionText = document.createElement('span');
    descriptionText.innerText = description;
    descriptionText.className = 'description-text';
    item.appendChild(descriptionText);

    var dueDateText = document.createElement('span');
    dueDateText.innerText = 'Due Date: ' + dueDate;
    dueDateText.className = 'due-date-text';
    item.appendChild(dueDateText);

    var reminderText = document.createElement('span');
    reminderText.innerText = 'Reminder: ' + reminder;
    reminderText.className = 'reminder-text';
    item.appendChild(reminderText);

    // Add a delete button to each task
    var deleteButton = document.createElement('button');
    deleteButton.innerText = 'Delete';
    deleteButton.addEventListener('click', function() {
        // Remove the task item from the list
        item.parentNode.removeChild(item);

        // Also remove this task from the local storage
        removeTaskFromLocalStorage(text);
        
        // Update the charts
        updateChart();
        updateProjectChart();
    });
    item.appendChild(deleteButton);

    // Add the task item to the appropriate list (completed or uncompleted)
    if (completed) {
        completedTaskList.appendChild(item);
    } else {
        uncompletedTaskList.appendChild(item);
    }
}

// Functions for storing, updating, and removing tasks in/from local storage
function storeTaskInLocalStorage(task, completed, project, description, dueDate, reminder) {
    let tasks;
    if(localStorage.getItem('tasks') === null){
        tasks = [];
    } else {
        tasks = JSON.parse(localStorage.getItem('tasks'));
    }
    tasks.push({ text: task, completed: completed, project: project, description: description, dueDate: dueDate, reminder: reminder });
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function updateTaskInLocalStorage(task, completed) {
    let tasks = JSON.parse(localStorage.getItem('tasks'));
    for(let t of tasks){
        if(t.text === task){
            t.completed = completed;
            break;
        }
    }
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function removeTaskFromLocalStorage(task) {
    let tasks = JSON.parse(localStorage.getItem('tasks'));
    tasks = tasks.filter(t => t.text !== task);
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Event listener for when the page loads
document.addEventListener('DOMContentLoaded', function() {
    // If there are saved tasks in local storage, load them onto the page
    let tasks = JSON.parse(localStorage.getItem('tasks'));
    if (tasks !== null) {
        for(let task of tasks){
            addTask(task.text, task.completed, task.project, task.description, task.dueDate, task.reminder);
        }
    }
    // Update the charts
    updateChart();
    updateProjectChart();
});

// Function to get task completion counts
function getTaskCounts() {
    let tasks = JSON.parse(localStorage.getItem('tasks'));
    let completedCount = 0;
    let uncompletedCount = 0;
    if (tasks !== null) {
        for(let task of tasks){
            if (task.completed) {
                completedCount++;
            } else {
                uncompletedCount++;
            }
        }
    }
    return [completedCount, uncompletedCount];
}

// Function to update task completion chart
function updateChart() {
    let taskCounts = getTaskCounts();
    if (taskChart) {
        taskChart.data.datasets[0].data = taskCounts;
        taskChart.update();
    } else {
        // If the chart does not exist, create it
        taskChart = new Chart(document.getElementById('task-chart').getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ['Completed', 'Uncompleted'],
                datasets: [{
                    data: taskCounts,
                    backgroundColor: ['#6c8ebf', '#d4e4f7'] // Update the chart colors
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        labels: {
                            color: '#333333' // Update the legend label color
                        }
                    }
                }
            }
        });
    }
}

// Function to get task counts per project
function getProjectCounts() {
    let tasks = JSON.parse(localStorage.getItem('tasks'));
    let projectCounts = {};
    if (tasks !== null) {
        for (let task of tasks) {
            const project = task.project;
            if (project) {
                if (projectCounts[project]) {
                    projectCounts[project]++;
                } else {
                    projectCounts[project] = 1;
                }
            }
        }
    }
    return projectCounts;
}

// Function to update project task count chart
function updateProjectChart() {
    let projectCounts = getProjectCounts();
    let projectLabels = Object.keys(projectCounts);
    let projectData = Object.values(projectCounts);
    if (projectChart) {
        projectChart.data.labels = projectLabels;
        projectChart.data.datasets[0].data = projectData;
        projectChart.update();
    } else {
        // If the chart does not exist, create it
        projectChart = new Chart(document.getElementById('project-chart').getContext('2d'), {
            type: 'bar',
            data: {
                labels: projectLabels,
                datasets: [{
                    label: 'Task Count',
                    data: projectData,
                    backgroundColor: '#6c8ebf', // Update the bar color
                    borderColor: '#ffffff', // Update the border color
                    borderWidth: 2 // Update the border width
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        labels: {
                            color: '#333333' // Update the legend label color
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false // Hide the X-axis grid lines
                        }
                    },
                    y: {
                        beginAtZero: true,
                        stepSize: 1,
                        grid: {
                            color: '#cccccc' // Update the Y-axis grid color
                        }
                    }
                }
            }
        });
    }
}

// Get the current local time and date
function getCurrentDateTime() {
    const now = new Date();
    return now.toLocaleString();
}

// Update the element with the current local time and date
function updateLocalTime() {
    const localTimeElement = document.getElementById("local-time");
    if (localTimeElement) {
        localTimeElement.textContent = getCurrentDateTime();
    }
}

// Call the updateLocalTime function initially and every second
updateLocalTime();
setInterval(updateLocalTime, 1000);