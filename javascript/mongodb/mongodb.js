const mongo = require('mongodb').MongoClient;
//const url = "mongodb://localhost:27017/mydb";
const url = "mongodb://localhost:27017"; 

const DB_NAME = "mydb";
const COL_NAME = "mycol";

let mongodb;
let db;
let collection;

// Connect and create the database
mongo.connect(url, function(err, connectedDb) {
    if (err) throw err;
    console.debug("Database created!");
    mongodb = connectedDb;
    db = connectedDb.db(DB_NAME);
    createCollection(db);
})

function createCollection(db) {
    db.createCollection(COL_NAME, (err, col) => {
        if (err) throw err;
        collection = col;
        tryInsert(0);
    });
}

function tryInsert(count) {
    if (count === 10) {
        tryQuery(0);
        return;
    }
        
    let data = { name: "Test" + count, data: "TestData", value: count }
    collection.insertOne(data, (err, res) => {
        if (err) throw err;
        console.debug("Insert data:", data);
        tryInsert(count + 1);
    });
}

function tryQuery(i) {
    let queries = [
        {}, // Find all
        { name: "Test1" }, 
        { value: { $lt: 5} },
        { $and: [{value:{ $lt: 5}}, {value:{$gt: 1 }}] }, 
    ];

    if (i === queries.length) {
        tryUpdate();
        return;
    }

    mongodb.db(DB_NAME).collection(COL_NAME).find(queries[i]).toArray(
        (err, docs) => {
            console.debug("Number of docs found:", docs.length);
            tryQuery(i + 1);
        });
}

function tryUpdate() {
    let query = { name: "Test2" };
    let update = {  $set: { name: "Test2", address: "TEST22222" } }
    collection.updateMany(query, update, (err, result) => {
        console.debug("Update result: ", result.result);
        tryDropCollection();
    })
    
}

function tryDropCollection() {
    db.collection(COL_NAME).drop((err, result) => {
        if (err) throw err;
        console.debug("Drop collection result: ", result);
        closeDb();
    });
}

function closeDb() {
    mongodb.close();
    console.debug("End after database is closed");
}
