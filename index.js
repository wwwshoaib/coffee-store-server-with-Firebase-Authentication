const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// MongoDB URI
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.7twsfn9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// MongoDB client setup
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let coffeeCollection;
let userCollection;

async function run() {
  try {
    await client.connect();
    coffeeCollection = client.db('coffeeMaster').collection('coffee');
    userCollection = client.db('coffeeMaster').collection('users');
    console.log("✅ Connected to MongoDB Successfully!");

    app.listen(port, () => {
      console.log(`🚀 Server is running on port: ${port}`);
    });

  } catch (err) {
    console.error("❌ MongoDB connection failed:", err);
  }
}

run();

// Routes
app.get('/', (req, res) => {
  res.send("☕ Coffee making server is running ....");
});

app.get('/coffee', async(req, res) => {
  const result = await coffeeCollection.find().toArray();
  res.send(result);
});

app.get('/coffee/:id', async(req, res) => {
  const id = req.params.id;
  const result = await coffeeCollection.findOne({ _id: new ObjectId(id) });
  res.send(result);
});

app.put('/coffee/:id', async(req, res) => {
  const id = req.params.id;
  const filter = { _id: new ObjectId(id) };
  const options = { upsert: true };
  const updatedCoffee = req.body;

  const updateCoffee = {
    $set: {
      name: updatedCoffee.name,
      quantity: updatedCoffee.quantity,
      supplier: updatedCoffee.supplier,
      taste: updatedCoffee.taste,
      category: updatedCoffee.category,
      details: updatedCoffee.details,
      photo: updatedCoffee.photo,
    }
  };

  const result = await coffeeCollection.updateOne(filter, updateCoffee, options);
  res.send(result);
});

app.post('/addcoffee', async(req, res) => {
  const newCoffee = req.body;
  const result = await coffeeCollection.insertOne(newCoffee);
  res.status(201).json(result);
});

app.delete('/coffee/:id', async(req, res) => {
  const id = req.params.id;
  const result = await coffeeCollection.deleteOne({ _id: new ObjectId(id) });
  res.send(result);
});

// Users related API
//CREATE operation
app.post('/users', async (req, res) => {
  const newUser = req.body;
  console.log('Created a new user', newUser); // Fixed variable name
  const result = await userCollection.insertOne(newUser);
  res.send(result);
});

//GET operation
app.get('/users', async (req, res) => {
  const cursor = userCollection.find();
  const result = await cursor.toArray();
  res.send(result);
});

//UPDATE operation

app.patch('/users', async(req, res) => {
  const email = req.body?.email;
  const filter = { email };
  const updatedDoc = {
    $set: {
      lastSignInTime: req.body?.lastSignInTime

    }
  } 
  const result = await userCollection.updateOne(filter, updatedDoc);
  res.send(result);
})

//DELETE operation

app.delete('/users/:id', async(req, res) => {
  const id = req.params.id;
  const query ={ _id: new ObjectId(id)};
  const result = await userCollection.deleteOne(query);
  res.send(result);
})
 