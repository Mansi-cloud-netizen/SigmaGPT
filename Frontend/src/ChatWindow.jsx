import "./ChatWindow.css";
import Chat from "./Chat.jsx";
import { MyContext } from "./MyContext.jsx";
import { useContext,useState,useEffect } from "react";
import {ScaleLoader} from "react-spinners"
import AuthModal from "./AuthModal";

import { v1 as uuidv1 } from 'uuid';

function ChatWindow({ initialAuthRequested, onInitialAuthClose }){
    const {prompt,setPrompt,reply,setReply,threadId,prevChats,setPrevChats,setNewChatFlag,user,setUser}=useContext(MyContext);
    const [loading, setLoading] = useState(false);
    const [isOpen,setIsOpen]=useState(false);
    const [authType, setAuthType] = useState(null); // "signup" | "login" | null

    useEffect(() => {
        if (initialAuthRequested && !authType && !user) {
            setAuthType('signup');
        }
    }, [initialAuthRequested]);

    const handleLogout = () => {
        localStorage.removeItem("auth_token");
        setUser(null);
        setIsOpen(false);
        
        // Reset the chat window completely to a blank slate
        setPrompt("");
        setReply(null);
        setThreadId(uuidv1());
        setPrevChats([]);
        setNewChatFlag(true);
    }

    const handleSettings = () => {
        alert("Settings feature coming soon!");
        setIsOpen(false);
    }

    const handleUpgrade = () => {
        alert("Upgrade Plan feature coming soon!");
        setIsOpen(false);
    }

    const getReply=async()=>{
        setLoading(true);
        setNewChatFlag(false);
        console.log("Prompt:",prompt, "threadId",threadId);
        
        const token = localStorage.getItem('auth_token');
        const headers = {
            "Content-Type":"application/json"
        };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const options={
            method:"POST",
            headers,
            body:JSON.stringify({
                message:prompt,
                threadId:threadId
            })
        };
       try{
       const response= await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/chat`,options);
       const res=await response.json();
       console.log(res);
       setReply(res.reply);
       }catch(err){
        console.log("Error fetching reply:",err);
       }
       setLoading(false);
    };
    // Update prevChats when reply changes
   useEffect(() => {
    if (!reply) return;

    setPrevChats(prev => [
        ...prev,
        { role: "user", message: prompt },
        { role: "assistant", message: reply }
    ]);

    setPrompt("");
}, [reply]);


    const handleprofileClick=()=>{
        setIsOpen(!isOpen);
    }


    return(
        
        <div className="chatWindow">
            <div className="navbar">
                <span>SigmaGPT <i className="fa-solid fa-angle-down"></i></span>
                
                {!user && (
                    <div className="auth">
                        <button onClick={() => setAuthType("signup")} className="signup">
                        Sign Up
                        </button>

                        <button onClick={() => setAuthType("login")} className="login">
                        Login
                        </button>
                    </div>
                )}
                
                <div className="userIconDiv" onClick={handleprofileClick}>
                {user && user.avatar ? (
                    <img src={user.avatar} style={{width: '30px', height: '30px', borderRadius: '50%'}} alt="Profile" />
                ) : (
                    <span><i className="fa-regular fa-user"></i></span>
                )}
                </div> 
            </div>
             {
                    isOpen && <div className="dropDown">
                    {user && <div className="dropDownItems" style={{cursor: 'default', fontWeight: 'bold'}}>{user.name || user.email}</div>}
                    <div className="dropDownItems" onClick={handleSettings}><i className="fa-sharp fa-solid fa-gear"></i>Settings</div>
                    <div className="dropDownItems" onClick={handleUpgrade}><i className="fa-solid fa-arrow-up-from-bracket"></i>Upgrade plan</div>
                    {user && <div className="dropDownItems" onClick={handleLogout}><i className="fa-solid fa-arrow-right-from-bracket"></i>Log out</div>}
                </div>
                } 
            {authType && (
  <AuthModal
    type={authType}
    onClose={() => {
        setAuthType(null);
        if (initialAuthRequested && onInitialAuthClose) {
            onInitialAuthClose();
        }
    }}
  />
)}


        
        <Chat> </Chat>
        <ScaleLoader color="#fff" loading={loading}></ScaleLoader>
        <div className="chatInput">
            <div className="userInput">
                <input placeholder="Type anything" 
                value={prompt} 
                onChange={(e)=>setPrompt(e.target.value)}
                onKeyDown={(e)=>e.key=="Enter"?getReply():''}
                ></input>
                <div id="submit" onClick={getReply}>
                    <i className="fa-solid fa-paper-plane"></i>
                </div>
            </div>
            <p className="info">
                SigmaGPT can make mistakes. Please verify critical information from reliable sources.
            </p>
        </div>
        </div> 
        
    )
}

export default ChatWindow;