import './App.css';
import Sidebar from "./Sidebar.jsx";
import ChatWindow from "./ChatWindow.jsx";
import { MyContext } from './MyContext.jsx'; 
import { useState, useEffect } from 'react';
import { v1 as uuidv1 } from 'uuid';


function App() {
  const [prompt, setPrompt] = useState("");
  const [reply, setReply] = useState(null);
  const [threadId, setThreadId] = useState(uuidv1());
  const [prevChats, setPrevChats] = useState([]);
  const [newChatFlag, setNewChatFlag] = useState(true);
  const [allThreads, setAllThreads] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (token) {
      localStorage.setItem('auth_token', token);
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    const storedToken = localStorage.getItem('auth_token');
    if (storedToken) {
      fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${storedToken}`
        }
      })
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user);
        }
      })
      .catch(err => console.error("Failed to fetch user:", err));
    }
  }, []);

  const ProviderValues = {
    prompt,
    setPrompt,
    reply,
    setReply,
    threadId,
    setThreadId,
    prevChats,
    setPrevChats,
    newChatFlag,
    setNewChatFlag,
    allThreads,
    setAllThreads,
    user,
    setUser
  };

  const [showInitialAuth, setShowInitialAuth] = useState(false);

  useEffect(() => {
    // Show modal if neither token nor "stay_logged_out" exists after a brief check period
    setTimeout(() => {
      const token = localStorage.getItem('auth_token');
      const skippedAuth = sessionStorage.getItem('stay_logged_out');
      if (!token && !skippedAuth) {
        setShowInitialAuth(true);
      }
    }, 500);
  }, []);

  return (
    <div className="main">
      <MyContext.Provider value={ProviderValues}>
        <Sidebar />
        <ChatWindow initialAuthRequested={showInitialAuth} onInitialAuthClose={() => {
           setShowInitialAuth(false);
           sessionStorage.setItem('stay_logged_out', 'true');
        }} />
      </MyContext.Provider>
    </div>
  );
}

export default App;
