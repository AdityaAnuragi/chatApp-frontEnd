import { useState } from "react"

import styles from  "./Message.module.scss"

export function Message({msg}: MessageProps) {

  const [sent, setIsSent] = useState(false)



  return (
    <div className={`${styles.container}`} >
      <div className={`${styles.messageStatus}`} >{sent ? "Sent " : "Sending"}</div>
      <p>{msg}</p>
    </div>
  )
}

type MessageProps = {
  msg: string
}
