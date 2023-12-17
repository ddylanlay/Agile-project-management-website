let currentFilter = "All";
//Constant representing the max number of card that should be displayed on each
const MAXCARDPERROW = 5;



function loadAllTasks() {
    /*
    INPUT: NONE
    OUTPUT: ALL TASKS PUSHED TO THE PRODUCT BACKLOG WEBPAGE AS DYNAMIC CARDS

    This function dates all tasks from the DynamoDB and iterates through them, appending the appropriate HTML division code to a string.
    It appends each card to the end of a row, and when that particular row is filled, it closes that division and moves down a row.

    This is repeated for all cards, after which the HTML code is ended and pushed to the screen.
    */

    //callBack function that returns DB data
    getAllItems("team_members", function(err, team_members) {
        getAllItems("sprints", function(err, allSprints) {
            allQueuedTasks = []
            for (let i = 0; i < allSprints["Count"]; i++) {
                for (let j = 0; j < allSprints["Items"][i]["taskIDS"].length; j++) {
                    if (!allQueuedTasks.includes(allSprints["Items"][i]["taskIDS"][j]))
                        allQueuedTasks.push(allSprints["Items"][i]["taskIDS"][j].toString())
                }
            }
            console.log(allQueuedTasks);

            getAllItems("tasks", function(err, allTasks) {
                //print error if error occurs
                if (err) console.log(err);
                else {
                    //if tasks is undefined, table is empty and nothing should be drawn to the screen
                    if (typeof(allTasks) !== "undefined") {

                        //variable for number of cards on row and current row
                        let cardRowCount = 0;
                        let currentRow = 1;

                        //html code to be injected into webpage
                        let htmlCode = `<div style="position: relative; top:${50 * currentRow}px;" class="card-deck">`;

                        //for every element of the tasks array
                        allTasks["Items"].forEach(function(task) {
                            //if the entire row has been filled with cards
                            if (task.deleted == false && task.status == "Not Started" && !allQueuedTasks.includes(task.task_id.toString())) {
                                if (cardRowCount === MAXCARDPERROW) {
                                    //reset card count
                                    cardRowCount = 0;
                                    //increment current row
                                    currentRow += 1;
                                    //close off div and create new
                                    htmlCode = htmlCode +
                                        `
                        </div>
                        <div style="position: relative; top:${50 * currentRow}px;" class="card-deck">
                        `
                                }
                                //add card to row
                                htmlCode = htmlCode + getCardHTML(task, allSprints, team_members);

                                //increment card count
                                cardRowCount += 1;
                            }


                        });
                        //run function pushing HTML code to .allTaskCards Division
                        pushHTML(htmlCode);

                    }
                }
            });
        });
    });
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
    let taskCards = document.querySelector(".allTaskCards");
    taskCards.innerHTML = html;
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

function getSprintList(allSprints) {
    let res = '';
    for (let i = 0; i < allSprints["Count"]; i++) {
        if (allSprints["Items"][i]["deleted"] == false && allSprints["Items"][i]["status"] == "Not Started")
            res = res + `<option value="${allSprints["Items"][i]["sprint_id"]}">${allSprints["Items"][i]["name"]}</option>`;
    }
    return res;
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

function loadAssignees(){
    getAllItems("team_members", function(err, team_members) {
      document.getElementById("Assignees").innerHTML += `<select class="custom-select" id="inputAssignee">
              ${getTeamMembers(team_members,"")}
          </select>`
    })
}


function getCardHTML(task, sprints, team_members) {
    /*
    INPUT: task representing a dictionary containing all the metadata of an inidividual task
    OUTPUT: a string representing the HTML code that generates the card and pop up for the expand task button

    This function takes the metadata of the task and inserts it into a card template to then be displayed to the product backlog webpage
    */

    //append HTMl for card
    let res = `
    <div id="taskCard" class="card-deck" style="z-index: 9;">
        <div class="card" style="width: 18rem;" >
            <div class="card-header" style="background-color: ${getCardColour(task.priority)}; ">${task.name}<br></br> <span >${task.priority}</span></div>
            <div class="card-body text-primary">
                <div class="cardInsideColumnLeft" >
                    <h7 class="card-text">${task.tags}</h7>
                </div>
                <div class="cardInsideColumnRight" >
                    <p class="card-text">${task.storyPoints}</p>
                    <button title="Open expanded task view, you can edit details and remove the task" type="button" class="btn btn-outline-primary" data-toggle="modal" data-target="#${task.name}">Expand Task</button>
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
                <button title="close expand task modal, do not save changes." type="button" class="close" data-dismiss="modal" onclick="getFilteredCards(currentFilter)" aria-label="Close">
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
                                            <label class="input-group-text" for="inputGroupType${task.task_id}">Type</label>
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
                                            <label class="input-group-text" for="inputGroupTags${task.task_id}">Story Points</label>
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

                                    <br>
                                    <form>
                                        <div class="form-group">
                                            <label for="descriptionBox" class="fw-bolder">Description</label>
                                           <textarea class="form-control" name="descriptionBox" id="descriptionBox${task.task_id}" rows="6">${task.description}</textarea>

                                        </div>
                                    </form>

                                    <div class="input-group mb-3">
                                        <div class="input-group-prepend">
                                            <label class="input-group-text" for="inputGroupTags${task.task_id}">Sprints</label>
                                        </div>
                                        <select class="custom-select" id="sprints${task.task_id}">
                                        <option selected ></option>
                                        ${getSprintList(sprints)}
                                        </select>
                                    </div>
                                </div>

                            </div>
            <div class="modal-footer">
                <button title="Close modal, do not save changes" type="button" class="btn btn-secondary" data-dismiss="modal" onclick="getFilteredCards(currentFilter)">Close</button>
                <button title="Delete task, removing it from product backlog" type="button" class="btn btn-danger"  data-dismiss="modal" onclick="deleteTaskButton(${task.task_id})">Delete Task</button>
                <button type="button" class="btn btn-primary" onclick="addTask(${task.task_id},
                document.getElementById('titlefield${task.task_id}').value,
                document.getElementById('inputGroupType${task.task_id}').value,
                document.getElementById('inputGroupTags${task.task_id}').value,
                document.getElementById('inputAssignee${task.task_id}').value,
                document.getElementById('rangeStoryPoints${task.task_id}').value,
                document.getElementById('radioLowPriority${task.task_id}').checked,
                document.getElementById('radioMediumPriority${task.task_id}').checked,
                document.getElementById('radioHighPriority${task.task_id}').checked,
                true,
                false,
                false,
                document.getElementById('descriptionBox${task.task_id}').value,document.getElementById('sprints${task.task_id}').value)" title="Update task, save changes." data-dismiss="modal"  >Save changes</button>
            </div>
        </div>
        </div>
    </div>`;
    //Return HTML
    return res
}

function getFilteredCards(filter) {
    /*
    INPUT: filter representing a string that all cards are being filtered by
    OUTPUT: HTML code representing all cards that should be displayed to the screen after filtering

    This function iterates through all tasks, checking if it's type matches the filter. If it does it appends it to an array, and then afterwards runs the pushHTML function
    to update the screen
    */
    currentFilter = filter;
    getAllItems("team_members", function(err, team_members) {
        getAllItems("sprints", function(err, allSprints) {
            let inSprint = [];
            allSprints['Items'].forEach(function(sprint){
                sprint['taskIDS'].forEach(function (sprintTaskID){
                    inSprint.push(sprintTaskID.toString())
                });
            });
            getAllItems("tasks", function(err, allTasks) {
                if (err) console.log(err);
                else {
                    //if filter is all, then display all tasks
                    if (filter == "All") {
                        //variables for current number of cards on row, current row, and HTML
                        let cardRowCount = 0;
                        let currentRow = 1;
                        let filteredTaskHTML = `<div style="position: relative; top:${50 * currentRow}px;" class="card-deck">`;

                        //iterate through every task
                        allTasks["Items"].forEach(function(task) {
                            //if task matches filter, add to html
                            if (task.deleted == false && task.status == "Not Started" && !inSprint.includes(task.task_id)) {
                                //if the entire row has been filled with cards
                                if (cardRowCount === MAXCARDPERROW) {
                                    //reset card count
                                    cardRowCount = 0;
                                    //increment current row
                                    currentRow += 1;
                                    //close off div and create new
                                    filteredTaskHTML = filteredTaskHTML +
                                        `
                            </div>
                            <div style="position: relative; top:${50 * currentRow}px;" class="card-deck">
                            `
                                }
                                console.log("All");
                                filteredTaskHTML = filteredTaskHTML + getCardHTML(task, allSprints, team_members);

                                cardRowCount += 1;
                            }
                        });
                        //push HTML to screen
                        pushHTML(filteredTaskHTML);
                    } else if (filter != "Deleted") {
                        //variables for current number of cards on row, current row, and HTML
                        let cardRowCount = 0;
                        let currentRow = 1;
                        let filteredTaskHTML = `<div style="position: relative; top:${50 * currentRow}px;" class="card-deck">`;

                        //iterate through every task
                        allTasks["Items"].forEach(function(task) {
                            //if task matches filter, add to html
                            if (task.tags == filter && task.deleted == false && task.status == "Not Started" && !inSprint.includes(task.task_id)) {
                                //if the entire row has been filled with cards
                                if (cardRowCount === MAXCARDPERROW) {
                                    //reset card count
                                    cardRowCount = 0;
                                    //increment current row
                                    currentRow += 1;
                                    //close off div and create new
                                    filteredTaskHTML = filteredTaskHTML +
                                        `
                            </div>
                            <div style="position: relative; top:${50 * currentRow}px;" class="card-deck">
                            `
                                }
                                console.log("Filter");
                                filteredTaskHTML = filteredTaskHTML + getCardHTML(task, allSprints, team_members);

                                cardRowCount += 1;
                            }
                        });
                        //push HTML to screen
                        pushHTML(filteredTaskHTML);
                    } else if (filter = "Deleted") {
                        console.log("deleted");
                        //variables for current number of cards on row, current row, and HTML
                        let cardRowCount = 0;
                        let currentRow = 1;
                        let filteredTaskHTML = `<div style="position: relative; top:${50 * currentRow}px;" class="card-deck">`;

                        //iterate through every task
                        allTasks["Items"].forEach(function(task) {
                            //if task matches filter, add to html
                            if (task.deleted == true && task.status == "Not Started") {
                                //if the entire row has been filled with cards
                                if (cardRowCount === MAXCARDPERROW) {
                                    //reset card count
                                    cardRowCount = 0;
                                    //increment current row
                                    currentRow += 1;
                                    //close off div and create new
                                    filteredTaskHTML = filteredTaskHTML +
                                        `
                            </div>
                            <div style="position: relative; top:${50 * currentRow}px;" class="card-deck">
                            `
                                }
                                filteredTaskHTML = filteredTaskHTML + getCardHTML(task, allSprints, team_members);

                                cardRowCount += 1;
                            }
                        });
                        //push HTML to screen
                        pushHTML(filteredTaskHTML);
                    }
                }
            });
        });
    });
}

function addTask(taskID, title, type, tag, assignee, storyPoints, priorityL, priorityM, priorityH, statusNS, statusIP, statusC, description, chosenSprint) {
    console.log(assignee)
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


                //add task to sprint
                if (chosenSprint != "") {
                    addTaskToSprint(chosenSprint, taskID);
                }


                //push to database
                addItem(newTask);
                //wait 300ms
                sleep(600);
                //reload screen with new task
                loadAllTasks();
                //remove all values from create task modal
                document.getElementById('titlefield').value = "";
                document.getElementById('inputGroupType').value = "Choose...";
                document.getElementById('inputGroupTags').value = "Choose...";
                document.getElementById('inputAssignee').value = "";
                document.getElementById('rangeStoryPoints').value = "";
                document.getElementById('radioLowPriority').checked = false;
                document.getElementById('radioMediumPriority').checked = false;
                document.getElementById('radioHighPriority').checked = false;
                // document.getElementById('radioNotStarted').checked = true;
                // document.getElementById('radioInProgress').checked = false;
                // document.getElementById('radioCompleted').checked = false;
                document.getElementById('descriptionBox').value = "";
            }
        }
    });
}


function addTaskToSprint(sprintID, taskID) {
    console.log(sprintID)
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
            if (confirm("Are you sure you want to delete task?") == true) {
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
                loadAllTasks();
            };
        }

    })

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

let path = window.location.pathname;
let page = path.split("/").pop();

//when webpage first opens, load all tasks, given file is loading on product backlog page
if (page == "product_backlog.html") {
    loadAllTasks();
    loadAssignees();
}