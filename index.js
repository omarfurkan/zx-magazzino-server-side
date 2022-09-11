const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config()
const jwt = require('jsonwebtoken');
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


        // JWT
        function verifyJWT(req, res, next) {
            const authHeader = req.headers.authrization;
            if (!authHeader) {
                return res.status(401).send({ message: 'unauthorized access' })
            }
            const token = authHeader.split(' ')[1];
            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
                if (err) {
                    return res.status(403).send({ message: 'forbidden access' })
                }
                console.log('decoded>>>>>>>>>>', decoded);
                req.decoded = decoded;
                next();
            })
        }



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
        app.get('/myitem/:email?', verifyJWT, async (req, res) => {
            const decodedEmail = req.decoded.email;
            const email = req.query.email;
            if (email === decodedEmail) {
                const query = { email }
                const cursor = inventoryCollection.find(query);
                const result = await cursor.toArray();
                res.send(result);
            }
            else {
                res.status(403).send({ message: 'forbidden access' })
            }

        })



        // add an item

        app.post('/item', async (req, res) => {
            const doc = req.body;
            const result = await inventoryCollection.insertOne(doc);
            res.send(result);
        })


        // Auth

        app.post('/login', async (req, res) => {
            const user = req.body;
            console.log(user, 'from server')
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '1d'
            })
            res.send({ accessToken })
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

run().catch(console.dir)


app.get('/', (req, res) => {
    res.send('Ready to Fly');
});


app.listen(port, () => {
    console.log('All done in port>>>', port)
})