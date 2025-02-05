// import { useEffect } from "react"
import { useEffect, useState } from "react"

import styles from "./App.module.scss"

import { socket, ServerToClientEvents, ParametersToSendMessage, allNames, randomId } from "./socket"
import { Message } from "./message/Message"
import { GroupLists } from "./groupLists/GroupLists"
import { ActiveChat } from "./activeChat/ActiveChat"



// const allNames = ["Aditya", "Ben", "Connor", "Davey", "Evelyn", "Franklin", "Geralt", "Hank", "Kratos", "Leon", "Markus", "Trevor"]
// const allNames = ["", "Aditya", "Ben"]
// const randomId = Math.floor(Math.random() * (allNames.length - 1) ) + 1
const theName = allNames[randomId]
console.log(`index is ${randomId}`)
// NEXT TASKS: 

// 1) change the types, server just sends an any[]

// 2) make it dynamic, make the userId work

function App() {
  const [isConnected, setIsConnected] = useState(socket.connected)
  const [sender, setSender] = useState(theName)
  const id = randomId
  const [allMessages, setAllMessages] = useState<Chats>({})
  const [draftMsg, setDraftMsg] = useState("")
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)

  const [groups, setGroups] = useState<Parameters<ServerToClientEvents["getGroupIdsAndNames"]>[0]>({})

  useEffect(() => {
    console.log("A project by Aditya Anuragi")
  }, [])

  useEffect(() => {
    function handleConnect() {
      setIsConnected(true)
      // if (selectedGroup) {
      //   socket.emit("joinRoom", selectedGroup)
      // }

      Object.keys(allMessages).forEach(group => {
        socket.emit("joinRoom", group)
      })

    }

    function handleDisconnect() {
      // socket.connect()
      setIsConnected(false)
    }

    const handleMessageReceived: ServerToClientEvents["message"] = (sender, idReceived, msg, fromGroup) => {
      if (idReceived === id) return

      setAllMessages((curr) => {
        console.log("setting this state")
        const copy = JSON.parse(JSON.stringify(curr)) as Chats
        // copy.push({msg: `${sender}: ${msg}`, id: self.crypto.randomUUID(), senderID: idReceived})
        // const nonNullSelectedGroup = selectedGroup!
        copy[fromGroup].push({ msg: `${sender}: ${msg}`, id: self.crypto.randomUUID(), senderID: idReceived, messageStatus: "✅", isRetrying: false })
        return copy
      })
    }

    const handleGetMissedMessages: ServerToClientEvents["getMissedMessages"] = (message) => {
      console.log(`message on online is`)
      console.log(message)

      Object.keys(message).forEach(group => {
        message[group].forEach(message => {
          message.isRetrying = false
          message.messageStatus = "✅"
        })
      })

      setAllMessages(message)

    }

    const handleGetGroupIdsAndNames: ServerToClientEvents["getGroupIdsAndNames"] = (groupIdsAndName) => {
      console.log("the groups are: ")
      console.log(groupIdsAndName)
      // groups.current = groupIdsAndName
      setGroups(groupIdsAndName)
      console.log(Object.keys(groupIdsAndName))
      Object.keys(groupIdsAndName).forEach(group => handleRoomJoin(group))
    }

    socket.on("message", handleMessageReceived)
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("getMissedMessages", handleGetMissedMessages);
    socket.on("getGroupIdsAndNames", handleGetGroupIdsAndNames)

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("message", handleMessageReceived)
      socket.off("getMissedMessages", handleGetMissedMessages);
      socket.off("getGroupIdsAndNames", handleGetGroupIdsAndNames)
    }
  }, [allMessages, groups, id, selectedGroup])

  useEffect(() => {
    function handleFocus() {
      socket.connect()
      if (socket.connected) {
        setIsConnected(true)
      }
      else {
        setIsConnected(false)
      }
      console.log("window was focused")
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

  }, [])

  function handleSendMsg(indexOfMessage?: number) {
    // let index = -1;
    // console.log(`isRetry: ${isRetry}`)
    // console.log(`index: ${indexOfMessage !== undefined}`)
    // console.log("")
    const cryptoId = (indexOfMessage !== undefined) ? allMessages[selectedGroup!][indexOfMessage!].id : self.crypto.randomUUID()

    console.log(`cryptoId is ${cryptoId}`)

    // console.log(`isRetry: ${!isRetry}`)
    // console.log(`index: ${indexOfMessage === undefined}`)
    // console.log("")

    if (indexOfMessage === undefined) {
      setAllMessages((prev) => {
        const copy = JSON.parse(JSON.stringify(prev)) as Chats
        const nonNullSelectedGroup = selectedGroup!
        copy[nonNullSelectedGroup].push({ msg: `${sender}: ${draftMsg}`, id: cryptoId, senderID: id, messageStatus: "🕗", isRetrying: false })
        // index -= 1
        return copy
      })
    }

    else {
      setAllMessages((prev) => {
        const copy = JSON.parse(JSON.stringify(prev)) as Chats
        const nonNullSelectedGroup = selectedGroup!
        // copy[nonNullSelectedGroup].push({ msg: `${sender}: ${draftMsg}`, id: cryptoId, senderID: id, messageStatus: "🕗", isRetrying: false })
        // index -= 1
        console.log("setting isRetying to true")
        copy[nonNullSelectedGroup][indexOfMessage].isRetrying = true
        return copy
      })
    }

    const nonNullSelectedGroup = selectedGroup!

    const totalTries = 2
    const theActualCryptoId = cryptoId

    // const foo: ParametersToSendMessage

    const retryMessage = (sender: ParametersToSendMessage[0], id: ParametersToSendMessage[1], msg: ParametersToSendMessage[2], selectedGroup: ParametersToSendMessage[3], cryptoId: ParametersToSendMessage[4], maxTries = totalTries) => {
      if (maxTries === 0) {
        console.log("I can no longer try to send the message")

        setAllMessages((prev) => {
          const copy = JSON.parse(JSON.stringify(prev)) as Chats
          const index = copy[selectedGroup].findIndex((value) => value.id === cryptoId)
          copy[selectedGroup][index].messageStatus = "❌"
          copy[selectedGroup][index].isRetrying = false
          return copy
        })

        return
      }

      console.log(`Trial attempt: ${totalTries - maxTries + 1}`)
      socket.timeout(4000).emit("message", sender, id, msg, selectedGroup, cryptoId, (error, response, cryptoId, selectedGroup) => {
        // console.log(`The status is ${response.status}`)

        if (error) {
          console.log("there was an error, trying again")
          // console.log(`Retry crypto id is ${cryptoId}`)
          retryMessage(sender, id, draftMsg, nonNullSelectedGroup, theActualCryptoId, maxTries - 1)
        }

        else {
          console.log(`Got a response ${response.status}, with attempt number ${maxTries}`)
          // console.log(`Returned cryptoId is ${cryptoId}`)
          setAllMessages((prev) => {
            const copy = JSON.parse(JSON.stringify(prev)) as Chats
            // const nonNullSelectedGroup = selectedGroup!
            console.log("state is ")
            console.log(copy)
            const index = copy[selectedGroup].findIndex((value) => value.id === cryptoId)
            console.log(`Returned crypto id is`)
            console.log(`index is ${index}`)
            copy[selectedGroup][index].messageStatus = "✅"
            return copy
          })
        }
      })
    }

    // console.log(`isRetry: ${isRetry}`)
    // console.log(`index: ${indexOfMessage !== undefined}`)
    // console.log("")

    retryMessage(sender, id, (indexOfMessage !== undefined) ? allMessages[selectedGroup!][indexOfMessage!].msg.split(": ")[1] : draftMsg, nonNullSelectedGroup, cryptoId)

    // socket.emit("message", sender, id, draftMsg, nonNullSelectedGroup, cryptoId, (response, cryptoId, selectedGroup) => {
    //   // console.log(`The status is ${response.status}`)

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


    setDraftMsg("")
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      handleSendMsg()
    }
  }

  function handleRoomJoin(roomName: string) {
    socket.emit("joinRoom", roomName)
    setAllMessages(prev => {
      const copy = JSON.parse(JSON.stringify(prev)) as Chats
      if (copy[roomName] === undefined) {
        copy[roomName] = []
      }
      console.log("Inside room select")
      console.log(copy)
      return copy
    })
    // setSelectedGroup(roomName)
  }
  return (
    <>
      <h2>Connected: {`${isConnected}`}</h2>
      <label>
        Name
        <input type="text" value={sender} onChange={(e) => setSender(e.target.value)} />
      </label>
      <br />
      <br />
      <br />

      <label>
        Unique ID
        <input type="number" readOnly value={id} />
      </label>
      <br />
      <br />
      <br />

      <button onClick={() => socket.connect()} >Connect</button>
      <button onClick={() => socket.disconnect()} >disconnect</button>
      <br />
      <br />

      {/*<button onClick={() => handleRoomJoin("1")} >Join Group one</button>
      <button onClick={() => handleRoomJoin("2")} >Join Group two</button>*/}

      {/* <button onClick={() => setSelectedGroup("1")} >Group one chat</button>
      <button onClick={() => setSelectedGroup("2")} >Group two chat</button> */}

      <div className={`${styles.groupListAndActiveChat}`} >
        {Object.keys(groups).length !== 0 && <GroupLists groups={groups} setSelectedGroup={setSelectedGroup} />}

        {(selectedGroup && allMessages[selectedGroup].length !== 0) && (
          <div className={`${styles.activeChatWrapper}`} >
            <ActiveChat allMessages={allMessages} id={id} selectedGroup={selectedGroup} handleSendMsg={handleSendMsg} />
          </div>
        )}
      </div>


      {/* {Object.keys(groups).map(group => {
        return(
          <button onClick={() => setSelectedGroup(group)}>{`${groups[group].name}`}</button>
        )
      })} */}

      {/* {selectedGroup && <h2>Selected group: {selectedGroup}</h2>} */}
      <br />
      {/* <br />
      <br /> */}

      {/* {(selectedGroup && allMessages[selectedGroup].length !== 0) && allMessages[selectedGroup].map((value, index) => {
        return (
          <div className={styles.messageAndTryAgainContainer} >
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
      })} */}

      <input type="text" value={draftMsg} onKeyDown={handleKeyDown} onChange={(e) => setDraftMsg(e.target.value)} />
      <button onClick={() => handleSendMsg()}  >Send message</button>
    </>
  )
}

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



export default App
