const params = new URLSearchParams(window.location.search)
    // Get the value of some variable in the url parameter
let sprint_id = params.get("sprint_ID");

// Calling Google Charts on callback
google.charts.load('current', { 'packages': ['corechart'] });
google.charts.setOnLoadCallback(createGraph);


function createGraph() {
    getAllItems("activity_log", function(err, activities) {
        getAllItems("tasks", function(err, allTasks) {
            getAllItems("sprints", function(err, allSprints) {
                //print error if error occurs
                if (err) console.log(err);
                else {
                    // Check is sprints are empty
                    if (typeof(allSprints) !== "undefined") {
                        //find sprint that correlates to ID
                        allSprints["Items"].forEach(function(sprint) {
                            //if correct sprint is found, set base data filled with all dates of sprint
                            if (sprint["sprint_id"].toString() == sprint_id.toString()) {
                                //creating data array
                                graph = []
                                head = ['Days', 'Ideal Burnout', 'Remaining Effort', 'Accumulated Effort']
                                graph.push(head)
                                let start_date = new Date(sprint["startDate"])
                                let end_date = new Date(sprint["endDate"])
                                var time_diff = end_date.getTime() - start_date.getTime();
                                var days = time_diff / (1000 * 3600 * 24);
                                for (i = 0; i <= days; i++) {
                                    if (i == 0) {
                                        start_date.setDate(start_date.getDate() + 0)
                                    } else {
                                        start_date.setDate(start_date.getDate() + 1)
                                    }
                                    dayField = [(start_date.toISOString()).slice(0, 10), 0, 0, 0]
                                    graph.push(dayField)
                                }
                                taskIDs = sprint["taskIDS"].toString();
                                //get all tasks

                                //iterate through all tasks
                                storyPoints = 0
                                allTasks["Items"].forEach(function(task) {
                                    //if task_ID matches task_id of sprint, add to total effort
                                    if (taskIDs.includes(task["task_id"].toString())) {
                                        storyPoints = storyPoints + 4 * parseInt(task["storyPoints"]);
                                    }
                                })
                                graph[1][1] = storyPoints;
                                for (i = 1; i <= days + 1; i++) {
                                    graph[i][3] = 0;
                                    graph[i][2] = storyPoints;
                                    if (i == 1) {
                                        graph[i][1] = storyPoints;
                                    } else {
                                        graph[i][1] = graph[i - 1][1] - storyPoints / days;
                                    }

                                }

                                if (err) console.log(err);
                                else {
                                    //iterate through activities
                                    //console.log(start_date)
                                    //console.log(end_date)
                                    activities["Items"].forEach(function(activity) {
                                            //Setting data values if activity matches sprint
                                            if (activity["sprint_id"].toString() == sprint_id.toString()) {
                                                console.log(activity["date"].split("-")[2])
                                                i = 0;

                                                date = activity["date"].split("-")
                                                console.log(date)
                                                console.log(sprint["endDate"]);
                                                console.log(graph)
                                                for (let i = 1; i < graph.length; i++) {
                                                    const element = graph[i][0];
                                                    if (new Date(element) >= new Date(activity["date"])) {
                                                        graph[i][3] += parseInt(activity["hours"])
                                                        graph[i][2] -= parseInt(activity["hours"])
                                                    }

                                                }
                                                // for (i = parseInt(activity["date"].split("-")[2]); i <= days + 1; i++) {
                                                //     if (graph[i][0].toString() == activity["date"]) {
                                                //         graph[i][3] += parseInt(activity["hours"])
                                                //         graph[i][2] -= parseInt(activity["hours"])

                                                //     } else if (i != 1) {
                                                //         graph[i][2] = graph[i - 1][2]
                                                //         graph[i][3] = graph[i - 1][3]
                                                //     }
                                                // }
                                            }
                                        })
                                        // Graphing the actual data
                                    console.log(graph)
                                    var data = google.visualization.arrayToDataTable(graph);
                                    var options = {
                                        title: 'Burnout Chart of Completion',
                                        vAxis: { title: 'Effort (hours)' },
                                        hAxis: { title: 'Days' },
                                        seriesType: 'line',
                                    };

                                    var chart = new google.visualization.ComboChart(document.getElementById('chart_div'));
                                    chart.draw(data, options);
                                }



                            }
                        });
                    }
                }
            });
        });
    });
}