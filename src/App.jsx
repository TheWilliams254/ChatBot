import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import axios from 'axios';

function App() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('chatMessages');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Failed to load messages from localStorage:', e);
      return [];
    }
  });
  const [isSending, setIsSending] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('chatMessages', JSON.stringify(messages));
  }, [messages]);

  const debounceSend = (func, delay) => {
    return (...args) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        func(...args);
      }, delay);
    };
  };

  const debouncedSend = debounceSend(() => {
    getBotReply(input).finally(() => {
      setTimeout(() => setIsSending(false), 1500);
    });
  }, 1000);

  const handleSend = () => {
    if (!input.trim() || isSending) return;

    const newMessage = {
      text: input,
      timestamp: new Date().toLocaleTimeString(),
      sender: 'user'
    };

    setMessages(prev => [...prev, newMessage]);
    setInput('');
    setIsSending(true);
    debouncedSend();
  };

  const getBotReply = async (userInput) => {
    try {
      const response = await fetch("https://chatbot-backend-1-v0ya.onrender.com/chats", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userInput })
      });
  
      const data = await response.json();
      const reply = data.reply || "Sorry, I couldn't generate a reply.";
  
      const botReply = {
        text: `Bot: ${reply}`,
        timestamp: new Date().toLocaleTimeString(),
        sender: 'bot'
      };
      setMessages(prev => [...prev, botReply]);
  
    } catch (error) {
      console.error('OpenAI API Error:', error);
      let fallbackText = 'Bot: Sorry, I had trouble thinking that through.';
      if (error.response?.status === 429) {
        fallbackText = 'Bot: You are sending messages too fast. Please wait a moment and try again.';
      } else if (error.response?.status === 409) {
        fallbackText = 'Bot: There was a conflict processing your message. Please try again.';
      }
      const fallbackReply = {
        text: fallbackText,
        timestamp: new Date().toLocaleTimeString(),
        sender: 'bot'
      };
      setMessages(prev => [...prev, fallbackReply]);
    }
  };
  

  return (
    <div className="chat-container">
      <div className="chat-history">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`}>
            <span>{msg.text}</span>
            <small>{msg.timestamp}</small>
          </div>
        ))}
      </div>
      <div className="chat-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type your message..."
        />
        <button onClick={handleSend} disabled={isSending}>
          {isSending ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
}

export default App;
