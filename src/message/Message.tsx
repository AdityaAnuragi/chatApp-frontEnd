import { socket } from "../socket"

import { useEffect, useRef, useState } from "react"

import styles from  "./Message.module.scss"

export function Message({sender, id, msg}: MessageProps) {

  const [sent, setIsSent] = useState(false)

  const emitEvent = useRef(true)

  useEffect(() => {
    console.log(`Should an event be emitted: ${emitEvent.current}`)

    // if(emitEvent) {
    //   socket.emit("message", sender, id, msg, (response) => {
    //     console.log(`The status is ${response.status}`)
    //     if(response.status === "ok") {
    //       setIsSent(true)
    //     }
    //   })
    // }
    emitEvent.current = false
  },[])

  function handleOnClick() {
    socket.emit("message", sender, id, msg, (response) => {
      console.log(`The status is ${response.status}`)
      if(response.status === "ok") {
        setIsSent(true)
      }
    })
  }

  return (
    <div className={`${styles.container}`} >
      <div className={`${styles.messageStatus}`} >{sent ? "Sent " : "Sending"}</div>
      <p onClick={handleOnClick} >{msg}</p>
    </div>
  )
}

type MessageProps = {
  sender: string,
  id: number,
  msg: string
}
