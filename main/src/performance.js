//set end date to today
document.getElementById('performanceEndDate').valueAsDate = new Date();

//set start date to a week ago
document.getElementById("performanceStartDate").valueAsDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);


function getTeamPerfomance(startDate, endDate) {
    /*
    INPUT:
    startDate: string
    endDate: string

    OUTPUT:
    if start date comes before or is equal to end date, displays hours info for all team members
    */
    startDate = new Date(startDate);
    endDate = new Date(endDate);

    if (endDate < startDate) {
        alert("Error: Start date must come before End Date");
        //reset dates
        //set end date to today
        document.getElementById('performanceEndDate').valueAsDate = new Date();

        //set start date to a week ago
        document.getElementById("performanceStartDate").valueAsDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    } else {
        //get all team members and logs
        getAllItems("team_members", function(err, allTeamMembers) {
            getAllItems("activity_log", function(err, allLogs) {
                //for every team member
                teamMembers = {}
                allTeamMembers["Items"].forEach(function(member) {
                    //declare item for team member
                    teamMembers[member.team_member_id.toString()] = {
                        fullName: member.firstName + " " + member.lastName,
                        uniqueDays: [],
                        daysWorked: 0,
                        hoursWorked: 0
                    }
                })

                //for every log
                allLogs["Items"].forEach(function(log) {
                    if (log.team_member.toString() in teamMembers && new Date(log.date) >= startDate && new Date(log.date) <= endDate) {
                        if (log.date in teamMembers[log.team_member.toString()].uniqueDays) {} else {
                            teamMembers[log.team_member.toString()].uniqueDays.push(log.date);
                            teamMembers[log.team_member.toString()].daysWorked += 1;
                        }
                        teamMembers[log.team_member.toString()].hoursWorked += parseInt(log.hours);
                    }

                });
                console.log(teamMembers);
                teamMemberHoursHTML(teamMembers);
            })
        })
    }
}

function teamMemberHoursHTML(teamMembers) {
    //given teamMembers and their stats, generates HTML and injects it into webpage
    res = `
    <li class="list-group-item list-group-item-action disabled">
        <div class="column4 bold">Full Name</div>
        <div class="column4 bold">Days Worked</div>
        <div class="column4 bold">Hours Worked</div>
        <div class="column4 bold">Hours per Day</div>
    </li>`

    for (const [key, value] of Object.entries(teamMembers)) {
        averageHours = 0;
        //if teamMember has worked more than 1 day (prevents division by 0 error)
        if (value.daysWorked != 0) {
            averageHours = value.hoursWorked / value.daysWorked;
        }
        res = res + `<li class="list-group-item list-group-item-action disabled">
        <div class="column4">${value.fullName}</div>
        <div class="column4">${Math.round(value.daysWorked * 100) / 100}</div>
        <div class="column4">${Math.round(value.hoursWorked * 100) / 100}</div>
        <div class="column4">${Math.round(averageHours * 100) / 100}</div>
    </li>`
    }
    //inject HTML
    let HTML = document.querySelector("#teamMemberHoursDashboard")
    HTML.innerHTML = res;
}