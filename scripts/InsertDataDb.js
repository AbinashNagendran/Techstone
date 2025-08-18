import { MongoClient } from 'mongodb';
import { mongoProducts } from './formatListings.js';

import { MONGO_CONNECTION_STRING } from '../frontend/src/config/MongoDb.js';

async function insertDataToDb() {
    const client = new MongoClient(MONGO_CONNECTION_STRING);

    try {
        await client.connect();
        const db = client.db('listings');
        const productsCollection = db.collection('products');
        // Create unique index on link
        await productsCollection.createIndex({ link: 1 }, { unique: true });

        const result = await productsCollection.insertMany(mongoProducts, { ordered: false });
        console.log(`Inserted ${result.insertedCount} products`);
    } catch (error) {
        if (error.code === 11000) {
            console.warn('Some products were duplicates and skipped.');
        } else {
            console.error('Error inserting data:', error);
        }
    } finally {
        await client.close();
    }
}

insertDataToDb();