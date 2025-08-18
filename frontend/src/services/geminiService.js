import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI_API_KEY, GEMINI_CONFIG, GEMINI_MODEL } from '../config/gemini.js';
import { mongoProducts } from '../data/formatListings'

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Create a model instance
const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

// System prompt for the AI assistant
const SYSTEM_PROMPT = `You are an AI shopping assistant for TechStone, a computer hardware store. You help users find the best pre-built computers based on their needs.

Available products data:
${JSON.stringify(mongoProducts, null, 2)}

Your capabilities:
1. Filter products by price range (e.g., "PCs under $1500")
2. Find gaming-optimized computers
3. Recommend products based on specific requirements
4. Compare products and suggest the best value
5. Provide product links and pricing information

**Important formatting guidelines:**
- Use **bold text** for emphasis and product names
- Use *italic text* for descriptions
- Always mention products by their exact title as shown in the data
- Use bullet points (•) for lists
- Be conversational and helpful

When recommending products:
- Mention the exact product title
- Include the price information
- Explain why it's a good choice
- Use **bold** for product names and prices

Example response format:
"Here are some great options for you:

• **Product Name** - $Price - Brief description of why it's good
• **Another Product** - $Price - Another recommendation

The **Product Name** is particularly good because..."

If no products match the criteria, suggest alternatives or ask for clarification.`;

// Chat history to maintain context
let chatHistory = [];

// Initialize chat
export const initializeChat = async () => {
  try {
    const chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: SYSTEM_PROMPT }],
        },
        {
          role: 'model',
          parts: [{ text: 'Hello! I\'m your AI shopping assistant for TechStone. I can help you find the perfect pre-built computer based on your needs. What are you looking for today?' }],
        },
      ],
      generationConfig: GEMINI_CONFIG,
    });
    
    return chat;
  } catch (error) {
    console.error('Error initializing chat:', error);
    throw new Error('Failed to initialize AI chat. Please check your API key.');
  }
};

// Send message to AI and get response
export const sendMessage = async (message) => {
  try {
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'YOUR_API_KEY_HERE') {
      throw new Error('Please add your Gemini AI API key to the configuration file.');
    }

    const chat = await initializeChat();
    
    // Add user message to history
    chatHistory.push({ role: 'user', content: message });
    
    // Send message to AI
    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();
    
    // Add AI response to history
    chatHistory.push({ role: 'assistant', content: text });
    
    // Process the response to enhance it with images and links
    const enhancedResponse = processAIResponse(text);
    
    return {
      success: true,
      message: enhancedResponse,
      filteredProducts: extractProductsFromResponse(text)
    };
    
  } catch (error) {
    console.error('Error sending message:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Failed to get AI response. Please try again.';
    
    if (error.message.includes('API key')) {
      errorMessage = 'Please check your Gemini AI API key configuration.';
    } else if (error.message.includes('quota')) {
      errorMessage = 'API quota exceeded. Please try again later.';
    } else if (error.message.includes('network')) {
      errorMessage = 'Network error. Please check your internet connection.';
    }
    
    return {
      success: false,
      message: errorMessage,
      filteredProducts: []
    };
  }
};

// Process AI response to add images and format links
const processAIResponse = (response) => {
  let processedResponse = response;
  
  // Find all products mentioned in the response
  mongoProducts.forEach(product => {
    const productTitle = product.title;
    
    // Create a regex to match the product title (case insensitive)
    const productRegex = new RegExp(`(${productTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    
    // Replace product mentions with enhanced versions including images and links
    processedResponse = processedResponse.replace(productRegex, () => {
      const priceText = product.salePrice > 0 
        ? `$${product.salePrice} (${Math.round(((product.regularPrice - product.salePrice) / product.regularPrice) * 100)}% OFF)`
        : `$${product.regularPrice}`;
      return `
<div class="product-mention">
  <div class="product-info">
    <img src="${product.image}" alt="${product.title}" class="product-thumbnail" />
    <div class="product-details">
      <strong>${product.title}</strong>
      <div class="product-price">${priceText}</div>
      <a href="${product.link}" target="_blank" class="product-link">View Product →</a>
    </div>
  </div>
</div>`;
    });
  });
  
  // Convert markdown-style formatting to HTML
  processedResponse = processedResponse
    // Bold text: **text** -> <strong>text</strong>
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Italic text: *text* -> <em>text</em>
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Bullet points: •, *, or - at line start -> proper list items
    .replace(/^(?:•|\*|-)\s*(.*)/gm, '<li>$1</li>')
    // Convert consecutive list items to proper lists
    .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
    // Clean up multiple ul tags
    .replace(/<\/ul>\s*<ul>/g, '')
    // Line breaks
    .replace(/\n/g, '<br>');
  
  return processedResponse;
};

// Extract product information from AI response
const extractProductsFromResponse = (response) => {
  const products = [];
  
  // Look for product titles in the response
  mongoProducts.forEach(product => {
    if (response.toLowerCase().includes(product.title.toLowerCase())) {
      products.push(product);
    }
  });
  
  return products;
};

// Filter products based on AI criteria
export const filterProductsByAI = async (criteria) => {
  try {
    const prompt = `Filter the available products based on this criteria: "${criteria}". 
    Return only the products that match, with their names, prices, and links. 
    If no products match exactly, suggest the closest alternatives.`;
    
    const result = await sendMessage(prompt);
    return result;
    
  } catch (error) {
    console.error('Error filtering products:', error);
    return {
      success: false,
      message: 'Failed to filter products. Please try again.',
      filteredProducts: []
    };
  }
};

// Get product recommendations
export const getRecommendations = async (userNeeds) => {
  try {
    const prompt = `Based on these user needs: "${userNeeds}", recommend the best 3-5 products from our inventory. 
    Explain why each product is a good choice and provide their prices and links.`;
    
    const result = await sendMessage(prompt);
    return result;
    
  } catch (error) {
    console.error('Error getting recommendations:', error);
    return {
      success: false,
      message: 'Failed to get recommendations. Please try again.',
      filteredProducts: []
    };
  }
};

// Clear chat history
export const clearChatHistory = () => {
  chatHistory = [];
};

// Get chat history
export const getChatHistory = () => {
  return chatHistory;
}; 