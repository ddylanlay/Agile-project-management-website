function loadAllSprints() {
    //OUTPUT: loads all sprints as card views to the webpage
    //this function retrieves all the sprint information from the database and generates HTML to display it as a card view

    getAllItems("sprints", function(err, allSprints) {
        //print error if error occurs
        if (err) console.log(err);
        else {
            //if sprints is undefined, table is empty and nothing should be drawn to the screen
            if (typeof(allSprints) !== "undefined") {
                //variable for number of cards on row and current row
                let currentRow = 1;

                //html code to be injected into webpage
                let htmlCode = `<div style="position: relative; top:${50 * currentRow}px;" class="card-deck">`;

                //for every element of the tasks array
                allSprints["Items"].forEach(function(sprint) {
                    if (sprint.deleted === false) {
                        //add card to row
                        currentRow += 1;
                        htmlCode = htmlCode + getSprintHTML(sprint) + `
                    </div>
                    <div style="position: relative; top:${50 * currentRow}px;" class="card-deck">
                    `;
                    }
                });
                //run function pushing HTML code to .allTaskCards Division
                pushHTML(htmlCode);
            }
        }
    });
}

function getCardColour(status) {
    /*
    INPUT: status representing whether the chosen sprint has not been started, is active, or is completed
    OUTPUT: the appropriate colour to make the card header for that particular task

    Function that given the current status of a task, returns the colour of the card header
    */
    if (status == "Not Started") {
        return "LightGrey";
    } else if (status === "In Progress") {
        return "LightGreen";
    } else {
        return "LightBlue"
    }
}

function userConfirm() {
    if (confirm("Are you sure you want to progress sprint?") == true) {
        return true
    } else {
        return false
    }
}

function getSprintHTML(sprint) {
    /*
    INPUT: task representing a dictionary containing all the metadata of an inidividual task
    OUTPUT: a string representing the HTML code that generates the card and pop up for the expand task button

    This function takes the metadata of the task and inserts it into a card template to then be displayed to the product backlog webpage
    */
    let res = `
    <div id="sprintCard" class="card-deck" style="z-index: 9 ;">
        <div class="card" style="width: 18rem;" >
            <div class="sprint-header" style="background-color: ${getCardColour(sprint.status)}; height: 60px;"
            <span ><b>${sprint.status}</b></span>`
    if (sprint.status != "Completed") {
        res = res + `<button type="button" id="taskEditButton" class="btn btn-primary" style="margin-right: 170px;" data-toggle="modal" data-target="#modal${sprint.sprint_id}">Edit Sprint</button>`
    }
    if (sprint.status == "Not Started") {
        res = res + `<button type="button" id="advanceStatusButton" class="btn btn-success" style="margin-left: 1030px;" onclick="res=userConfirm(); createSprint('${sprint.name}','${sprint.startDate}','${sprint.endDate}',false,true,false,${sprint.sprint_id},res,${sprint.taskIDS});" title="Commence sprint, updating status">Start Sprint</button>`
    }
    if (sprint.status == "In Progress") {
        res = res + `<button type="button" id="advanceStatusButton" class="btn btn-success" style="margin-left: 1030px;" onclick="res=userConfirm(); createSprint('${sprint.name}','${sprint.startDate}','${sprint.endDate}',false,false,true,${sprint.sprint_id},res,${sprint.taskIDS});returnTasks(${sprint.sprint_id},${sprint.taskIDS});" title="End Sprint, updating status">End Sprint</button>`
    }
    res = res + `<button type="button" id="taskEditButton" class="btn btn-danger" onclick="deleteSprint(${sprint.sprint_id})" title="Delete Sprint, return all uncompleted tasks to product backlog">Delete Sprint</button>
    
            </div>
            <a class="nav-link" href="kanban_view.html"><span class="sr-only"></span></a>
            <div class="card-body text-primary">
                <div class="sprintColumn" >
                    <h5 class="sprint-column-title">Name</h5>
                    <h7 class="card-text">${sprint.name}</h7>
                </div>
                <div class="sprintColumn" >
                    <h5 class="sprint-column-title">Start Date</h5>
                    <h7 class="card-text">${sprint.startDate}</h7>
                </div>
                <div class="sprintColumn" >
                    <h5 class="sprint-column-title">End Date</h5>
                    <h7 class="card-text">${sprint.endDate}</h7>
                </div>
                `
    if (sprint.status != "Not Started") {
        res = res + `<a href="graph.html?sprint_ID=${sprint.sprint_id}">
                <div class="sprintColumn" style="width: 16%;">
                    <img src="graph icon.png" style="max-width:40%;">
                </div>
                </a>`
    }

    res = res + ` </div>
            `
    if (sprint.status != "Not Started") {
        res = res + `<a class="btn btn-outline-primary" href="kanban_view.html?sprint_ID=${sprint.sprint_id}">Kanban View</a>`
    } else {
        res = res + `<a class="btn btn-outline-primary" href="sprint_task_view.html?sprint_ID=${sprint.sprint_id}">All Tasks</a>`
    }
    res = res + `
            </div>
        </div>`
    res = res + `<div class="modal fade bd-example-modal-lg" id="modal${sprint.sprint_id}" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="false">
        <div class="modal-dialog modal-lg" role="document">
            <div class="modal-content">
                <div class="modal-header" style="background-color: ${getCardColour(sprint.status)}; ">
                    <h5 class="modal-title" id="exampleModalLabel"><b>${sprint.name}</b></h5>
                    <button title="Close expand task modal, do not save changes" type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times; </span>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="container-fluid">
                        <div class="input-group input-group-sm mb-3">
                            <div class="input-group-prepend">
                                <span class="input-group-text">Name</span>
    
                            </div>
                            <input type="text" id="namefield${sprint.sprint_id}" class="form-control" aria-label="Small" aria-describedby="inputGroup-sizing-sm" value="${sprint.name}">
                        </div>
    
                        <div class="input-group input-group-sm mb-3">
                            <div class="input-group-prepend">
                                <span class="input-group-text">Start Date</span>
    
                            </div>
                            <input type="date" id="startDate${sprint.sprint_id}" value="${sprint.startDate}">
                        </div>
    
                        <div class="input-group input-group-sm mb-3">
                            <div class="input-group-prepend">
                                <span class="input-group-text">End Date</span>
    
                            </div>
                            <input type="date" id="endDate${sprint.sprint_id}" value="${sprint.endDate}">
                        </div>
    
                        
                    </div>
    
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-primary" data-dismiss="modal" onclick="createSprint(
                        document.getElementById('namefield${sprint.sprint_id}').value,
                        document.getElementById('startDate${sprint.sprint_id}').value,
                        document.getElementById('endDate${sprint.sprint_id}').value,
                        ${sprint.status == "Not Started"},
                        ${sprint.status == "In Progress"},
                        ${sprint.status == "Completed"},
                        ${sprint.sprint_id},true,${sprint.taskIDS})">Save</button>
                </div>
            </div>
            </div></div>`

    return res;

}

function pushHTML(html) {
    /*
    INPUT: html representing a string of HTML code to be pushed into .allTaskCards
    OUTPUT: html code pushed into the product backlog webpage

    This function closes the card division and then selects the .allTaskCard division in the product backlog webpage, then inserts the html parameter.
    */

    //close card division
    html = html + `</div>`;

    //insert cards into html
    let taskCards = document.querySelector(".allSprints");
    taskCards.innerHTML = html;
}

function createSprint(name, startDate, endDate, radioNotStarted, radioInProgress, radioCompleted, sprintID, progressSprint, ...tasks) {
    /*
    INPUT:
    name - name of new sprint
    startDate - starting date of sprint
    endDate - ending date of sprint
    radioButtons - which status radio button has been clicked
    sprintID - the sprintID to use, -1 if randomly generated
    tasks- all existing tasks attached to that sprint

    OUTPUT:
    given all the fields are correct, the sprint will be created and added to the dynamoDB database, the page will then be reloaded

    */
    if (progressSprint) {
        if (Date.parse(startDate) > Date.parse(endDate)) {
            alert("Cannot create sprint: Start date has to be before End Date");
        } else if (name == "" || startDate == "" || endDate == "" || radioNotStarted + radioInProgress + radioCompleted == 0) {
            alert("Please fill in all fields");
        } else {
            let status = "Not Started";
            if (radioInProgress) {
                status = "In Progress";
            } else if (radioCompleted) {
                status = "Completed";
            }
            if (sprintID == -1){
                sprintID = Math.floor(Math.random() * 1000000000000000).toString();
            }
            let item = {
                TableName: "sprints",
                Item: {
                    sprint_id: sprintID.toString(),
                    name: name,
                    startDate: startDate,
                    endDate: endDate,
                    status: status,
                    taskIDS: tasks,
                    deleted: false
                }
            }
            addItem(item);
            sleep(300);
            loadAllSprints();

            // remove all values from inputs
            document.getElementById('namefield').value = ""
            document.getElementById('startDate').value = ""
            document.getElementById('endDate').value = ""

        }
    };
}

function shouldBeChecked(currentStatus, sprintStatus) {
    //returns checked which checks the radio button if the priority of status is a feature of the card
    if (currentStatus == sprintStatus) {
        return "Checked";
    }
}

function addTaskToSprint(sprintID, taskID) {
    /*
    INPUT: sprintID representing the chosen sprint
    taskID representing the task to be added

    OUTPUT:
    given that the task does not already exist in the sprint, adds it to the array taskIDS in the dynamoDB so it is a part of the sprint

    */
    getItem({
        TableName: "sprints",
        Key: {
            sprint_id: sprintID.toString()
        }
    }, function(err, data) {
        let taskIDs = data['Item']['taskIDS'];
        if (taskIDs.includes(taskID)) {
            console.log("Item is already in sprint");
            return
        }
        taskIDs.push(taskID)
        let sprint = {
            TableName: "sprints",
            Key: {
                sprint_id: sprintID.toString()
            },
            UpdateExpression: "set taskIDS = :x",
            ExpressionAttributeValues: {
                ":x": taskIDs
            }
        };
        updateItem(sprint);
    })

}

function retrieveTasksFromSprint(sprintID, taskID = -1) {
    /*
    If taskID is supplied, it will only execute functionality for that taskID, if no taskID is supplied it will
    execute functionality for all tasks in the sprint
     */
    getItem({
        TableName: "sprints",
        Key: {
            sprint_id: sprintID.toString()
        }
    }, function(err, data) {
        data['Item']['taskIDS'].forEach(function(currTaskID) {
            console.log(currTaskID);
            getItem({
                TableName: "tasks",
                Key: {
                    task_id: currTaskID.toString()
                }
            }, function(err, data) {
                //functionality for all tasks
                if (taskID === -1) console.log(data);
                //functionality for specific task
                else if (currTaskID === taskID) console.log(data);

            })

        })
    })
}


function deleteSprint(sprintID) {
    /*
    INPUT: sprintID representing the unique ID for the sprint to be deleted
    OUTPUT: the sprint with the sprintID is removed from the database, and the page is reloaded
    */

    //callback function that gets dictionary of task to be deleted
    getItem({
        TableName: "sprints",
        Key: {
            sprint_id: sprintID.toString()
        }
    }, function(err, data) {
        if (err) console.log(err);
        else {
            if (confirm("Are you sure you want to delete sprint?") == true) {
                //set all the values to the same apart from deleted which is set to true
                let newSprint = {
                    TableName: 'sprints',
                    Item: {
                        sprint_id: data["Item"].sprint_id.toString(),
                        name: data["Item"].name,
                        startDate: data["Item"].startDate,
                        endDate: data["Item"].endDate,
                        status: data["Item"].status,
                        taskIDS: data["Item"].taskIDS,
                        deleted: true
                    }
                };
                //add new sprint to DB, which overwrites existing one
                addItem(newSprint);
                //wait 300ms, then refresh page
                sleep(300);
                loadAllSprints();
            };
        }

    })

}

function returnTasks(sprintID, ...taskIDS) {
    updatedTaskIDS = taskIDS
        //for every task in sprint
    taskIDS.forEach(function(taskID) {
        //get data for task
        getItem({
            TableName: "tasks",
            Key: {
                task_id: taskID.toString()
            }
        }, function(err, data) {
            //if the task in the sprint was not started or in progress, it should be returned to product backlog
            if (data["Item"]["status"] == "Not Started" || data["Item"]["status"] == "In Progress") {
                //change status, remove from taskIDS, update item
                updatedTaskIDS.splice(updatedTaskIDS.indexOf(taskID));
                newTask = {
                    TableName: 'tasks',
                    Item: {
                        task_id: taskID.toString(),
                        name: data["Item"].name,
                        type: data["Item"].type,
                        storyPoints: data["Item"].storyPoints,
                        tags: data["Item"].tags,
                        priority: data["Item"].priority,
                        assignee: data["Item"].assignee,
                        description: data["Item"].description,
                        status: "Not Started",
                        deleted: false
                    }
                };
                addItem(newTask);
            }
        });
    });
    getItem({
        TableName: "sprints",
        Key: {
            sprint_id: sprintID.toString()
        }
    }, function(err, data) {
        let newSprint = {
            TableName: 'sprints',
            Item: {
                sprint_id: data["Item"].sprint_id.toString(),
                name: data["Item"].name,
                startDate: data["Item"].startDate,
                endDate: data["Item"].endDate,
                status: data["Item"].status,
                taskIDS: updatedTaskIDS,
                deleted: false
            }
        };
        addItem(newSprint);
    })
}

function sleep(milliseconds) {
    //waits a given amount of time
    //this is used to allow time for the DB to update and prevents the page reloading before the DB has time to update
    const date = Date.now();
    let currentDate = null;
    do {
        currentDate = Date.now();
    } while (currentDate - date < milliseconds);
}

loadAllSprints();