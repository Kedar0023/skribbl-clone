import express from "express";
import type { Request, Response } from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import type {
	ClientToServerEvents,
	InterServerEvents,
	ServerToClientEvents,
	SocketData,
	Stroke,
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

const strokes:Stroke[] = [];



io.on("connection",(socket)=>{
    console.log("a user connected");
	users.push(socket.id)

	socket.on("draw-stroke",(stroke:Stroke)=>{
		strokes.push(stroke);
		socket.broadcast.emit("draw-stroke", stroke);
	})

    socket.on("disconnect",()=>{
        console.log("user disconnected");
    })
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
