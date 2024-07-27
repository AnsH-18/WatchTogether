"use client"
import { useSocket } from '@/components/SocketConnectionContext'
import React, { useEffect, useState } from 'react'
import VideoPlayer from "../../components/VideoPlayer"
import { useToast } from '@/components/ui/use-toast'
import { Title } from '@radix-ui/react-toast'
import MessageBox from '@/components/MessageBox'
import { useParams } from 'next/navigation'

function Room() {
  const socket = useSocket()

  const [play, setPlay] = useState(false)
  const [videoUrl, setVideoUrl] = useState("")
  const {toast} = useToast()
  const params = useParams()
  useEffect(() => {
    socket?.on("stream_video", (data) => {
      console.log(data);
      setVideoUrl(data.url)
      setPlay(true)
     })
     socket?.on("room_notif", (data) => {
      console.log(data)
      toast({
        title: "Room Notification",
        description: `A new user ${data.name} just joined`
      })
     })
     socket?.on("error", (data):void => {
      toast({
        title: "Error",
        description: data
      })
      
     })

     return () => {
      socket?.off("stream_video")
      socket?.off("room_notif")
      socket?.off("error")
     }
  }, [socket])

  console.log(params);
  
  return (
    <div className='p-5 flex flex-col gap-10 min-h-screen min-w-[390px] bg-black'>
      <div><p>Room</p></div>
      <div className='md:grid lg:grid-cols-5 grid-rows-6 gap-14 flex flex-col h-[480px]'>
        <div className='lg:col-span-3 row-span-4 lg:min-w-80 md:min-w-96 w-full text-lg font-bold'>
          {play ? <VideoPlayer src = {videoUrl}/> : 
            <div className='h-full flex justify-center items-center'>
              <p>Video will begin shortly</p>
            </div>}
        </div>
        <div className='col-span-2  mx-10'>
           <MessageBox {...params} /> 
        </div>
      </div>
      
    </div>
  )
}
export default Room