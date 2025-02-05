import { Chats } from "../App"
import { Message } from "../message/Message"

import styles from "./ActiveChat.module.scss"

export function ActiveChat({ allMessages, selectedGroup, id, handleSendMsg, draftMsg, handleKeyDown, handleOnChange }: ActiveChatTypes) {
  return (
    <div className={styles.containerForOverflow} >
      {allMessages[selectedGroup].map((value, index) => {
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
      })}
      <div className={styles.inputFieldAndButtonContainer}>
        <input className={styles.inputField} maxLength={40} placeholder="Type a message" type="text" value={draftMsg} onKeyDown={handleKeyDown} onChange={handleOnChange} />
        <button className={styles.sendButton} onClick={() => handleSendMsg()}  >Send message</button>
      </div>
    </div>
  )
}

type ActiveChatTypes = {
  allMessages: Chats,
  selectedGroup: string,
  id: number,
  handleSendMsg: (indexOfMessage?: number | undefined) => void,
  draftMsg: string,
  handleKeyDown: React.KeyboardEventHandler<HTMLInputElement>,
  handleOnChange: React.ChangeEventHandler<HTMLInputElement>
}
