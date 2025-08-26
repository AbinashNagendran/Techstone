import React, { useState, useRef, useEffect } from 'react';
import { sendMessage, clearChatHistory } from '../services/geminiService.js';

const AIChat = ({ onProductsFiltered, messages, onMessagesChange, selectedCurrency = 'USD', products = [] }) => {
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when component mounts
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    // Add user message immediately
    const updatedMessages = [...messages, userMessage];
    onMessagesChange(updatedMessages);
    setInputValue('');
    setIsLoading(true);
    setError('');

    try {
      // Show loading message
      const loadingMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: 'Thinking...',
        timestamp: new Date(),
        isLoading: true
      };
      const messagesWithLoading = [...updatedMessages, loadingMessage];
      onMessagesChange(messagesWithLoading);

      // Send message to AI with currency context
      const messageWithCurrency = `${inputValue.trim()} (Please show prices in ${selectedCurrency})`;
      const response = await sendMessage(messageWithCurrency, products);

      // Remove loading message and add AI response
      const messagesWithoutLoading = messagesWithLoading.filter(msg => !msg.isLoading);
      const finalMessages = [...messagesWithoutLoading, {
        id: Date.now() + 2,
        type: 'ai',
        content: response.success ? response.message : `Error: ${response.message}`,
        timestamp: new Date(),
        error: !response.success
      }];
      onMessagesChange(finalMessages);

      // If AI found products, update the main product grid
      if (response.success && response.filteredProducts && response.filteredProducts.length > 0) {
        onProductsFiltered(response.filteredProducts);
      }

    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
      
      // Remove loading message and add error message
      const messagesWithoutLoading = messages.filter(msg => !msg.isLoading);
      const errorMessages = [...messagesWithoutLoading, {
        id: Date.now() + 2,
        type: 'ai',
        content: 'Sorry, I encountered an error. Please try again or check your API key configuration.',
        timestamp: new Date(),
        error: true
      }];
      onMessagesChange(errorMessages);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    const initialMessage = {
      id: Date.now(),
      type: 'ai',
      content: `Hello! I'm your AI shopping assistant. I can help you find:

• PCs under specific price ranges
• Gaming optimized computers  
• Products with specific features
• Best value recommendations

What are you looking for today?`,
      timestamp: new Date()
    };
    onMessagesChange([initialMessage]);
    clearChatHistory();
    setError('');
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="ai-search-container">
      <div className="ai-search-header">
        <h2>🤖 AI Search Assistant</h2>
        <p>Ask me to find specific products, filter by price, or get recommendations!</p>
        <div className="ai-currency-info">
          <span>💱 Showing prices in {selectedCurrency}</span>
        </div>
        {messages.length > 1 && (
          <div className="chat-status">
            <span className="chat-status-text">💬 Chat history preserved</span>
          </div>
        )}
        <button 
          onClick={handleClearChat}
          className="ai-clear-btn"
          title="Clear chat history"
        >
          Clear Chat
        </button>
      </div>
      
      <div className="ai-chat-interface">
        <div className="ai-chat-messages">
          {messages.map((message) => (
            <div key={message.id} className={`${message.type}-message`}>
              <div className={`${message.type}-avatar`}>
                {message.type === 'ai' ? '🤖' : '👤'}
              </div>
              <div className={`${message.type}-message-content ${message.error ? 'error' : ''}`}>
                {message.isLoading ? (
                  <div className="ai-loading">
                    <div className="ai-loading-dot"></div>
                    <div className="ai-loading-dot"></div>
                    <div className="ai-loading-dot"></div>
                  </div>
                ) : (
                  <div dangerouslySetInnerHTML={{ 
                    __html: message.content
                  }} />
                )}
                <div className="message-time">
                  {formatTime(message.timestamp)}
                </div>
              </div>
            </div>
          ))}
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        <div className="ai-chat-input">
          <input 
            ref={inputRef}
            type="text" 
            placeholder="Ask me anything about products..." 
            className="ai-input"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
          />
          <button 
            className="ai-send-btn"
            onClick={handleSendMessage}
            disabled={isLoading || !inputValue.trim()}
          >
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChat; 