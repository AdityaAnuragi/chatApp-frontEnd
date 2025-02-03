import { Chats } from "../App"
import { Message } from "../message/Message"

import styles from "./ActiveChat.module.scss"

export function ActiveChat({allMessages, selectedGroup, id, handleSendMsg}: ActiveChatTypes) {
  return (
    allMessages[selectedGroup].map((value, index) => {
      return (
        <div className={`${styles.messageAndTryAgainContainer} ${value.senderID === id ? styles.rightSide : styles.leftSide}`} >
          <Message
            key={value.id}
            // sender={sender}
            senderID={value.senderID}
            userID={id}
            msg={value.msg.split(": ")[1]}
            messageStatus={value.messageStatus}
          // selectedGroup={selectedGroup}
          />
          {value.messageStatus === "❌"
            && (
              value.isRetrying
                ? <p>Retrying...</p>
                : <button onClick={() => handleSendMsg(index)} >Message failed try again</button>
            )
          }
        </div>
      )
    })
  )
}

type ActiveChatTypes = {
  allMessages: Chats,
  selectedGroup: string,
  id: number,
  handleSendMsg: (indexOfMessage?: number | undefined) => void
}
