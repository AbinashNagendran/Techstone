# Gemini AI Setup Guide

## Getting Your Gemini AI API Key

1. **Visit Google AI Studio**

   - Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Sign in with your Google account

2. **Create API Key**

   - Click "Create API Key" button
   - Choose "Create API Key in new project" or select an existing project
   - Copy the generated API key (it starts with "AIza...")

3. **Configure the API Key**
   - Open `frontend/src/config/gemini.js`
   - Replace `'YOUR_API_KEY_HERE'` with your actual API key:
   ```javascript
   export const GEMINI_API_KEY = "AIzaSyYourActualAPIKeyHere";
   ```

## Features

Once configured, your AI Search will be able to:

- **Filter by Price**: "Show me PCs under $1500"
- **Gaming Recommendations**: "Find gaming optimized computers"
- **Feature-based Search**: "I need a PC with RTX graphics"
- **Best Value**: "What's the best value for my budget?"
- **Product Comparisons**: "Compare these two computers"

## Usage Examples

Try these queries in the AI Search:

- "Find all computers under $1000"
- "Show me gaming PCs with RTX graphics"
- "What's the best computer for video editing?"
- "Compare the cheapest and most expensive options"
- "Find computers with 16GB RAM or more"

## Troubleshooting

### "Please add your Gemini AI API key" Error

- Make sure you've replaced `'YOUR_API_KEY_HERE'` with your actual API key
- Check that the API key is valid and active

### "Failed to initialize AI chat" Error

- Verify your API key is correct
- Check your internet connection
- Ensure you have sufficient API quota

### API Quota Limits

- Free tier: 15 requests per minute
- Paid tier: Higher limits available
- Monitor usage at [Google AI Studio](https://makersuite.google.com/app/apikey)

## Security Notes

- Never commit your API key to version control
- The API key is only used client-side for this demo
- For production, consider using environment variables or server-side API calls

## Support

If you encounter issues:

1. Check the browser console for error messages
2. Verify your API key is correct
3. Test with simple queries first
4. Check your API quota usage
