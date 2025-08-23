import { useEffect, useRef, useState } from "react";
import "./App.css";
import { io } from "socket.io-client";
import ReactMarkdown from "react-markdown";


// Simple avatar circle
function Avatar({ role }) {
  const isUser = role === "user";
  return (
    <div className={`avatar ${isUser ? "user" : "assistant"}`} aria-hidden>
      {isUser ? "🧑" : "✨"}
    </div>
  );
}

function TypingDots() {
  return (
    <span className="typing">
      <span></span>
      <span></span>
      <span></span>
    </span>
  );
}

//function for rendering message
function Message({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div className={`message-row ${isUser ? "right" : "left"}`}>
      {!isUser && <Avatar role={msg.role} />}
      <div className={`bubble ${isUser ? "user" : "assistant"}`}>
       <ReactMarkdown>{msg.content}</ReactMarkdown>
      </div>
      {isUser && <Avatar role={msg.role} />}
    </div>
  );
}

export default function App() {

  const [socket, setSocket] = useState(null);

  const [messages, setMessages] = useState([
    {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "Hi! I'm your AI assistant. Ask me anything.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const listRef = useRef(null);
  const inputRef = useRef(null);
  const textRef = useRef(null);
  
  // Initialize socket connection
  useEffect(() =>{
    let socketInstance = io('http://localhost:3000')
    setSocket(socketInstance);

  },[])

  //
  useEffect( () => {
    if(!socket) return;
    const handleResponse = (data) => {
      console.log(data);
      setIsTyping(false);
      setMessages((prev) => [...prev, {id: crypto.randomUUID(), role: "assistant", content: data.response}])
    }
    socket.on('ai-response', handleResponse)
  },[socket])

  //just handles the scroll bar
  useEffect(() => {
    // Auto-scroll to bottom on new messages
    const el = listRef.current;
    if (!el) return;
    // If the messages container is scrollable, scroll it; otherwise scroll the page
    if (el.scrollHeight > el.clientHeight) {
      el.scrollTop = el.scrollHeight;
    } else {
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: "auto",
      });
    }
  }, [messages, isTyping]);

  // AI response 
 
  //handles the user message seding in the chat 
  const send = async () => {
    const text = input.trim();
    if (!text || isTyping) return;
    const msg = { id: crypto.randomUUID(), role: "user", content: text };
    setMessages((prev) => [...prev, msg]);
    setInput("");
    inputRef.current?.focus();
    console.log(msg.content);

    socket.emit('user-message', msg.content);
    setIsTyping(true);
  };


  //if enter is pressed
  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="chat-root">
      <header className="chat-header">
        <div className="brand">
          <span className="logo-mark">✨</span>
          <span className="brand-text">AI Chat</span>
        </div>
      </header>

      <main className="chat-main">
        <div className="messages" ref={listRef}>
          {messages.map((m) => (
            <Message key={m.id} msg={m} />
          ))}
          {isTyping && (
            <div className="message-row left">
              <Avatar role="assistant" />
              <div className="bubble assistant">
                <TypingDots />
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="chat-input">
        <div className="input-wrap">
          <textarea
            ref={(el) => {
              inputRef.current = el;
              textRef.current = el;
            }}
            rows={1}
            value={input}
            placeholder="Message AI"
            onChange={(e) => {
              setInput(e.target.value);
              const t = textRef.current;
              if (t) {
                t.style.height = "auto";
                t.style.height = t.scrollHeight + "px";
              }
            }}
            onKeyDown={onKeyDown}
          />

          <button
            className="send"
            onClick={send}
            disabled={!input.trim() || isTyping}
            aria-label="Send"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3 11l18-8-8 18-2-7-8-3z"
                stroke="currentColor"
                strokeWidth="1.5"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>
      </footer>
    </div>
  );
}
