import express from 'express';
import Thread from '../models/Thread.js';
import { get } from 'mongoose';
import getOpenAIResponse from '../utils/openAI.js';
import { verifyToken } from './auth.js';
const router=express.Router();

router.get('/thread', verifyToken, async (req, res) => {
    try{
        const filter = req.user ? { userId: req.user.id } : { userId: null };
        const threads=await Thread.find(filter).sort({updatedAt:-1});
        res.json(threads);
    }catch(err){
        console.log("Error in /threads route:", err);
        res.status(500).send("Internal Server Error");
    }
})


router.get("/thread/:threadId", verifyToken, async (req, res) => {
    const {threadId}=req.params;
    try{
        const filter = req.user ? { userId: req.user.id } : { userId: null };
        const thread=await Thread.findOne({threadId, ...filter});
        if(!thread){
            return res.status(404).send("Thread not found or unauthorized");
        }
        return res.status(200).json(thread.messages);
    }catch(err){
        console.log("Error in /threads/:threadId route:", err);
        res.status(500).send("Internal Server Error");
    }
})

router.delete("/thread/:threadId", verifyToken, async (req, res) => {
    const {threadId}=req.params;
    try{
        const filter = req.user ? { userId: req.user.id } : { userId: null };
        const deletedThread=await Thread.findOneAndDelete({threadId, ...filter});
        if(!deletedThread){
            return res.status(404).send("Thread not found or unauthorized");
        }
        res.status(200).send("Thread deleted successfully");
    }catch(err){
        console.log("Error in DELETE /threads/:threadId route:", err);
        res.status(500).send("Internal Server Error");
    }
})


router.post("/chat", verifyToken, async (req, res) => {
    const {threadId, message}=req.body;
    if(!threadId || !message){
        return res.status(400).send("threadId and message are required");
    }
    try{
        const filter = req.user ? { userId: req.user.id } : { userId: null };
        let thread=await Thread.findOne({threadId, ...filter});
        if(!thread){
             thread=new Thread({
                threadId,
                title:message,
                userId: req.user ? req.user.id : null,
                messages:[{role:"user", content:message}]
            });
        }else{
            thread.messages.push({role:"user", content:message});
        }
        const assistantReply=await getOpenAIResponse(message);
        thread.messages.push({role:"assistant", content:assistantReply});
        thread.updatedAt=Date.now();
        await thread.save();
        res.json({reply:assistantReply});
    }catch(err){
        console.log("Error in /chat route:", err);  
        res.status(500).send("Internal Server Error");
    }
})

export default router;
