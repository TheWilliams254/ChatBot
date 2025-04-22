#  Mini Chat Box

A simple React-based chat interface that lets you send messages and receive a bot response. Messages are saved to local storage for persistence.

## 🛠 Features

- 💬 Two-way chat: User & Bot
- 💾 Messages persist using `localStorage`
- ⌨️ Send with Enter key or button
- 🎨 Basic responsive styling


## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/TheWilliams254/mini-chat-box.git
cd mini-chat-box

## 2. Install Dependencies
-bash
-Copy code
-npm install
# or
bun install

## 3. Run the App
bash
Copy code
npm run dev
# or
bun dev
The app will be available at http://localhost:5173 (or similar, depending on your setup).

 How It Works
Messages are stored in state using useState.

On sending a message, a bot reply is auto-generated with a short delay.

All messages are saved to and retrieved from localStorage.

Built With:
React

Vite

JavaScript, HTML, CSS

📌 Future Improvements
Add avatars

Bot typing indicator

Chat export or clear feature

Dark/light theme toggle

📝 License
This project is open-source and free to use.

