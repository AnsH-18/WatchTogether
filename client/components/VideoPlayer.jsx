import React from 'react'
import {ControlBar, Player} from "video-react"
import "@/node_modules/video-react/dist/video-react.css";

function VideoPlayer(props) {
  return (
    <div className='bg-white '>
         <Player
                width={500}
                autoPlay={true}
                playsInline
                fluid
                poster="/assets/poster.png"
            >
                <ControlBar autoHide disableDefaultControls></ControlBar>
                <source src={props.src}/>
            </Player>
    </div>
  )
}

export default VideoPlayer