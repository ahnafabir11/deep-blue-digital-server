require('dotenv').config();
const cors = require('cors');
const express = require('express');
const ObjectID = require('mongodb').ObjectID;
const MongoClient = require('mongodb').MongoClient;

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/', (req, res) => {
  res.send('Welcome to Deep Blue Digial API !')
})

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.swwce.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const productCollection = client.db(`${process.env.DB_NAME}`).collection("products");
  const orderCollection = client.db(`${process.env.DB_NAME}`).collection("orders");

  // get all products
  app.get('/products', (req, res) => {
    productCollection.find({})
      .toArray((err, products) => {
        res.status(200);
        res.send(products);
      })
  })

  // get single product by id
  app.get('/product/:id', (req, res)=> {
    const _id = ObjectID(req.params.id);
    productCollection.find({_id})
    .toArray((err, product)=> {
      res.status(200);
      res.send(product[0]);
    })
  })

  // add single product
  app.post('/addProduct', (req, res)=> {
    const productDetails = req.body;
    productCollection.insertOne(productDetails)
      .then(result => {
        res.status(200);
        res.send({inserted: result.insertedCount});
      })
  })

  // delete single product
  app.delete('/deleteProduct', (req, res)=> {
    const _id =  ObjectID(req.body.id);
    productCollection.deleteOne({_id})
      .then(result => {
        res.status(200);
        res.send({deleted: result.deletedCount})
      })
  })

  // add a new order
  app.post('/addOrder', (req, res)=> {
    const orderDetails = req.body;
    orderCollection.insertOne(orderDetails)
    .then(result=> {
      res.status(200);
      res.send({inserted: result.insertedCount});
    })
  })

  // get orders by email
  app.get('/orders/:email', (req, res)=> {
    const userEmail = req.params.email;
    orderCollection.find({userEmail})
      .toArray((err, orders)=> {
        res.send(orders)
      })
  })

});

app.listen(port);