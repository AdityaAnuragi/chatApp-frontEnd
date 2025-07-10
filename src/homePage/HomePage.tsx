// import { useEffect } from "react"
import { useEffect, useState } from "react"

import styles from "./HomePage.module.scss"

import { Socket } from 'socket.io-client';

import { ServerToClientEvents, ClientToServerEvents, ParametersToSendMessage } from "../socket"
import { Message } from "../message/Message"
import { GroupLists } from "../groupLists/GroupLists"
import { ActiveChat } from "../activeChat/ActiveChat"
import { SearchUsers } from "../searchUsers/SearchUsers"
import { CreateGroup } from "../createGroups/CreateGroups"
import { usePrevious } from "../custom hooks/usePrev";



// const allNames = ["Aditya", "Ben", "Connor", "Davey", "Evelyn", "Franklin", "Geralt", "Hank", "Kratos", "Leon", "Markus", "Trevor"]
// const allNames = ["", "Aditya", "Ben"]
// const randomId = Math.floor(Math.random() * (allNames.length - 1) ) + 1
// const theName = allNames[randomId]
// console.log(`index is ${randomId}`)
// NEXT TASKS: 

// 1) change the types, server just sends an any[]

// 2) make it dynamic, make the userId work

export function HomePage({ socket, id, sender }: { socket: Socket<ServerToClientEvents, ClientToServerEvents>, sender: string, id: number }) {
  const [isConnected, setIsConnected] = useState(socket.connected)
  // failedMessage state needs to be on top of allMessages since these states are updated together by React and I need to delete from 
  // failedMessage first it's necessary to put failedMessage on top first
  // otherwise allMessages is set first and nothing has been deleted from failedMessage yet so it messes up the updates
  // I found this out by seeing the ordering of the console logs
  const [unsentMessages, setUnsentMessages] = useState<UnsentChats>({})
  const [sentMessages, setSentMessages] = useState<Chats>({})
  const [draftMsg, setDraftMsg] = useState("")
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
  const [groups, setGroups] = useState<Parameters<ServerToClientEvents["getGroupIdsAndNames"]>[0]>({})
  const [showSearchUser, setShowSearchUser] = useState(false)
  const [showCreateGroup, setShowCreateGroup] = useState(false)
  const [showInviteToGroup, setShowInviteToGroup] = useState(false)
  const [windowSize, setWindowSize] = useState(document.getElementsByTagName("html")[0].clientWidth)

  const prevIsConnected = usePrevious(isConnected)

  useEffect(() => {
    function handleRoomJoin(roomName: string) {
      socket.emit("joinRoom", roomName)
      setSentMessages(prev => {
        const copy = JSON.parse(JSON.stringify(prev)) as Chats
        // console.log(`${roomName} is the roomName`)
        if (copy[roomName] === undefined) {
          copy[roomName] = []
        }
        // console.log("Inside room select")
        // console.log(copy)
        return copy
      })
      // setSelectedGroup(roomName)
    }

    function handleConnect() {
      setIsConnected(true)
      // if (selectedGroup) {
      //   socket.emit("joinRoom", selectedGroup)
      // }
      // console.log("groups to join")
      // console.log(Object.keys(allMessages))
      Object.keys(sentMessages).forEach(group => {
        socket.emit("joinRoom", group)
      })

    }

    function handleDisconnect() {
      // socket.connect()
      setIsConnected(false)
    }

    const handleMessageReceived: ServerToClientEvents["message"] = (sender, idReceived, msg, fromGroup) => {
      if (idReceived === id) return

      setSentMessages((curr) => {
        // console.log("setting this state")
        const copy = JSON.parse(JSON.stringify(curr)) as Chats
        // copy.push({msg: `${sender}: ${msg}`, id: self.crypto.randomUUID(), senderID: idReceived})
        // const nonNullSelectedGroup = selectedGroup!
        copy[fromGroup].push({ msg: `${sender}: ${msg}`, id: self.crypto.randomUUID(), senderID: idReceived, messageStatus: "✅", isRetrying: false })
        return copy
      })
    }

    const handleGetMissedMessages: ServerToClientEvents["getMissedMessages"] = (message) => {
      // console.log(`message on online is`)
      // console.log(message)

      Object.keys(message).forEach(group => {
        message[group].forEach(message => {
          message.isRetrying = false
          message.messageStatus = "✅"
        })
      })

      setSentMessages(message)

    }

    const handleGetGroupIdsAndNames: ServerToClientEvents["getGroupIdsAndNames"] = (groupIdsAndName) => {
      // console.log("the groups are: ")
      // console.log(groupIdsAndName)
      // groups.current = groupIdsAndName
      setGroups(groupIdsAndName)
      // console.log(Object.keys(groupIdsAndName))
      Object.keys(groupIdsAndName).forEach(group => handleRoomJoin(group))
    }

    const makeClientJoinRoom: ServerToClientEvents["makeClientJoinRoom"] = (pvtConvoId, pvtConvoName, chatType) => {
      handleRoomJoin(pvtConvoId)
      setGroups(prevState => {
        const copy = JSON.parse(JSON.stringify(prevState)) as Parameters<ServerToClientEvents["getGroupIdsAndNames"]>[0]
        copy[pvtConvoId] = {
          name: pvtConvoName,
          chatType: chatType
        }
        return copy
      })
    }

    socket.on("message", handleMessageReceived)
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("getMissedMessages", handleGetMissedMessages);
    socket.on("getGroupIdsAndNames", handleGetGroupIdsAndNames)
    socket.on("makeClientJoinRoom", makeClientJoinRoom)

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("message", handleMessageReceived)
      socket.off("getMissedMessages", handleGetMissedMessages);
      socket.off("getGroupIdsAndNames", handleGetGroupIdsAndNames)
      socket.off("makeClientJoinRoom", makeClientJoinRoom)
    }
  }, [sentMessages, groups, id, selectedGroup, socket])

  useEffect(() => {
    function handleFocus() {
      socket.connect()
      if (socket.connected) {
        setIsConnected(true)
      }
      else {
        setIsConnected(false)
      }
      // console.log("window was focused")
    }

    function handleOffline() {
      setIsConnected(false)
    }

    function handleOnline() {
      socket.connect()
      if (socket.connected) {
        setIsConnected(true)
      }
    }

    window.addEventListener("focus", handleFocus)
    window.addEventListener("offline", handleOffline)
    window.addEventListener("online", handleOnline)

    return () => {
      window.removeEventListener("focus", handleFocus)
      window.removeEventListener("offline", handleOffline)
      window.removeEventListener("online", handleOnline)
    }

  }, [socket])

  useEffect(() => {
    function handleResize() {
      setWindowSize(document.getElementsByTagName("html")[0].clientWidth)
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }

  }, [])

  function handleSendMsg(selectedGroup: string, indexOfMessage?: number) {
    // let index = -1;
    // console.log(`index that's used ${allMessages[selectedGroup!].length - indexOfMessage!}`)
    // console.log("event handler")
    // console.log(JSON.parse(JSON.stringify(failedMessage)))
    // console.log(`isRetry: ${isRetry}`)
    // console.log(`index: ${indexOfMessage !== undefined}`)
    // console.log("")
    // console.log("here, why isn't this working?")
    // console.log("🚀 ~ handleSendMsg ~ failedMessage:", failedMessage)
    // console.log("🚀 ~ handleSendMsg ~ selectedGroup:", selectedGroup)
    // console.log("🚀 ~ handleSendMsg ~ allMessages[selectedGroup!].length - indexOfMessage!:", allMessages[selectedGroup!].length - indexOfMessage!)
    // console.log("🚀 ~ handleSendMsg ~ allMessages[selectedGroup!].length:", allMessages[selectedGroup!].length)
    // console.log("🚀 ~ handleSendMsg ~ indexOfMessage:", indexOfMessage)

    // the reason why the index is -  allMessages[selectedGroup!].length - indexOfMessage!
    // is because while rendering I just concatenate the 2 states (allMessages and failedMessage) and that's one array 
    // and 0 index of failedMessage (with combined map method) ends up becoming allMessages[selectedGroup].length + actualIndex (say 0)
    // so to access the correct thing I need to subtract the length of the allMessages[selectedGroup]

    //console.log(sentMessages[selectedGroup!].length)
    //console.log(indexOfMessage)
    const cryptoId = (indexOfMessage !== undefined) ? unsentMessages[selectedGroup!][indexOfMessage! - sentMessages[selectedGroup!].length].id : self.crypto.randomUUID()

    // console.log(`cryptoId is ${cryptoId}`)

    // console.log(`isRetry: ${!isRetry}`)
    // console.log(`index: ${indexOfMessage === undefined}`)
    // console.log("")

    if (indexOfMessage === undefined) {
      setUnsentMessages((prev) => {
        const copy = JSON.parse(JSON.stringify(prev)) as UnsentChats
        const nonNullSelectedGroup = selectedGroup!

        copy[nonNullSelectedGroup] = copy[nonNullSelectedGroup] ?? []

        copy[nonNullSelectedGroup].push({ msg: `${sender}: ${draftMsg}`, id: cryptoId, senderID: id, messageStatus: "🕗", isRetrying: false })
        // index -= 1
        return copy
      })
    }

    else {
      setUnsentMessages((prev) => {
        const copy = JSON.parse(JSON.stringify(prev)) as UnsentChats
        const nonNullSelectedGroup = selectedGroup!
        // copy[nonNullSelectedGroup].push({ msg: `${sender}: ${draftMsg}`, id: cryptoId, senderID: id, messageStatus: "🕗", isRetrying: false })
        // index -= 1
        // console.log("setting isRetying to true")
        copy[nonNullSelectedGroup][indexOfMessage! - sentMessages[selectedGroup!].length].isRetrying = true
        return copy
      })
    }

    const nonNullSelectedGroup = selectedGroup!

    const totalTries = 2
    const theActualCryptoId = cryptoId

    // const foo: ParametersToSendMessage

    const retryMessage = (sender: ParametersToSendMessage[0], id: ParametersToSendMessage[1], msg: ParametersToSendMessage[2], selectedGroup: ParametersToSendMessage[3], cryptoId: ParametersToSendMessage[4], maxTries = totalTries) => {
      if (maxTries === 0) {
        // console.log("I can no longer try to send the message")
        // let deleteElement: Message;
        if (indexOfMessage === undefined) {
          // setAllMessages((prev) => {
          //   const copy = JSON.parse(JSON.stringify(prev)) as Chats
          //   const index = copy[selectedGroup].findIndex((value) => value.id === cryptoId)
          //   // copy[selectedGroup][index].messageStatus = "❌"
          //   // copy[selectedGroup][index].isRetrying = false
          //   deleteElement = copy[selectedGroup].splice(index, 1)[0]
          //   return copy
          // })
          setUnsentMessages(prev => {
            const copy = JSON.parse(JSON.stringify(prev)) as UnsentChats
            if (copy[selectedGroup] === undefined) {
              copy[selectedGroup] = []
            }
            // copy[selectedGroup].push({...deleteElement, messageStatus: "❌"})
            const index = copy[selectedGroup].findIndex((value) => value.id === cryptoId)
            copy[selectedGroup][index].messageStatus = "❌"
            return copy
          })
        }

        else {
          setUnsentMessages(prev => {
            const copy = JSON.parse(JSON.stringify(prev)) as UnsentChats
            copy[selectedGroup][indexOfMessage! - sentMessages[selectedGroup!].length].isRetrying = false
            return copy
          })
        }

        return
      }

      // console.log(`Trial attempt: ${totalTries - maxTries + 1}`)
      socket.timeout(4000).emit("message", sender, id, msg, selectedGroup, cryptoId, (error, _response, cryptoId, selectedGroup) => {
        // console.log(`The status is ${response}`)
        if (error) {
          // console.log("there was an error, trying again")
          // console.log(`Retry crypto id is ${cryptoId}`)
          retryMessage(sender, id, msg, nonNullSelectedGroup, theActualCryptoId, maxTries - 1)
        }

        else {
          // console.log(`Got a response ${response.status}, with attempt number ${maxTries}`)
          // console.log(`Returned cryptoId is ${cryptoId}`)
          // if (indexOfMessage === undefined) {

          //   let deleteElement: Message;
          //   setFailedMessage(prev => {
          //     // console.log(JSON.parse(JSON.stringify(prev)))

          //     const copy = JSON.parse(JSON.stringify(prev)) as Chats
          //     deleteElement = copy[selectedGroup].splice(0, 1)[0]

          //     // console.log(deleteElement)
          //     return copy
          //   })

          //   setAllMessages(prev => {
          //     // console.log(JSON.parse(JSON.stringify(prev)))
          //     const copy = JSON.parse(JSON.stringify(prev)) as Chats

          //     // console.log(deleteElement)
          //     copy[selectedGroup].push({ ...deleteElement, messageStatus: "✅" })
          //     return copy
          //   })

          //   // setAllMessages((prev) => {
          //   //   const copy = JSON.parse(JSON.stringify(prev)) as Chats
          //   //   const index = copy[selectedGroup].findIndex((value) => value.id === cryptoId)
          //   //   copy[selectedGroup][index].messageStatus = "✅"
          //   //   return copy
          //   // })
          // }

          // else {
          let deleteElement: Message;
          setUnsentMessages(prev => {
            // console.log(JSON.parse(JSON.stringify(prev)))

            const copy = JSON.parse(JSON.stringify(prev)) as UnsentChats
            const index = copy[selectedGroup].findIndex(value => value.id === cryptoId)
            deleteElement = copy[selectedGroup].splice(index, 1)[0]

            // console.log(deleteElement)
            return copy
          })

          setSentMessages(prev => {
            // console.log(JSON.parse(JSON.stringify(prev)))
            const copy = JSON.parse(JSON.stringify(prev)) as Chats

            // console.log(deleteElement)
            copy[selectedGroup].push({ ...deleteElement, messageStatus: "✅" })
            return copy
          })

          // }

        }
      })
    }

    // console.log(`isRetry: ${isRetry}`)
    // console.log(`index: ${indexOfMessage !== undefined}`)
    // console.log("")

    retryMessage(sender, id, (indexOfMessage !== undefined) ? unsentMessages[selectedGroup!][indexOfMessage! - sentMessages[selectedGroup!].length].msg.split(": ")[1] : draftMsg, nonNullSelectedGroup, cryptoId)

    // socket.emit("message", sender, id, draftMsg, nonNullSelectedGroup, cryptoId, (response, cryptoId, selectedGroup) => {
    //   console.log(`The status is ${response.status}`)

    //   if (response.status === "ok") {
    //     setAllMessages((prev) => {
    //       const copy = JSON.parse(JSON.stringify(prev)) as Chats
    //       // const nonNullSelectedGroup = selectedGroup!
    //       const index = copy[selectedGroup].findIndex((value) => value.id === cryptoId)
    //       copy[selectedGroup][index].isSent = true
    //       return copy
    //     })
    //   }
    // })

    if (indexOfMessage === undefined) {
      setDraftMsg("")
    }
  }

  // function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
  //   if (e.key === "Enter") {
  //     handleSendMsg()
  //   }
  // }


  return (
    <>

      <div className={styles.wrapFullScreen} >

        {(showSearchUser || showInviteToGroup) && <SearchUsers userId={id} setShowSearchUser={setShowSearchUser} sender={sender} forCreatingPvtConvo={showSearchUser} selectedGroupId={selectedGroup} setShowInviteToGroup={setShowInviteToGroup} selectedGroupName={selectedGroup && groups[selectedGroup].name} socket={socket} />}
        {showCreateGroup && <CreateGroup setShowCreateGroup={setShowCreateGroup} userId={id} socket={socket} />}

        <h2 className={`${styles.offline} ${isConnected && styles.invisible} ${isConnected ? styles.blue : styles.red}`} >{isConnected ? "Back Online" : "You're offline right now"}</h2>
        {/* <h2 className={`${styles.offline} ${isConnected && styles.invisible}`} >You are offline right now</h2> */}

        <div className={`${styles.groupListAndActiveChat}`} >
          {((selectedGroup === null) || (windowSize > 600)) && <GroupLists groups={groups} setSelectedGroup={setSelectedGroup} selectedGroup={selectedGroup} setShowCreateGroup={setShowCreateGroup} setShowSearchUser={setShowSearchUser} />}

          {(selectedGroup !== null) && (selectedGroup) && (
            <div className={`${styles.activeChatWrapper}`} >
              <ActiveChat
                key={selectedGroup}
                prevIsConnected={prevIsConnected}
                isConnected={isConnected}
                sentMessages={sentMessages}
                unsentMessages={unsentMessages}
                // isConnected={isConnected}
                id={id}
                selectedGroup={selectedGroup}
                selectedGroupName={groups[selectedGroup].name}
                draftMsg={draftMsg}
                chatType={groups[selectedGroup].chatType}
                handleSendMsg={handleSendMsg}
                // handleKeyDown={handleKeyDown}
                handleOnChange={(e) => setDraftMsg(e.target.value)}
                setShowInviteToGroup={setShowInviteToGroup}
                setSelectedGroup={setSelectedGroup}
              />
            </div>
          )}
        </div>

      </div>
    </>
  )
}

type ChangePropertyOfObject<T extends object, KeyToChange extends keyof T, NewValue> = {
  [Property in keyof T]: Property extends KeyToChange ? NewValue : T[Property];
};

type Message = {
  msg: string,
  id: `${string}-${string}-${string}-${string}-${string}`,
  senderID: number,
  messageStatus: "🕗" | "✅" | "❌",
  isRetrying: boolean
}
export type Chats = {
  [groupName: string]: Message[]
}

type UnsentMessage = ChangePropertyOfObject<Message, "messageStatus", "🕗" | "❌">

export type UnsentChats = {
  [groupName: string]: UnsentMessage[]
}



