"use client"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { useSocket } from "./SocketConnectionContext"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "./ui/use-toast"

export function TabsDemo() {

  const socket = useSocket()
  const [userName, setUserName] = useState("")
  const [code, setCode] = useState("")
  const [videoFilePath, setVideoFilePath] = useState<string | Blob>("")
  const router = useRouter()
  const {toast} = useToast()
  useEffect(() => {
    console.log("thing")
    socket?.on("room_joined", (data):void => {
      const roomId = data.id
      router.push(`/${roomId}`)
    })
    socket?.on("error", (data):void => {
      console.log(data)
      toast({
        title: "Error",
        description: data
      })
    })

    return () => {
      socket?.off("room_joined")
      socket?.off("error")
    }
  }, [socket])
  const createRoom = async () => {
    //upload file
    //emit create_room with the file mp4 url

   try {
     const baseurl = "https://watch-together-emer.vercel.app/upload-video"
     const formData = new FormData()
     formData.append("videofile", videoFilePath) 
     const response = await fetch(baseurl, {
      method: 'POST',
      body: formData,
    })

    const data = await response.json()
    if(data.success){
      socket?.emit("create_room", {userName, roomCode: code, videoUrl: data.url})
    } 

    //  socket?.emit("create_room", {userName, roomCode: code})
   } catch (error) {
      console.log(error)
   }
  }

  const joinRoom = () => {
    //enter room code and userName
    //server will emit the video file after the room is closed
    socket?.emit("join_room", ({userName, roomCode: code}))
  }

  return (
    <Tabs defaultValue="createRoom" className="w-[400px]">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="createRoom">Create Room</TabsTrigger>
        <TabsTrigger value="joinRoom">Join Room</TabsTrigger>
      </TabsList>
      <TabsContent value="createRoom">
        <Card>
          <CardHeader>
            <CardTitle>Create Room</CardTitle>
            <CardDescription>
              Select the video and create a code for others to join
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="userName">User Name</Label>
              <Input required onChange={(e) => setUserName(e.target.value)} id="userName"  />
            </div>
            <div className="space-y-1">
              <Label htmlFor="roomCode">Room Code</Label>
              <Input onChange={(e) => setCode(e.target.value)} required id="roomCode"/>
            </div>
            <div className="space-y-1">
              <Label htmlFor="roomCode">Select File</Label>
              <Input onChange={(e) => setVideoFilePath(e.target.files ? e.target.files[0] : "")}  required id="roomCode" type="file"/>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={createRoom}>Create</Button>
          </CardFooter>
        </Card>
      </TabsContent>
      <TabsContent value="joinRoom">
        <Card>
          <CardHeader>
            <CardTitle>Join Room</CardTitle>
            <CardDescription>
              Join a room by entering the joining code
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="userName">User Name</Label>
              <Input onChange={(e) => setUserName(e.target.value)} required id="userName" type="text" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="joiningCode">Room Code</Label>
              <Input onChange={(e) => setCode(e.target.value)} required id="joiningCode" type="text" />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={joinRoom}>Join Room</Button>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
