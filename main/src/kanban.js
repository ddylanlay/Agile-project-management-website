let currentFilter = "All";

const params = new URLSearchParams(window.location.search)
    // Get the value of some variable in the url parameter
let sprint_id = params.get("sprint_ID");

function loadKanban() {
    getAllItems("team_members", function(err, team_members) {
        getAllItems("sprints", function(err, allSprints) {
            //print error if error occurs
            if (err) console.log(err);
            else {
                //if sprints is undefined, table is empty and nothing should be drawn to the screen
                if (typeof(allSprints) !== "undefined") {
                    //find sprint that correlates to ID
                    allSprints["Items"].forEach(function(sprint) {
                        //if correct sprint found
                        if (sprint["sprint_id"] == sprint_id) {
                            //get tasksIDS
                            taskIDs = sprint["taskIDS"];
                            sprint_status = sprint["status"];
                            startDate = sprint["startDate"]
                            endDate = sprint["endDate"]
                                //get all tasks
                            getAllItems("tasks", function(err, allTasks) {
                                //declare string to store html for each of the 3 columns
                                let notStartedHTML = "";
                                let inProgressHTML = ``;
                                let completedHTML = "";
                                let nsCount = 1;
                                let ipCount = 1;
                                let cCount = 1;
                                //iterate through all tasks
                                allTasks["Items"].forEach(function(task) {
                                        //if task_ID is contained within
                                        if (taskIDs.includes(parseInt(task["task_id"]))) {
                                            //if task is not started
                                            if (task["status"] == "Not Started") {
                                                notStartedHTML = notStartedHTML + `<div style="position: relative; top:${50 * nsCount}px">` + getCardHTML(task, team_members) + "</div>";
                                                nsCount = nsCount + 1
                                            }
                                            //if task is in progress
                                            else if (task["status"] == "In Progress") {
                                                inProgressHTML = inProgressHTML + `<div style="position: relative; top:${50 * ipCount}px">` + getCardHTML(task, team_members) + "</div>";
                                                ipCount = ipCount + 1;
                                            }
                                            //if task is completed
                                            else {
                                                completedHTML = completedHTML + `<div style="position: relative; top:${50 * cCount}px">` + getCardHTML(task, team_members) + "</div>";
                                                cCount = cCount + 1
                                            }
                                        }
                                    })
                                    //insert cards into html
                                let notStarted = document.querySelector(".sprint-notstarted-tasks");
                                let inProgress = document.querySelector(".sprint-inprogress-tasks");
                                let completed = document.querySelector(".sprint-completed-tasks");
                                notStarted.innerHTML = `<div style="height: ${120 + 200* nsCount}px;">` + notStartedHTML + "</div>";
                                inProgress.innerHTML = `<div style="height: ${120 + 200 * ipCount}px;">` + inProgressHTML + "</div>";
                                completed.innerHTML = `<div style="height: ${120 + 200 * cCount}px;">` + completedHTML + "</div>";

                            })
                        }
                    });
                }
            }
        });
    });
}

function getCardColour(priority) {
    if (priority == "Low") {
        return "LightGreen";
    } else if (priority === "Medium") {
        return "#ffeb57"; /*Bright yellow*/
    } else {
        return "#FF4A4A" /*Crimson colour*/
    }
}

function getTeamMembers(team_members, currentAssignee) {
    let res = '';
    for (let i = 0; i < team_members["Count"]; i++) {
        if (currentAssignee == team_members["Items"][i]["team_member_id"]) {
            res = res + `<option selected value="${team_members["Items"][i]["team_member_id"]}">${team_members["Items"][i]["firstName"]} ${team_members["Items"][i]["lastName"]}</option>`;
        } else {
            res = res + `<option value="${team_members["Items"][i]["team_member_id"]}">${team_members["Items"][i]["firstName"]} ${team_members["Items"][i]["lastName"]}</option>`;
        }
    }
    return res;
}

function getAssigneeName(team_members, ID) {
    for (let i = 0; i < team_members["Count"]; i++) {
        if (ID == team_members["Items"][i]["team_member_id"]) {
            return team_members["Items"][i]["firstName"] + " " + team_members["Items"][i]["lastName"];
        }

    }
}

function getCardHTML(task, team_members) {
    /*
    INPUT: task representing a dictionary containing all the metadata of an inidividual task
    OUTPUT: a string representing the HTML code that generates the card and pop up for the expand task button

    This function takes the metadata of the task and inserts it into a card template to then be displayed to the product backlog webpage
    */

    //append HTMl for card
    let task_id = task.task_id;

    let res = `
    <div id="taskCard" class="card-deck" style="z-index: 9;">
        <div class="card" style="width: 18rem;" >
            <div class="card-header" style="background-color: ${getCardColour(task.priority)}; ">${task.name}<br></br> <span >${task.priority}</span></div>
            <div class="card-body text-primary">
                <div class="cardInsideColumnLeft" >
                    <h7 class="card-text">${getAssigneeName(team_members,task.assignee)}</h7>
                </div>
                <div class="cardInsideColumnRight" >
                    <p class="card-text">Effort: ${Math.floor(task.storyPoints * 4)}hrs</p>
                    <button type="button" class="btn btn-outline-primary" data-toggle="modal" data-target="#${task.name}">Expand Task</button>
                </div>


            </div>
        </div>
    </div>
    `
        //Add htmlcode to do with pop up modal that appears when "Edit Task" is clicked
        //This is seperated from the card HTML so comments can be added

    res = res +
        `
    <div class="modal fade bd-example-modal-lg" id="${task.name}" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel"
    aria-hidden="false">
    <div class="modal-dialog modal-lg" role="document">
        <div class="modal-content">
            <div class="modal-header" style="background-color: ${getCardColour(task.priority)}; ">
                <h5 class="modal-title" id="exampleModalLabel">${task.name}</h5>
                <button type="button" class="close" data-dismiss="modal" onclick="loadKanban()" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <div class="modal-body">
                                <div class="container-fluid">
                                    <div class="input-group input-group-sm mb-3">
                                        <div class="input-group-prepend">
                                            <span class="input-group-text">Title</span>

                                        </div>
                                        <input type="text" id="titlefield${task.task_id}" class="form-control" aria-label="Small" aria-describedby="inputGroup-sizing-sm" value="${task.name}">
                                    </div>

                                    <div class="input-group mb-3">
                                        <div class="input-group-prepend">
                                            <label class="input-group-text" for="inputGroupType">Type</label>
                                        </div>
                                        <select class="custom-select" id="inputGroupType${task.task_id}">
                                          <option selected value="${task.type}">${task.type}</option>
                                          <option value="${getOtherType(task.type)}">${getOtherType(task.type)}</option>
                                        </select>
                                    </div>

                                    <div class="input-group mb-3">
                                        <div class="input-group-prepend">
                                            <label class="input-group-text" for="inputGroupTags{}">Tags</label>
                                        </div>
                                        <select class="custom-select" id="inputGroupTags${task.task_id}">
                                          <option selected value=${task.tags}>${task.tags}</option>
                                          <option value="${getOtherTag(task.tags,0)}">${getOtherTag(task.tags,0)}</option>
                                          <option value="${getOtherTag(task.tags,1)}">${getOtherTag(task.tags,1)}</option>
                                        </select>
                                    </div>

                                    <div class="input-group mb-3">
                                        <div class="input-group-prepend">
                                            <label class="input-group-text" for="inputAssignee${task.task_id}">Assignees</label>
                                        </div>
                                        <select class="custom-select" id="inputAssignee${task.task_id}">
                                        ${getTeamMembers(team_members,task.assignee)}
                                        </select>
                                    </div>
                                    <br>
                                    <div class="input-group mb-3">
                                        <div class="input-group-prepend">
                                            <label class="input-group-text" for="inputGroupTags{}">Story Points</label>
                                        </div>
                                        <select class="custom-select" id="rangeStoryPoints${task.task_id}">
                                          <option selected value=${task.storyPoints}>${task.storyPoints}</option>
                                          <option value="${getOtherStoryPoints(task.storyPoints,0)}">${getOtherStoryPoints(task.storyPoints,0)}</option>
                                          <option value="${getOtherStoryPoints(task.storyPoints,1)}">${getOtherStoryPoints(task.storyPoints,1)}</option>
                                          <option value="${getOtherStoryPoints(task.storyPoints,2)}">${getOtherStoryPoints(task.storyPoints,2)}</option>
                                          <option value="${getOtherStoryPoints(task.storyPoints,3)}">${getOtherStoryPoints(task.storyPoints,3)}</option>
                                          <option value="${getOtherStoryPoints(task.storyPoints,4)}">${getOtherStoryPoints(task.storyPoints,4)}</option>
                                          <option value="${getOtherStoryPoints(task.storyPoints,5)}">${getOtherStoryPoints(task.storyPoints,5)}</option>
                                          <option value="${getOtherStoryPoints(task.storyPoints,6)}">${getOtherStoryPoints(task.storyPoints,6)}</option>
                                          <option value="${getOtherStoryPoints(task.storyPoints,7)}">${getOtherStoryPoints(task.storyPoints,7)}</option>
                                          <option value="${getOtherStoryPoints(task.storyPoints,8)}">${getOtherStoryPoints(task.storyPoints,8)}</option>
                                        </select>
                                    </div>
                                    <br>
                                    <p class="fw-bolder">Priority</p>
                                    <div class="form-check">
                                        <div class="form-check form-check-inline" id="radioPriority${task.task_id}">
                                            <input class="form-check-input" type="radio" name="inlineRadioOptions${task.task_id}" id="radioLowPriority${task.task_id}" ${shouldBeChecked("Low", task.priority)}>
                                            <label for="radioLowPriority" class="form-check-label">Low</label>
                                        </div>
                                        <div class="form-check form-check-inline" id="radioPriority${task.task_id}">
                                            <input class="form-check-input" type="radio" name="inlineRadioOptions${task.task_id}" id="radioMediumPriority${task.task_id}" ${shouldBeChecked("Medium", task.priority)}>
                                            <label for="radioMediumPriority" class="form-check-label">Medium</label>
                                        </div>
                                        <div class="form-check form-check-inline" id="radioPriority${task.task_id}">
                                            <input class="form-check-input" type="radio" name="inlineRadioOptions${task.task_id}" id="radioHighPriority${task.task_id}" ${shouldBeChecked("High", task.priority)}>
                                            <label class="form-check-label" for="radioHighPriority">High</label>
                                        </div>
                                    </div>
                                    <br>
                                    <p class="fw-bolder">Status</p>
                                    <div class="form-check">
                                        <div class="form-check form-check-inline" id="radioPriority${task.task_id}">
                                            <input class="form-check-input" type="radio" name="inlineRadioOptions2${task.task_id}" id="radioNotStarted${task.task_id}" ${shouldBeChecked("Not Started", task.status)}>
                                            <label style = "color: Red;" class="form-check-label" for="radioNotStarted">Not Started</label>
                                        </div>
                                        <div class="form-check form-check-inline" id="radioPriority${task.task_id}">
                                            <input class="form-check-input" type="radio" name="inlineRadioOptions2${task.task_id}" id="radioInProgress${task.task_id}" ${shouldBeChecked("In Progress", task.status)}>
                                            <label style = "color: rgb(247, 195, 0);" class="form-check-label" for="radioInProgress">In Progress</label>
                                        </div>
                                        <div class="form-check form-check-inline" id="radioPriority${task.task_id}">
                                            <input class="form-check-input" type="radio" name="inlineRadioOptions2${task.task_id}" id="radioCompleted${task.task_id}" ${shouldBeChecked("Completed", task.status)}>
                                            <label style = "color: Green;" class="form-check-label" for="radioCompleted">Completed</label>
                                        </div>
                                    </div>
                                    <br>
                                    <form>
                                        <div class="form-group">
                                            <label for="descriptionBox" class="fw-bolder">Description</label>
                                            <textarea class="form-control" name="descriptionBox" id="descriptionBox${task.task_id}" rows="6">${task.description}</textarea>

                                        </div>
                                    </form>
                                    <br>
                                    <br>
                                    <form>
                                    `
    if (sprint_status == "In Progress") {
        res = res +
            `
                    <form>
                        <div class="form-group">
                            <p class="fw-bolder">Add Log</p>
                            
                            <div class="input-group input-group-sm mb-3">
                                <div class="input-group-prepend">
                                    <span class="input-group-text">Team Member</span>
                                </div>
                                <select class="custom-select" id="inputLogAssignee${task.task_id}">
                                     ${getTeamMembers(team_members, task.assignee)}
                                </select>
                            </div>
                            
                            <div class="input-group input-group-sm mb-3">
                                <div class="input-group-prepend">
                                    <span class="input-group-text">Date</span>
                                </div>
                                <input type="date" id="logDate${task.task_id}">
                                <div class="input-group-prepend" style="padding-left: 20px ">
                                    <span class="input-group-text">Hours</span>
                                </div>
                                <input type="text" id="logHours${task.task_id}" class="form-control" aria-label="Small" aria-describedby="inputGroup-sizing-sm">
                            </div>
                            <button type="button" class="btn btn-primary" onclick="logHours(${task.task_id},
                            document.getElementById('logDate${task.task_id}').value,
                            document.getElementById('logHours${task.task_id}').value,
                            document.getElementById('inputLogAssignee${task.task_id}').value,
                            sprint_id)" data-toggle="modal" data-target="#${task.name}" >Add Log</button>
                            <div class="logTable" id="${task.task_id}logTable"></div>
                            </div>
                            </form>
                            `
        createRows(task_id, team_members);
    }
    res = res +
        `</div>
        </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-dismiss="modal" onclick="loadKanban()">Close</button>
                <button type="button" class="btn btn-primary" onclick="addTask(${task.task_id},
                document.getElementById('titlefield${task.task_id}').value,
                document.getElementById('inputGroupType${task.task_id}').value,
                document.getElementById('inputGroupTags${task.task_id}').value,
                document.getElementById('inputAssignee${task.task_id}').value,
                document.getElementById('rangeStoryPoints${task.task_id}').value,
                document.getElementById('radioLowPriority${task.task_id}').checked,
                document.getElementById('radioMediumPriority${task.task_id}').checked,
                document.getElementById('radioHighPriority${task.task_id}').checked,
                document.getElementById('radioNotStarted${task.task_id}').checked,
                document.getElementById('radioInProgress${task.task_id}').checked,
                document.getElementById('radioCompleted${task.task_id}').checked,
                document.getElementById('descriptionBox${task.task_id}').value,)"  data-dismiss="modal"  >Save changes</button>
            </div>
        </div>
        </div>
    </div>`;
    //Return HTML
    return res
}

function getOtherType(type) {
    //this function is used so that when you click on expand task, the already selected type is the one assigned to the card, this returns the other type
    if (type == "Bug") {
        return "Story";
    }
    return "Bug";
}

function getOtherTag(tag, i) {
    //returns the other 2 tags which are not selected in the expand task section
    let allTags = ["UI", "Testing", "Core"];
    let index = allTags.indexOf(tag);
    allTags.splice(index, 1);
    return allTags[i];
}

function addTask(taskID, title, type, tag, assignee, storyPoints, priorityL, priorityM, priorityH, statusNS, statusIP, statusC, description) {
    /*
    INPUT:
        - Title representing a string of the name of the task
        - Type representing a string of the type
        - Tag representing a string of the tag of the task
        - assignee representing a string of the tag
        - storypoints, an integer representing the storypoints allocated to the task
        - priorityL, priorityM, priorityH, booleans, where True means it has been chosen and False meaning it has not been
        - statusNS, statusIP, statusC, booleans, where True means it has been chosen and False meaning it has not been
        - Description, a string representing the description for the task

    OUTPUT:
    If all fields have been entered appropriately, then the task will be given a unique ID and added to the data

    */
    //callback function that gets all tasks from the dataBase
    getAllItems("tasks", function(err, allTasks) {
        //if error occurs, print error
        if (err) console.log(err);
        else {
            //verify that all data has been entered
            if (title === "" || tag === "Choose..." || assignee === "" || (priorityL + priorityM + priorityH) === 0 || (statusNS + statusIP + statusC) === 0) {
                alert("Not enough fields inputted.");
                loadAllTasks();
            } else {

                //get the string priority depending on radio button checked
                let priority = "High";
                if (priorityL) {
                    priority = "Low";
                } else if (priorityM) {
                    priority = "Medium";
                }

                //get the string status depending on radio button checked
                let status = "Completed";
                if (statusNS) {
                    status = "Not Started";
                } else if (statusIP) {
                    status = "In Progress";
                }

                //if new task being created, assign a taskID to it
                if (taskID == '') {
                    taskID = Math.floor(Math.random() * 1000000000000000);

                }
                //otherwise declare dictionary for newTask
                newTask = {
                    TableName: 'tasks',
                    Item: {
                        task_id: taskID.toString(),
                        name: title,
                        type: type,
                        storyPoints: storyPoints,
                        tags: tag,
                        priority: priority,
                        assignee: assignee,
                        description: description,
                        status: status,
                        deleted: false
                    }
                };

                //push to database
                addItem(newTask);
                //wait 300ms
                sleep(300);
                //reload screen with new task
                loadKanban();

                //remove all values from create task modal
                document.getElementById('titlefield' + taskID).value = "";
                document.getElementById('inputGroupType' + taskID).value = "Choose...";
                document.getElementById('inputGroupTags' + taskID).value = "Choose...";
                document.getElementById('inputAssignee' + taskID).value = "";
                document.getElementById('rangeStoryPoints' + taskID).value = "";
                document.getElementById('radioLowPriority' + taskID).checked = false;
                document.getElementById('radioMediumPriority' + taskID).checked = false;
                document.getElementById('radioHighPriority' + taskID).checked = false;
                document.getElementById('radioNotStarted' + taskID).checked = false;
                document.getElementById('radioInProgress' + taskID).checked = false;
                document.getElementById('radioCompleted' + taskID).checked = false;
                document.getElementById('descriptionBox' + taskID).value = "";
            }
        }
    });
}


function removeLog(log_id, task_id) {
    if (confirm("Are you sure you want to delete log?") == true) {
        let param = {
            TableName: "activity_log",
            Key: {
                log_id: log_id.toString(),
                task_id: task_id.toString()
            }
        };
        deleteItem(param)

    }
    sleep(300);
    loadKanban()
}

function deleteTaskButton(taskID) {
    /*
    INPUT: taskID representing the unique ID for the task to be deleted
    OUTPUT: the task with the TASKID is removed from the database, and the page is reloaded
    */

    //callback function that gets dictionary of task to be deleted
    getItem({
        TableName: "tasks",
        Key: {
            task_id: taskID.toString()
        }
    }, function(err, data) {
        if (err) console.log(err);
        else {
            //set all the values to the same apart from deleted which is set to true
            let newTask = {
                TableName: 'tasks',
                Item: {
                    task_id: data["Item"].task_id.toString(),
                    name: data["Item"].name,
                    type: data["Item"].type,
                    storyPoints: data["Item"].storyPoints,
                    tags: data["Item"].tags,
                    priority: data["Item"].priority,
                    assignee: data["Item"].assignee,
                    description: data["Item"].description,
                    status: data["Item"].status,
                    deleted: true
                }
            };
            //add new task to DB, which overwrites existing one
            addItem(newTask);
            //wait 300ms, then refresh page
            sleep(300);
        }

    })

    //remove task from sprint
    getItem({
        TableName: "sprints",
        Key: {
            sprint_id: sprint_id.toString()
        }
    }, function(err, data) {
        let taskIDs = data['Item']['taskIDS'];
        if (!taskIDs.includes(taskID)) {
            console.log("Item is not in sprint");
            return
        }
        taskIDs.splice(taskIDs.indexOf(taskID), 1);
        let sprint = {
            TableName: "sprints",
            Key: {
                sprint_id: sprint_id.toString()
            },
            UpdateExpression: "set taskIDS = :x",
            ExpressionAttributeValues: {
                ":x": taskIDs
            }
        };
        updateItem(sprint);
        sleep(300);
        loadKanban();
    })


}

function getOtherStoryPoints(value, i) {
    //returns the other 9 story points which are not selected in the expand task section
    let storyPoints = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    storyPoints.splice(value - 1, 1);
    return storyPoints[i];
}

function shouldBeChecked(currentPriority, taskPriority) {
    //returns checked which checks the radio button if the priority of status is a feature of the card
    if (currentPriority == taskPriority) {
        return "Checked";
    }
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

function getSprintDates(sprint_id) {

}

function logHours(task_id, date, hours, assignee, sprintID) {
    if (Date.parse(date) < Date.parse(startDate) || Date.parse(date) > Date.parse(endDate)) {
        alert("Date must fall within sprint start and end dates");
    } else if (assignee == "" || date == "" || hours == 0) {
        alert("All fields must be filled");
    } else {

        let item = {
            TableName: "activity_log",
            Item: {
                log_id: (Math.floor(Math.random() * 1000000000000000)).toString(),
                sprint_id: sprintID.toString(),
                task_id: task_id.toString(),
                team_member: assignee,
                date: date,
                hours: hours
            }
        }
        addItem(item);
        sleep(300);
        loadKanban();
    }
}

function createRows(task_id, team_members) {
    getAllItems("activity_log", function(err, logs) {
        let rows = ``;
        let totalHours = 0;
        //print error if error occurs
        if (err) { console.log(err); } else {
            if (logs !== null) {
                //generate a table row for each log
                logs["Items"].forEach(function(log) {
                    if (log.task_id.toString() == task_id) {
                        totalHours = totalHours + parseInt(log.hours);
                        assignee = getAssigneeName(team_members, log.team_member)
                        row = `<tr> <td>` + log.date + `</td> <td>` + log.hours + `</td> <td>` + assignee + `</td> <td>` +
                            `<button type="button" className="btn btn-danger" data-dismiss="modal" onClick="removeLog(${log.log_id}, ${log.task_id})">Delete Log</button>` +
                            `</td> </tr>\n`;
                        rows = rows + row;


                    }

                })
            }
        }
        lastRow = `<tr> <th>` + "Total Hours" + `</th> <th>` + totalHours + `</th> <th>` + "" + `</th> <th>` + "" + `</th>  </tr>\n`
        rows = rows + lastRow;
        var html =
            `
            <p id=${task_id} class="fw-bolder">Logs</p>
            
            <table class="table table-striped">
                <colgroup>
                    <col ="17%">
                    <col width="33%">
                    <col width="35%">
                    <col width="15%">
                </colgroup>
                <th>Date</th>
                <th>Hours</th>
                <th>Assignee</th>
                <th>Delete</th>
                <tbody>
            ` + rows +
            `</tbody>
        </table>`
        pushHTML(task_id, html)
    })
}

function pushHTML(task_id, html) {
    //insert html into log table
    let tableOfLogs = document.getElementById(task_id + "logTable");
    tableOfLogs.innerHTML = html;
}

loadKanban()