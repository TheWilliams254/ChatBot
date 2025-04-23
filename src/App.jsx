import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    localStorage.setItem('chatMessages', JSON.stringify(messages));
  }, [messages]);

  const getBotReply = async (userInput) => {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
         messages: [
            { role: 'system', content: 'You are a helpful chatbot.' },
            { role: 'user', content: userInput }
          ]
        },
        {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          }
           }
      );

      const reply = response.data.choices[0].message.content.trim();
      const botReply = {
        text: `Bot: ${reply}`,
        timestamp: new Date().toLocaleTimeString(),
        sender: 'bot'
      };
      setMessages(prev => [...prev, botReply]);
    } catch (error) {
      console.error('OpenAI API Error:', error);
      setMessages(prev => [
        ...prev,
        {
          text: 'Bot: Sorry, I had trouble thinking that through.',
          timestamp: new Date().toLocaleTimeString(),
          sender: 'bot'
        }
      ]);
    }
  };

  const handleSend = () => {
    if (!input || typeof input !== 'string' || !input.trim()) return;

    const newMessage = {
      text: input,
      timestamp: new Date().toLocaleTimeString(),
      sender: 'user'
    };

    setMessages(prev => [...prev, newMessage]);
    getBotReply(input);
    setInput('');
    setisSending(true);

    getBotReply(input).then(() => {
      setTimeout(() => 
        setisSending(false), 1500);
      });
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
      <div>
      <button className="clear-button" onClick={() => {
           localStorage.removeItem('chatMessages');
            setMessages([]);
    }   }>
  Clear Chat
</button>
      </div>
    </div>
  );
}

export default App;
