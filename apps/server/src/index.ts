import express from "express";
import type { Request, Response } from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import type {
	ClientToServerEvents,
	InterServerEvents,
	ServerToClientEvents,
	SocketData,
} from "@repo/types/socket";

const app = express();
const server = createServer(app);
const io = new Server<
	ClientToServerEvents,
	ServerToClientEvents,
	InterServerEvents,
	SocketData
>(server,{
    cors:{
        origin:"http://localhost:3000",
        methods:["GET","POST"]
    }
});

const users:string[] = [];
const messages:string[] = [];



io.on("connection",(socket)=>{
    console.log("a user connected");
	users.push(socket.id)

    socket.on("disconnect",()=>{
        console.log("user disconnected");
    })
	socket.on("chat",(msg)=>{
		messages.push(msg);
		io.emit("chat-msg",msg);
	})

	io.emit("all_users",users)
})

app.get("/", (req: Request, res: Response) => {
	res.send("one piece !!!");
});
app.get("/app", (req: Request, res: Response) => {
	res.send("socket io !!!");
});

server.listen(5000, () => {
	console.log("server is running on http://localhost:5000");
});
