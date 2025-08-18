import fs from 'fs';
import path from 'path';

const listingsPath = path.join(process.cwd(), 'scripts', 'listings.txt');
const listingsData = fs.readFileSync(listingsPath, 'utf-8');

const parseListingDataToMongo = () => {
  try {
    const lines = listingsData.trim().split(/\r?\n/);
    const mongoReadyProducts = []; // flat array for MongoDB

    lines.forEach((line, storeIdx) => {
      if (!line.trim()) return; 

      try {
        const storeData = JSON.parse(line.trim()); 

        
        storeData.slice(1).forEach((product, prodIdx) => {
          const [title, salePrice, regularPrice, link, image, rating = 0, reviewCount = 0] = product;

          mongoReadyProducts.push({
            _id: `${storeIdx}-${prodIdx}`, // unique MongoDB id
            storeId: storeIdx,            
            title,
            salePrice: salePrice || 0,
            regularPrice: regularPrice || salePrice || 0,
            link,
            image,
            rating: rating || Math.random() * 2 + 3,
            reviewCount: reviewCount || 0
          });
        });

      } catch (err) {
        console.error(`Error parsing line ${storeIdx + 1}:`, err);
      }
    });

    return mongoReadyProducts; // flat array 
  } catch (error) {
    console.error('Error parsing listings data:', error);
    return [];
  }
};

// Export MongoDB-ready data
export const mongoProducts = parseListingDataToMongo();
