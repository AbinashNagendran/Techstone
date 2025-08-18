import { MongoClient } from 'mongodb';
import { mongoProducts } from 'frontend\src\data\formatListings.js';

import { MONGO_CONNECTION_STRING } from '../config/MongoDb';


async function insertDataToDb() {
    const client = new MongoClient(MONGO_CONNECTION_STRING);

    try {
        await client.connect();
        const db = client.db('listings');
        const productsCollection = db.collection('products');
        const result = await productsCollection.insertMany(mongoProducts);
        console.log(`Inserted ${result.insertedCount} products`);
    } catch (error) {
        console.error('Error inserting data:', error);
    } finally {
        await client.close();
    }
}

insertDataToDb();