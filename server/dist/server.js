var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import { upload } from "./middleware/multer.middleware.js";
import uploadToCloudinary from "./utils/coudinary.js";
const app = express();
app.use(cors());
app.use(express.json());
const server = http.createServer(app);
const prisma = new PrismaClient();
const io = new Server(server, {
    cors: {
        origin: 'https://watch-together-65jrdqc93-ansh-19s-projects.vercel.app',
        methods: ['GET', 'POST'],
    },
});
io.on("connection", (socket) => {
    console.log("User Connected", socket.id);
    socket.on("create_room", (_a) => __awaiter(void 0, [_a], void 0, function* ({ roomCode, userName, videoUrl }) {
        //check if room with this code not already exist -> to do 
        //create a room with the roomCode
        //create a user with the created room 
        //take the url file from the input and settimeout to send the file to all the user
        //close the room so that no one can join it afterwards
        roomCode = parseInt(roomCode);
        console.log(typeof roomCode);
        const checkRoom = yield prisma.room.findFirst({
            where: {
                code: roomCode
            }
        });
        if (checkRoom) {
            socket.emit("error", "Room Already exists");
            return;
        }
        const room = yield prisma.room.create({
            data: {
                code: roomCode,
                // users: userId ? {connect: {id: userId}} : undefined,
                open: true,
                videoUrl: videoUrl
            }
        });
        if (!room) {
            socket.emit("error", "Room Cannot be Created");
            return;
        }
        const createdUser = yield prisma.user.create({
            data: {
                name: userName,
                socketId: socket.id,
                room: { connect: { id: room.id } }
            }
        });
        if (!createdUser) {
            socket.emit("error", "Something went Wrong");
            return;
        }
        socket.join(roomCode);
        socket.emit("room_joined", room);
        setTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
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
            });
        }), 20000);
    }));
    socket.on("join_room", (_b) => __awaiter(void 0, [_b], void 0, function* ({ roomCode, userName }) {
        roomCode = parseInt(roomCode);
        const room = yield prisma.room.findUnique({
            where: {
                code: roomCode,
                open: true
            }
        });
        if (!room) {
            socket.emit("error", "Room Not Exists");
            return;
        }
        const createdUser = yield prisma.user.create({
            data: {
                name: userName,
                room: { connect: { id: room === null || room === void 0 ? void 0 : room.id } },
                socketId: socket.id
            }
        });
        if (!createdUser) {
            socket.emit("error", "Something went Wrong");
            return;
        }
        socket.join(roomCode);
        socket.emit("room_joined", room);
        socket.to(roomCode).emit("room_notif", {
            message: "A new User Joined",
            name: userName,
            time: Date.now()
        });
    }));
    socket.on("send_message", (_c) => __awaiter(void 0, [_c], void 0, function* ({ roomId, content }) {
        console.log("reached");
        const user = yield prisma.user.findFirst({
            where: {
                socketId: socket.id
            }
        });
        console.log("reached");
        const message = yield prisma.message.create({
            data: {
                user: { connect: { id: user === null || user === void 0 ? void 0 : user.id } },
                room: { connect: { id: roomId } },
                content: content
            }
        });
        const room = yield prisma.room.findFirst({
            where: {
                id: roomId
            }
        });
        if (!room) {
            socket.emit("error", "something went wrong");
            return;
        }
        // socket.to().emit("receive_message","message")
        console.log(room.code.toString());
        io.to(`${room.code}`).emit("receive_message", {
            userName: user === null || user === void 0 ? void 0 : user.name,
            content: message.content,
            time: Date.now()
        });
    }));
});
app.post("/upload-video", upload.single("videofile"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    // take the file path from the req and upload it to cloudinary 
    // return the url in the response
    console.log((_a = req.file) === null || _a === void 0 ? void 0 : _a.path);
    const localpath = (_b = req.file) === null || _b === void 0 ? void 0 : _b.path;
    if (!localpath) {
        return res.status(400).json({
            message: "file is required"
        });
    }
    const uploadedFile = yield uploadToCloudinary(localpath);
    if (!uploadedFile) {
        return res.status(400).json({
            message: "file cannot be uploaded to the server"
        });
    }
    return res.status(200).json({
        message: "file uploaded successfully",
        url: uploadedFile.url,
        success: true
    });
}));
console.log("server");
server.listen(8000, () => {
    console.log("Server is running on port", 8000);
});
