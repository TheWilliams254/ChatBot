import React, { useState, useEffect } from 'react';
import './App.css';

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

  useEffect(() => {
    localStorage.setItem('chatMessages', JSON.stringify(messages));
  }, [messages]);

  const handleSend = () => {
    if (!input || typeof input !== 'string' || !input.trim()) return;

    const newMessage = {
      text: input,
      timestamp: new Date().toLocaleTimeString(),
      sender: 'user'
    };
    setMessages(prev => [...prev, newMessage]);
    setInput('');

    setTimeout(() => {
      const botReply = {
        text: 'Bot: Got your message!',
        timestamp: new Date().toLocaleTimeString(),
        sender: 'bot'
      };
      setMessages(prev => [...prev, botReply]);
    }, 1000);
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
          value={typeof input === 'string' ? input : ''}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type your message..."
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}

export default App;
