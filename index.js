require('dotenv').config();
const express = require('express');
const cors = require('cors');
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const { query } = require('express');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/', (req, res) => {
  res.send('Hello World!')
})

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.swwce.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const productCollection = client.db(`${process.env.DB_NAME}`).collection("products");
  const orderCollection = client.db(`${process.env.DB_NAME}`).collection("orders");

  // get all products
  app.get('/products', (req, res) => {
    productCollection.find({})
      .toArray((err, document) => {
        res.status(200);
        res.send(document);
      })
  })

  // get single product by id
  app.get('/product/:id', (req, res)=> {
    const _id = ObjectID(req.params.id);
    productCollection.find({_id})
    .toArray((err, document)=> {
      res.status(200);
      res.send(document[0]);
    })
  })

  // add single product
  app.post('/addProduct', (req, res)=> {
    const productDetails = req.body;
    productCollection.insertOne(productDetails)
      .then(result => {
        res.status(200).send('Inserted');
      })
  })

  // delete single product
  app.delete('/deleteProduct', (req, res)=> {
    const _id =  ObjectID(req.body.id);
    productCollection.deleteOne({_id})
      .then(result => {
        res.status(200)
      })
  })

  // post a new order
  app.post('/addOrder', (req, res)=> {
    const orderDetails = req.body;
    orderCollection.insertOne(orderDetails)
    .then(result=> {
      res.status(200).send("Order Placed")
    })
  })

  // get orders by email
  app.get('/orders/:email', (req, res)=> {
    const userEmail = req.params.email;
    orderCollection.find({userEmail})
      .toArray((err, document)=> {
        res.send(document)
      })
  })

});


app.listen(port);