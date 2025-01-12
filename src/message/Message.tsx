// import { socket } from "../socket"

// import { useEffect, useRef, useState } from "react"

import styles from  "./Message.module.scss"

export function Message({senderID, userID, msg, messageStatus}: MessageProps) {

  // const [sent, setIsSent] = useState(false)

  // TODO: the ref needs fixing as it's value isn't updated properly which is causing it re-emit messages
  // I have a feeling it's because the key prop is changing causing it restart from scratch 
  // and that's why only messages sent from this client (not the messages that are received) are being sent again
  // const emitEvent = useRef( (userID === senderID) && true )

  // useEffect(() => {
  //   // console.log(`Should an event be emitted: ${emitEvent.current}`)

  //   if(emitEvent.current) {
  //     console.log("I am emitting a message!")
  //     console.log(`Value is ${emitEvent.current}`)
  //     socket.emit("message", sender, senderID, msg, selectedGroup, (response) => {
  //       // console.log(`The status is ${response.status}`)
  //       if(response.status === "ok") {
  //         setIsSent(true)
  //       }
  //     })
  //   }
  //   emitEvent.current = false
  // },[msg, selectedGroup, sender, senderID])

  // function handleOnClick() {
  //   if(userID === senderID) {
  //     console.log("inside")
  //     socket.emit("message", sender, senderID, msg, (response) => {
  //       console.log(`The status is ${response.status}`)
  //       if(response.status === "ok") {
  //         setIsSent(true)
  //       }
  //     })
  //   }
  // }

  return (
    <div className={`${styles.container}`} >
      {(userID === senderID) && <div className={`${styles.messageStatus}`} >{messageStatus}</div>}
      <p>{msg}</p>
    </div>
  )
}

type MessageProps = {
  // sender: string,
  senderID: number,
  userID: number,
  msg: string,
  messageStatus: "🕗" | "✅" | "❌"
  // selectedGroup: "one" | "two"
}
