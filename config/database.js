const {MongoClient} = require('mongodb');

let url = "mongodb+srv://root:root123@dbtest.w4xhtn5.mongodb.net/?retryWrites=true&w=majority";

async function connectDB() {
    const client = new MongoClient(url);
    await client.connect();
    return client;
}
module.exports = connectDB;