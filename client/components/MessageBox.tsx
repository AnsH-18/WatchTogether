import React, { useEffect, useState } from 'react'
import { useSocket } from './SocketConnectionContext'
import { useToast } from './ui/use-toast'

interface message {
    userName: string
    content: string
    time: number
}

function MessageBox(props:any) {
    const {toast} = useToast()
    const socket = useSocket()
    const [messages, setMessages] = useState<message[]>([])
    const [message, setMessage] = useState("")

    console.log(messages)
    useEffect(() => {
        socket?.on("receive_message", (data:message) => {
            console.log(data)
            setMessages(prev => [...prev, data])
        })
        socket?.on("error", (data) => {
            toast({
                title: "Error",
                description: data
            })
        })

        return () => {
            socket?.off("receive_message")
            socket?.off("error")
        }
    }, [])


    const sendMessage = () => {
        socket?.emit("send_message", {content: message, roomId: props.room})
    }

  return (
    <div className='grid grid-rows-8  gap-5 p-5  h-[500px] justify-between w-fit '>
        <div className='bg-slate-1100 row-span-7 w-96 p-4 overflow-y-auto overflow-x-hidden'>
            {messages.map((object) => {
                return (
                    <div className='p-2 bg-slate-950 mb-2'>
                        <div className='text-[10px] text-gray-400'>
                            <p>{object.userName}</p>
                        </div>
                        <div>
                            <p>{object.content}</p>
                        </div>
                    </div>
                )
            })}
        </div>
        <div className='row-span-1 w-full flex justify-between gap-5'>
            <input className='border-[1px] border-slate-800 text-white bg-inherit px-2 w-full' placeholder='message' type='text' onChange={(e) => setMessage(e.target.value)}></input>
            <button className='bg-white text-black px-2 font-bold' onClick={sendMessage}>Send</button>
        </div>
        
    </div>
  )
}

export default MessageBox