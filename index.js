const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const port = process.env.PORT || 5000;



app.use(cors());
app.use(express.json());





const uri = `mongodb+srv://${process.env.USER_DB}:${process.env.USER_PASSWORD}@cluster0.revch01.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });



async function run() {
    try {
        await client.connect();
        const inventoryCollection = client.db("warehouse").collection("inventoryItems");

        // get all items
        app.get('/items', async (req, res) => {
            const query = {};
            const cursor = inventoryCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        })

        // get single item by id

        app.get('/item/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await inventoryCollection.findOne(query);
            res.send(result);
        })

        // get items by query
        app.get('/myitem/:email?', async (req, res) => {
            const email = req.query.email;
            const query = { email }
            const cursor = inventoryCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        })



        // add an item

        app.post('/item', async (req, res) => {
            const doc = req.body;
            const result = await inventoryCollection.insertOne(doc);
            res.send(result);
        })

        // delete an item
        app.delete('/item/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await inventoryCollection.deleteOne(query);
            res.send(result)
        })

    }
    finally {

    }
}

run().catch(console.dir())









app.get('/', (req, res) => {
    res.send('Ready to Fly');
});


app.listen(port, () => {
    console.log('All done in port>>>', port)
})