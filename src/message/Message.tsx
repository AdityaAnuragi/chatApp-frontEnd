import { socket } from "../socket"

import { useEffect, useRef, useState } from "react"

import styles from  "./Message.module.scss"

export function Message({sender, senderID, userID, msg, selectedGroup}: MessageProps) {

  const [sent, setIsSent] = useState(false)

  const emitEvent = useRef( (userID === senderID) && true )

  useEffect(() => {
    // console.log(`Should an event be emitted: ${emitEvent.current}`)

    if(emitEvent.current) {
      // console.log("inside")
      socket.emit("message", sender, senderID, msg, selectedGroup, (response) => {
        // console.log(`The status is ${response.status}`)
        if(response.status === "ok") {
          setIsSent(true)
        }
      })
    }
    emitEvent.current = false
  },[msg, selectedGroup, sender, senderID])

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
      {(userID === senderID) && <div className={`${styles.messageStatus}`} >{sent ? "✅" : "🕗"}</div>}
      <p>{msg}</p>
    </div>
  )
}

type MessageProps = {
  sender: string,
  senderID: number,
  userID: number,
  msg: string,
  selectedGroup: "one" | "two"
}
