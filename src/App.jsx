// import React, { useState, useEffect } from 'react';
// import './App.css';
// import axios from 'axios';

// function App() {
//   const [input, setInput] = useState('');
//   const [messages, setMessages] = useState(() => {
//     try {
//       const saved = localStorage.getItem('chatMessages');
//       return saved ? JSON.parse(saved) : [];
//     } catch (e) {
//       console.error('Failed to load messages from localStorage:', e);
//       return [];
//     }
//   });
//   const [isSending, setIsSending] = useState(false); // fixed from setisSending

//   useEffect(() => {
//     localStorage.setItem('chatMessages', JSON.stringify(messages));
//   }, [messages]);

//   const getBotReply = async (userInput) => {
//     try {
//       const response = await axios.post('http://localhost:5005/webhooks/rest/webhook', {
//         sender: 'user', // can be any unique ID
//         message: userInput
//       });

//       const botMessages = response.data.map((msg) => ({
//         text: `Bot: ${msg.text}`,
//         timestamp: new Date().toLocaleTimeString(),
//         sender: 'bot'
//       }));

//       setMessages(prev => [...prev, ...botMessages]);
//     } catch (error) {
//       console.error('Rasa API Error:', error);
//       setMessages(prev => [
//         ...prev,
//         {
//           text: 'Bot: Sorry, something went wrong.',
//           timestamp: new Date().toLocaleTimeString(),
//           sender: 'bot'
//         }
//       ]);
//     }
//   };

//   const handleSend = () => {
//     if (!input.trim()) return;

//     const userMessage = {
//       text: input,
//       timestamp: new Date().toLocaleTimeString(),
//       sender: 'user'
//     };

//     setMessages(prev => [...prev, userMessage]);
//     setIsSending(true);
//     getBotReply(input).finally(() => setTimeout(() => setIsSending(false), 1000));
//     setInput('');
//   };

//   return (
//     <div className="chat-container">
//       <div className="chat-history">
//         {messages.map((msg, index) => (
//           <div key={index} className={`message ${msg.sender}`}>
//             <span>{msg.text}</span>
//             <small>{msg.timestamp}</small>
//           </div>
//         ))}
//       </div>

//       <div className="chat-input">
//         <input
//           type="text"
//           value={input}
//           onChange={(e) => setInput(e.target.value)}
//           onKeyDown={(e) => e.key === 'Enter' && handleSend()}
//           placeholder={isSending ? 'Bot is typing...' : 'Type your message...'}
//           disabled={isSending}
//         />
//         <button onClick={handleSend} disabled={isSending}>Send</button>
//       </div>

//       <div>
//         <button className="clear-button" onClick={() => {
//           localStorage.removeItem('chatMessages');
//           setMessages([]);
//         }}>
//           Clear Chat
//         </button>
//       </div>
//     </div>
//   );
// }

// export default App;


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
  const [isSending, setIsSending] = useState(false);
  const [selectedBot, setSelectedBot] = useState('rasa');

  useEffect(() => {
    localStorage.setItem('chatMessages', JSON.stringify(messages));
  }, [messages]);

  const getBotReply = async (userInput) => {
    try {
      let reply = '';

      if (selectedBot === 'rasa') {
        const response = await axios.post('http://localhost:5005/webhooks/rest/webhook', {
          sender: 'user',
          message: userInput
        });
        reply = response.data.map(msg => msg.text).join(' ') || 'Bot: (No reply)';

      } else if (selectedBot === 'openai') {
        const response = await axios.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: 'gpt-3.5-turbo',
            messages: [
              { role: 'system', content: 'You are a helpful assistant.' },
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
        reply = response.data.choices[0].message.content.trim();

      } else if (selectedBot === 'ollama') {
        const response = await axios.post(
          'http://localhost:11434/api/generate',
          {
            model: 'tinydolphin', // or whatever model you've pulled tinyllama, tinydolphin, gemma:2b etc
            prompt: userInput,
            stream: false
          }
        );
        reply = response.data.response.trim();
      }

      setMessages(prev => [
        ...prev,
        {
          text: `Bot: ${reply}`,
          timestamp: new Date().toLocaleTimeString(),
          sender: 'bot'
        }
      ]);
    } catch (error) {
      console.error(`${selectedBot.toUpperCase()} API Error:`, error);
      setMessages(prev => [
        ...prev,
        {
          text: 'Bot: Sorry, something went wrong.',
          timestamp: new Date().toLocaleTimeString(),
          sender: 'bot'
        }
      ]);
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = {
      text: input,
      timestamp: new Date().toLocaleTimeString(),
      sender: 'user'
    };

    setMessages(prev => [...prev, userMessage]);
    setIsSending(true);
    getBotReply(input).finally(() => setTimeout(() => setIsSending(false), 1000));
    setInput('');
  };

  return (
    <div className="chat-container">
      <h3>🧠 Talking to: {selectedBot.toUpperCase()}</h3>

      <div className="chat-history">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`}>
            <span>{msg.text}</span>
            <small>{msg.timestamp}</small>
          </div>
        ))}
      </div>

      <div className="chat-input">
        <select value={selectedBot} onChange={(e) => setSelectedBot(e.target.value)}>
          <option value="rasa">🛠 Rasa</option>
          <option value="openai">🔮 OpenAI GPT-3.5</option>
          <option value="ollama">🤖 Ollama</option>
        </select>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder={isSending ? 'Bot is typing...' : 'Type your message...'}
          disabled={isSending}
        />
        <button onClick={handleSend} disabled={isSending}>Send</button>
      </div>

      <div>
        <button className="clear-button" onClick={() => {
          localStorage.removeItem('chatMessages');
          setMessages([]);
        }}>
          Clear Chat
        </button>
      </div>
    </div>
  );
}

export default App;
