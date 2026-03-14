import "./Chat.css";
import { MyContext } from "./MyContext.jsx";
import { useContext, useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";

function Chat() {
    const { newChatFlag, prevChats, reply } = useContext(MyContext);
    const [latestReply, setLatestReply] = useState(null);

    useEffect(() => {
        if(reply === null){
            setLatestReply(null);
            return;
        }
        if (!prevChats?.length || !reply) return;

        const content = reply.split(" ");
        let index = 0;

        const interval = setInterval(() => {
            setLatestReply(content.slice(0, index + 1).join(" "));
            index++;

            if (index >= content.length) {
                clearInterval(interval);
            }
        }, 40);

        return () => clearInterval(interval);
    }, [prevChats, reply]);

    return (
        <>
            {newChatFlag && <h1>Start a Chat</h1>}

            <div className="chat">
                {prevChats?.slice(0, -1).map((chat, index) => (
                    <div
                        className={chat.role === "user" ? "userDiv" : "gptDiv"}
                        key={index}
                    >
                        {chat.role === "user" ? (
                            <p className="userMessage">{chat.message}</p>
                        ) : (
                            <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
                                {chat.message}
                            </ReactMarkdown>
                        )}
                    </div>
                ))}

                {prevChats.length > 0 && latestReply !== null && (
                    <div className="gptDiv" key={"typing"}>
                        <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
                            {latestReply}
                        </ReactMarkdown>
                    </div>
                )}

                {prevChats.length > 0 && latestReply === null && (
                    <div className="gptDiv" key={"non-typing"}>
                        <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
                            {prevChats[prevChats.length - 1].message}
                        </ReactMarkdown>
                    </div>
                )}
            </div>
        </>
    );
}

export default Chat;
 