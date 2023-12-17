AWS.config.update({ region: "ap-southeast-2" });

AWS.config.update({
    region: "ap-southeast-2",
});


const documentClient = new AWS.DynamoDB.DocumentClient();

//Callback function that takes a query params that creates a task in the appropriate table
const addItem = (params) => {
    documentClient.put(params, function(err, data) {
        if (err) console.log(err);
        else console.log(data);
    });
}

const getItem = (params, func) => {
    documentClient.get(params, func);
}

//Callback function that given a query param with an appropriate key, deletes the task that matches that key
const deleteItem = (params) => {
    documentClient.delete(params, function(err, data) {
        if (err) console.log(err);
        else console.log(data);
    });
}


//Callback function that given a query param for the table, returns all items within that table
const getAllItems = (name, func) => {
    documentClient.scan({ TableName: name }, func);
}

const updateItem = (params) => {
    documentClient.update(params, function(err, data) {
        if (err) console.log(err);
        else console.log(data);
    });

}