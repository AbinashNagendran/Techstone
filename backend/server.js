import express from 'express';
import { MongoClient } from 'mongodb';
import cors from 'cors';
import { MONGO_CONNECTION_STRING } from '../frontend/src/config/MongoDb.js'; 


const app = express();
const port = 5000;

app.use(cors());

const client = new MongoClient(MONGO_CONNECTION_STRING);
let productsCollection;

async function connectDb() {
    try {
      await client.connect();
      const db = client.db('listings');
      productsCollection = db.collection('products');
      console.log('Connected to MongoDB');
    } catch (err) {
      console.error('MongoDB connection error:', err);
    }
  }
  connectDb()

// API route to get all products
app.get('/api/products', async (req, res) => {
    try {
      const products = await productsCollection.find({}).toArray();
      res.json(products);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch products' });
    }
  });
  
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });