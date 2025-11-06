const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const cors = require("cors");
require('dotenv').config();
const port = process.env.PORT || 5000;
console.log(process.env)
// Middleware
app.use(cors());
app.use(express.json());

const uri =
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@simplecrud.h04rjld.mongodb.net/?appName=SimpleCrud`;


  

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// Home
app.get("/", (req, res) => {
  res.send("Your Server is Ready !");
});

async function run() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("You are Connected to the Mondodb server !");


    const db = client.db('smart_deals');
    const productsCollection = db.collection('products');
    const bidsCollection = db.collection('bids');
    const usersCollection = db.collection('users');

    // all products
    app.get('/products', async (req, res) => {
      console.log(req.query)
      const email = req.query.email;
      const query = {};
      if (email) {
        query.email = email;
      }
      //const projectFiled = {title: 1, price_min: 1}
      const cursor = productsCollection.find(query) //.project(projectFiled) .sort({ price_min: 1 }).skip(2);
      const result = await cursor.toArray();
      res.send(result)
    })

    
    app.get('/latest-products', async (req, res) => {
      const cursor = productsCollection.find().sort({ created_at: 1 }).limit(6);
      const result = await cursor.toArray()
      res.send(result)
    })


    app.get('/bids', async (req, res) => {
      const email = req.query.email;
      const query = {}
      if (email) {
        query.buyer_email = email;
      }
      const cursor = bidsCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    })

    // app.get('/products/bids', async(req, res) => {
    //   const email = req.query.email;
    //   const query = {};
    //   if (email) {
    //     query.buyer_email = email
    //   }
    //   const cursor = bidsCollection.find(query);
    //   const result = await cursor.toArray();
    //   res.send(result)

    // })

    app.post('/bids', async (req, res) => {
      const newBid = req.body;
      const result = await bidsCollection.insertOne(newBid);
      res.send(result)
    })



    // id wise product
    app.get('/products/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productsCollection.findOne(query);
      res.send(result)
    })

    app.get('/bids/:id', async(req, res) => {
      const id = req.params.id;
      const query = { productId : id }
      const cursor = bidsCollection.find(query).sort({bid_price: -1 });
      const result = await cursor.toArray();
      res.send(result)
    })


    //add product
    app.post('/products', async (req, res) => {
      const newProduct = req.body;
      const result = await productsCollection.insertOne(newProduct);
      res.send(result)
      
    })

    // Post users
    app.post('/users', async (req, res) => {
      const newUser = req.body;
      const email = req.body.email;
      const query = { email: email };
      const existingUser = await usersCollection.findOne(query);

      if (existingUser) {
        res.send({message: 'Alresdy exist user'})
      } else {
        const result = await usersCollection.insertOne(newUser);
        res.send(result);
      }
    })


    //edit product
    app.patch('/products/:id', async (req, res) => {
      const id = req.params.id;
      const updatedProduct = req.body;
      const query = { _id: new ObjectId(id) };
      const update = {
        $set: {
          name: updatedProduct.name,
          price: updatedProduct.email
        }
      }
      
      const result = await productsCollection.updateOne(query, update);
      res.send(result)
    })


    //delete a product
    app.delete('/products/:id', async(req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productsCollection.deleteOne(query);
      res.send(result);
    })




      
  } finally {
    //
  }
}

run().catch(console.dir);

// Port
app.listen(port, () => {
  console.log("Your server is running port : ", port);
});
