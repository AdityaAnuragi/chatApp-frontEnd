import { useEffect, useRef } from "react"
import { Chats } from "../homePage/HomePage"
import { Message } from "../message/Message"

import styles from "./ActiveChat.module.scss"

export function ActiveChat({ allMessages, selectedGroup, selectedGroupName, id, handleSendMsg, draftMsg, handleOnChange, setShowInviteToGroup, setSelectedGroup, chatType }: ActiveChatTypes) {

  const scrollContainer = useRef() as React.MutableRefObject<HTMLDivElement>

  const inputField = useRef() as React.MutableRefObject<HTMLDivElement>

  // function scrollDownAndSendMsg() {
  //   scrollContainer.current.scrollTo(0,scrollContainer.current.scrollHeight + 100)
  //   handleSendMsg()
  // }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      handleSendMsg()
    }
  }

  function handleClick() {
    if(chatType === "group") {
      setShowInviteToGroup(true)
    }
  }

  useEffect(() => {
    // console.log("🚀 ~ useLayoutEffect ~ scrollContainer.current.scrollTop:", scrollContainer.current.scrollTop)
    // console.log("🚀 ~ useLayoutEffect ~ scrollContainer.current.scrollHeight:", scrollContainer.current.scrollHeight)
    // console.log(`scroll height is ${scrollContainer.current.scrollHeight - scrollContainer.current.scrollTop}`)
    scrollContainer.current.scrollTo({
      top: scrollContainer.current.scrollHeight,
      left: 0,
      behavior: (scrollContainer.current.scrollHeight - scrollContainer.current.scrollTop) <= 1000 ? "smooth" : "instant",
    })
  }, [allMessages])

  // useEffect(() => {
  //   function handleBeforeUnload(e: HashChangeEvent) {
  //     e.preventDefault()
  //     alert("back button pressed")
  //   }

  //   window.addEventListener("hashchange", handleBeforeUnload)

  //   return () => {
  //     window.removeEventListener("hashchange", handleBeforeUnload)
  //   }


  // }, [])

  return (
    <>
      <div className={styles.container} >
        <div className={styles.backButtonAndConvName} >
          {/* <button onClick={() => setSelectedGroup(null)} >back</button> */}
          <i onClick={() => setSelectedGroup(null)} tabIndex={0} className={`fa-solid fa-arrow-left ${styles.icon}`}></i>
          <h3 onClick={handleClick} className={chatType === "group" ? styles.groupName : ""} >{selectedGroupName}</h3>
        </div>
        <div className={styles.containerForOverflow} ref={scrollContainer} >
          {allMessages[selectedGroup]?.map((value, index) => {
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
                      // : <button onClick={() => handleSendMsg(index)} >Message failed try again</button>
                      : <i onClick={() => handleSendMsg(index)} className={`fa-solid fa-rotate-right ${styles.icon}`}></i>
                  )
                }
              </div>
            )
          })}
        </div>
        <div className={styles.inputFieldAndButtonContainer}>
          <input className={styles.inputField} maxLength={40} placeholder="Type a message" type="text" value={draftMsg} onKeyDown={handleKeyDown} onChange={handleOnChange} />
          {/* <button className={styles.sendButton} onClick={() => handleSendMsg()}  >Send message</button> */}
          <i ref={inputField} onClick={() => handleSendMsg()} className={`fa-solid fa-location-arrow ${styles.icon}`}></i>
        </div>
      </div>
    </>
  )
}

type ActiveChatTypes = {
  allMessages: Chats,
  selectedGroup: string,
  selectedGroupName: string
  id: number,
  draftMsg: string,
  chatType: "group" | "private"
  handleSendMsg: (indexOfMessage?: number | undefined) => void,
  handleOnChange: React.ChangeEventHandler<HTMLInputElement>,
  setShowInviteToGroup: React.Dispatch<React.SetStateAction<boolean>>,
  setSelectedGroup: React.Dispatch<React.SetStateAction<string | null>>
}
