//string of ID of member current clicked on on webpage. Used to change selection to blue
clickedMember = ""


function addMember(firstName, lastName, email, ID) {
    /*
    INPUT:
        firstName: string
        lastName: string
        email: string in email format
        ID: string, -1 if ID needs to be generated

    OUTPUT:
        if all parameters are entered correctly, a new member is added to the database

        otherwise an error message is returned
    */

    //if ID == -1, generate 
    if (ID == -1) {
        ID = Math.floor(Math.random() * 1000000000000000).toString();
    }
    //if all fields entered and valid
    if (firstName != "" && lastName != "" && email != "" && validateEmail(email) != null) {


        //declare parameter for new member
        let newMember = {
            TableName: "team_members",
            Item: {
                team_member_id: ID,
                firstName: firstName,
                lastName: lastName,
                email: email
            }
        }
            //add member to database, wait, load members again
        addItem(newMember);
        sleep(300);
        loadAllMembers();
    } else {
        alert("Incorrect details, fill in name fields and ensure email is valid")
    }
}

//email should be in {}@{}.{}
function validateEmail(email) {
    return email.match(
        /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
}

function loadAllMembers() {
    //Inject HTML into webpage to display list of all team members
    getAllItems("team_members", function(err, allTeamMembers) {
        res = `
        <li class="list-group-item list-group-item-action disabled">
            <div class="column3 bold">Full Name</div>
            <div class="column3 bold">Email</div>
            <div class="member bold">Remove Member</div>
        </li>`
        allTeamMembers["Items"].forEach(member => {
            let classVal = "list-group-item list-group-item-action";
            if (clickedMember == member.team_member_id.toString()) {
                classVal = "list-group-item list-group-item-action active"
                loadMemberPerformance(member);
            }

            res = res + `
        <li class="${classVal}" onclick="clickedMember = ${member.team_member_id.toString()};loadAllMembers();">
            <div class="column3">${member.firstName + " " + member.lastName}</div>
            <div class="column3">${member.email}</div>
            <div class="member"><button type="button" class="btn btn-danger" onclick="deleteMember(${member.team_member_id});">Delete</button></div>
        </li>`

        });
        //console.log(res);
        let teamMembersHTML = document.querySelector("#teamMembersList");
        teamMembersHTML.innerHTML = res;

    });
}

function deleteMember(memberID) {
    //code that executes when delete button is pressed, asks for confirmation then removes member from database
    if (confirm("Are you sure you want to delete team member?") == true) {
        let param = {
            TableName: "team_members",
            Key: {
                team_member_id: memberID.toString()
            }
        };
        deleteItem(param);
        sleep(300);
        loadAllMembers()
    } else {
        event.cancelBubble = true;
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


function loadMemberPerformance(member) {
    memberID = member.team_member_id


    getAllItems("activity_log", function(err, allLogs) {
        sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            //get xAxis variables, which are all dates from the last 7 days
        let xAxis = []
        for (let i = 6; i > -1; i--) {
            newDate = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
            xAxis.push(newDate.getUTCDate() + "/" + (newDate.getUTCMonth() + 1));

        }

        //fill yAxis with all zeroes. Iterate through all logs and if log is of team member and within last 7 days, add hours ot yAxis index
        yAxis = new Array(7).fill(0);
        maxTime = 2;
        allLogs["Items"].forEach(function(log) {
            timeSplit = log.date.split("-");
            //if log is of team member and within date
            if (log.team_member == memberID && sevenDaysAgo < new Date(timeSplit[0], timeSplit[1] - 1, timeSplit[2])) {
                //console.log(timeSplit[2] + "/" + (timeSplit[1]));
                index = xAxis.indexOf(timeSplit[2] + "/" + (timeSplit[1]))
                    //console.log(index);
                yAxis[index] += parseInt(log.hours);
            }
        })
            //max Time used to set range of graph, improved visability
        maxTime = Math.max(2, Math.floor(Math.max(...yAxis) * 1.5));

        new Chart("myChart", {
            type: "bar",
            data: {

                labels: xAxis,
                datasets: [{
                    label: "Hours",
                    backgroundColor: new Array(7).fill("Green"),
                    data: yAxis
                }]
            },
            options: {
                title: {
                    display: true,
                    text: "Hours worked over the past 7 days for " + member.firstName + " " + member.lastName
                },
                scales: {
                    yAxes: [{
                        display: true,
                        stacked: true,
                        ticks: {
                            min: 0, // minimum value
                            max: maxTime // maximum value
                        }
                    }]
                }
            }

        });
    })
}

//run when webpage opens
loadAllMembers()