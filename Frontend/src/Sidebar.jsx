import "./Sidebar.css";
import { MyContext } from "./MyContext";
import { useContext,useEffect } from "react";
import { v1 as uuidv1 } from 'uuid';


function Sidebar(){
    const { allThreads,setAllThreads,setPrompt,setReply,setThreadId,setPrevChats,setNewChatFlag, user, reply } = useContext(MyContext);
    const getAllThreads = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/thread`, { headers });
            const data = await response.json();
            const filteredData = data.map(thread => ({
                threadId: thread.threadId,
                title: thread.title
            }));
           setAllThreads(filteredData);
        } catch (error) {
            console.error("Error fetching threads:", error);
        }
    };

    useEffect(() => {
        // Triggered on login/logout, and every time a new reply is received (so it bubbles to top)
        getAllThreads();
        if (!reply) createNewChat(); 
    }, [user, reply]);

    const createNewChat=()=>{
        setNewChatFlag(true);
        setPrompt("");
        setReply(null);
        setThreadId(uuidv1());
        setPrevChats([]);
        
    }

    const changeThread = async (newThreadId) => {
        console.log("CLICKED THREAD:", newThreadId);
    setThreadId(newThreadId);
    try {
        const token = localStorage.getItem('auth_token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        const response = await fetch(
            `${import.meta.env.VITE_API_BASE_URL}/api/thread/${newThreadId}`, { headers }
        );
        const res = await response.json();

        console.log("Previous chats for the thread:", res);
        const normalized = res.map(msg => ({
    role: msg.role === "assistant" ? "assistant" : "user",
    message: msg.content
}));
setPrevChats(normalized);
        setNewChatFlag(false);

    } catch (err) {
        console.log("Error in changing thread:", err);
    }
};

const deleteThread = async (threadId) => {
    try {
        const token = localStorage.getItem('auth_token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/thread/${threadId}`, {
            method: "DELETE",
            headers
        });
        if (response.ok) {
            console.log("Thread deleted successfully");
            getAllThreads(); // Refresh the thread list
            setPrompt("");
            setReply(null);
            setPrevChats([]);
            setNewChatFlag(true);
            setThreadId(uuidv1());
        } else {
            console.log("Failed to delete thread");
        }
    } catch (err) {
        console.log("Error deleting thread:", err);
    }
};

    return(
        <section className="sidebar">
            <button onClick={createNewChat}>
                <img src="src/assets/blacklogo.png" alt="new chat icon" className="logo" />
                <i className="fa-solid fa-pen-to-square"></i>
            </button>
            <ul className="history">
               {
                allThreads?.map((thread,index)=>(
                    <li key={index} onClick={()=>changeThread(thread.threadId)}>{thread.title} <i onClick={(e)=>{
                        e.stopPropagation();
                        deleteThread(thread.threadId);
                    }} className="fa-solid fa-trash"></i></li>
                    
                ))
               }
            </ul>

            <div className="sign">
               <p>By ApnaCollege &hearts;</p> 
            </div>
            
        </section>
    )
}

export default Sidebar;