"use client"

import React, {createContext, useContext, useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';


const SocketContext = createContext<Socket | null>(null); 

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children } :Readonly<{
    children: React.ReactNode;
  }>) => {
  
  type mysocket = Socket
  const [socket, setSocket] = useState<mysocket | null>(null) 

  useEffect(() => {
    const newSocket = io("https://watch-together-emer.vercel.app:8000"); // Replace with your server URL
    setSocket(newSocket);

    return () => {newSocket.close();}
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
