import express from "express"
import http from "http"
import { Server, Socket } from "socket.io"
import cors from "cors"
import {  PrismaClient } from "@prisma/client"
import {upload} from "./middleware/multer.middleware"
import uploadToCloudinary  from "./utils/coudinary"


const app = express()
app.use(cors())
app.use(express.json())

const server = http.createServer(app)
const prisma = new PrismaClient()

const io = new Server(server, {
    cors: {
      origin: 'https://watch-together-65jrdqc93-ansh-19s-projects.vercel.app',
      methods: ['GET', 'POST'],
    },
});

io.on("connection", (socket:Socket) => {
    console.log("User Connected", socket.id)
    
    socket.on("create_room", async({roomCode, userName, videoUrl}):Promise<void> => {
        //check if room with this code not already exist -> to do 
        //create a room with the roomCode
        //create a user with the created room 
        //take the url file from the input and settimeout to send the file to all the user
        //close the room so that no one can join it afterwards
        roomCode = parseInt(roomCode)
        console.log(typeof roomCode)
        const checkRoom = await prisma.room.findFirst({
            where: {
                code: roomCode
            }
        })

        if(checkRoom){
            socket.emit("error", "Room Already exists")
            return
        }

        const room = await prisma.room.create({
            data: {
                code: roomCode,
                // users: userId ? {connect: {id: userId}} : undefined,
                open: true,
                videoUrl: videoUrl
            }
        })

        if(!room){
            socket.emit("error", "Room Cannot be Created")
            return
        }

        const createdUser = await prisma.user.create({
            data: {
                name: userName,
                socketId: socket.id,
                room: {connect: {id: room.id}}
            }
        })

        if(!createdUser){
            socket.emit("error", "Something went Wrong")
            return 
        }
        socket.join(roomCode)
        socket.emit("room_joined", room)
        setTimeout(async () => {
            // const closeRoom = await prisma.room.update({
            //     where: {
            //         code: roomCode
            //     },
            //     data: {
            //         open: false
            //     }
            // })
            io.to(roomCode).emit("stream_video", {
                message: "Video file ready to play",
                url: videoUrl
            })
        }, 20000)

    })

    socket.on("join_room", async ({roomCode, userName}):Promise<void> => {
        roomCode = parseInt(roomCode)
        const room = await prisma.room.findUnique({
            where: {
                code: roomCode,
                open: true
            }
        })

        if(!room){
            socket.emit("error", "Room Not Exists")
            return 
        }

        const createdUser = await prisma.user.create({
            data: {
                name: userName,
                room: {connect: {id: room?.id}},
                socketId: socket.id
            }
        })

        if(!createdUser){
            socket.emit("error", "Something went Wrong")
            return 
        }

        socket.join(roomCode)
        socket.emit("room_joined", room)
        socket.to(roomCode).emit("room_notif", {
            message: "A new User Joined",
            name: userName,
            time: Date.now()
        }) 
    })
    socket.on("send_message", async({roomId, content}):Promise<void> => {
        console.log("reached")
        const user  = await prisma.user.findFirst({
            where: {
                socketId: socket.id
            }
        })
        console.log("reached")
       
        const message = await prisma.message.create({
            data: {
                user: {connect : {id: user?.id}},
                room: {connect : {id: roomId}},
                content: content
            }
        })
        const room = await prisma.room.findFirst({
            where: {
                id: roomId
            }
        })
        if(!room){
            socket.emit("error", "something went wrong")
            return
        }
        // socket.to().emit("receive_message","message")
        console.log(room.code.toString())
        io.to(`${room.code}`).emit("receive_message", { //watch out 
            userName: user?.name,
            content: message.content,
            time: Date.now()
        })
    })
})


app.post("/upload-video",upload.single("videofile") ,async (req, res) => {
    // take the file path from the req and upload it to cloudinary 
    // return the url in the response
    console.log(req.file?.path)
    const localpath = req.file?.path as string
    if(!localpath){
        return res.status(400).json({
            message: "file is required"
        })
    }
    const uploadedFile = await uploadToCloudinary(localpath)
    if(!uploadedFile){
        return res.status(400).json({
            message: "file cannot be uploaded to the server"
        })
    }
    return res.status(200).json({
        message: "file uploaded successfully",
        url: uploadedFile.url,
        success: true
    })
})
console.log("server")
server.listen(8000, () => {
    console.log("Server is running on port", 8000);
})