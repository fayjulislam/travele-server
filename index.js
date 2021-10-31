const express = require('express');
const { MongoClient, Collection } = require('mongodb');
const cors = require('cors');

const ObjectId = require("mongodb").ObjectId;
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// database
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hnmr5.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db("travel");
        const travelCollection = database.collection("travele");
        const orderBookCollection = database.collection("traveleOrder");

        // post api
        app.post('/packages', async (req, res) => {
            const package = req.body;
            const result = await travelCollection.insertOne(package);
            res.json(result)
        });

        // get packages
        app.get('/packages', async (req, res) => {
            const package = travelCollection.find({});
            const result = await package.toArray();
            res.send(result);
        });

        // placorder
        app.post('/placeorder', async (req, res) => {
            const orderBook = req.body;
            const result = await orderBookCollection.insertOne(orderBook);
            res.json(result)
        });

        // Orderplace api
        app.get('/allorder/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const allorders = await travelCollection.findOne(query);
            res.send(allorders);
        });

        //get my orders
        app.get("/myorders/:email", async (req, res) => {
            const result = await orderBookCollection.find({
                email: req.params.email,
            }).toArray();
            res.send(result);
        });

        //get manage orders
        app.get("/manageallorders", async (req, res) => {
            const manageallorder = orderBookCollection.find({});
            const getManageAllOrder = await manageallorder.toArray();
            res.json(getManageAllOrder);
        });

        // delete all order 
        app.delete("/allorderdelete/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await orderBookCollection.deleteOne(query);
            res.json(result);
        });

        // delete order 
        app.delete("/orderdelete/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await orderBookCollection.deleteOne(query);
            res.json(result);
        });

        // update order 
        app.put('/placeorders/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const statusUpdate = {
                $set: {
                    status: 'approved'
                }
            };
            const result = await orderBookCollection.updateOne(filter, statusUpdate, options);
            res.json(result)
        })


    } finally {
        // await client.close();
    }
}
run().catch(console.dir);
app.get('/', (req, res) => {
    res.send('Running my CRUD server');
})

app.listen(port, () => {
    console.log('Running server on port', port);
})