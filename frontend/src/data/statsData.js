import listingsData from '../../../scripts/listings.txt?raw';

const parseListingDataToJS = () => {
  try {
    const lines = listingsData.trim().split(/\r?\n/); // works both for unix and windows :)
    const storesProducts = []; // every product into its own array based on store

    lines.forEach((line, storeIdx) => {
      try {
        if (!line.trim()) return; // empty line skip that 
        const storeData = JSON.parse(line.trim()); // parse line 
        const products = storeData.slice(1).map((product, prodIdx) => { // convert array to object
          const [title, salePrice, regularPrice, link, image, rating = 0, reviewCount = 0] = product;
          return {
            id: `${storeIdx}-${prodIdx}`, // unique id for each product yipeee
            title,
            salePrice: salePrice || 0,
            regularPrice: regularPrice || salePrice || 0,
            link,
            image,
            rating: rating || Math.random() * 2 + 3, // random rating between 3 and 5
            reviewCount: reviewCount || 0 // memory express has no reviews, take it as 0 :(
          };
        });
        storesProducts.push(products);
      } catch (err) {
        console.error(`Error parsing line ${storeIdx + 1}:`, err);
      }
    });

    return storesProducts;
  } catch (error) {// fake data for testing purposes
    console.error('Error parsing listings data:', error);
    return [[
      { id: '0-0', title: 'S24 Phone',rating:4.5, salePrice: 1200, regularPrice:1400, image: "https://merchandising-assets.bestbuy.ca/bltc8653f66842bff7f/blt2ddbb70163a69634/68543b97a1401313329decf1/wi-20250620-feature-grid-1-fg-bfis-promo-offer-m.png?quality=80&auto=webp", link: "https://www.bestbuy.ca/en-ca/product/google-pixel-9-128gb-obsidian-unlocked/18165476"},
      { id: '0-1', title: 'A midrange PC',rating:1.5, salePrice: 1400, regularPrice: 1500, image: "https://multimedia.bbycastatic.ca/multimedia/products/500x500/184/18484/18484001.png", link: "https://www.bestbuy.ca/en-ca/product/quoted-tech-clarity-gaming-custom-pc-black-ex-ryzen-7-5700x-rtx-5060-1tb-ssd-32gb-ram-windows-11-ai-ready-1-year-warranty/18484001?icmp=Recos_3across_tp_sllng_prdcts_plp&referrer=PLP+Top+Seller"},
      { id: '0-2', title: 'Higher end PC',rating:4.1, salePrice: 0, regularPrice:800, image: "https://multimedia.bbycastatic.ca/multimedia/products/500x500/192/19277/19277166.jpg", link: "https://www.bestbuy.ca/en-ca/product/msi-aegis-gaming-pc-amd-ryzen-r9-9900x-32gb-ram-2tb-ssd-rtx-5070-windows-11/19277166"},
      { id: '0-3', title: 'The highest of ends PC, super super super expensive',rating:4.7, salePrice: 0, regularPrice:3000, image: "https://multimedia.bbycastatic.ca/multimedia/products/500x500/174/17405/17405393.jpeg", link: "https://www.bestbuy.ca/en-ca/category/gaming-desktop-computers/30441"}
    ]];
  }
}

// Export the processed data
export const statsData = parseListingDataToJS();