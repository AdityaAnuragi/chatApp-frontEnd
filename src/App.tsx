// import { useEffect } from "react"
import { useEffect, useState } from "react"

import styles from "./App.module.scss"

import { socket, ServerToClientEvents, ParametersToSendMessage } from "./socket"
import { Message } from "./message/Message"


const allNames = ["Aditya", "Ben", "Connor", "Davey", "Evelyn", "Franklin", "Geralt", "Hank", "Kratos", "Leon", "Markus", "Trevor"]
const randomId = Math.floor(Math.random() * allNames.length)
const theName = allNames[randomId]

// NEXT TASKS: 

// 1) fix the types for the function retryMessage as the types are just hardcoded

// 2) add the functionality to resend a message

// 3) integrate postgreSQL datatbase

function App() {
  const [isConnected, setIsConnected] = useState(socket.connected)
  const [sender, setSender] = useState(theName)
  const id = randomId
  const [allMessages, setAllMessages] = useState<Chats>({})
  const [draftMsg, setDraftMsg] = useState("")
  const [selectedGroup, setSelectedGroup] = useState<"one" | "two" | null>(null)

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
        copy[fromGroup].push({ msg: `${sender}: ${msg}`, id: self.crypto.randomUUID(), senderID: idReceived, messageStatus: "✅" })
        return copy
      })
    }

    socket.on("message", handleMessageReceived)
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("message", handleMessageReceived)
    }
  }, [allMessages, id, selectedGroup])

  function handleSendMsg(isRetry: boolean, indexOfMessage: number = -1) {
    // let index = -1;
    const cryptoId = isRetry ? allMessages[selectedGroup!][indexOfMessage].id : self.crypto.randomUUID()

    console.log(`cryptoId is ${cryptoId}`)

    if(!isRetry) {
      setAllMessages((prev) => {
        const copy = JSON.parse(JSON.stringify(prev)) as Chats
        const nonNullSelectedGroup = selectedGroup!
        copy[nonNullSelectedGroup].push({ msg: `${sender}: ${draftMsg}`, id: cryptoId, senderID: id, messageStatus: "🕗" })
        // index -= 1
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

    retryMessage(sender, id, isRetry ? allMessages[selectedGroup!][indexOfMessage].msg.split(": ")[1] : draftMsg, nonNullSelectedGroup, cryptoId)

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
      handleSendMsg(false)
    }
  }

  function handleRoomJoin(roomName: "one" | "two") {
    socket.emit("joinRoom", roomName)
    setAllMessages(prev => {
      const copy = JSON.parse(JSON.stringify(prev)) as Chats
      copy[roomName] = []
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

      <button onClick={() => handleRoomJoin("one")} >Join Group one</button>
      <button onClick={() => handleRoomJoin("two")} >Join Group two</button>

      <br />
      <br />
      <br />
      <br />

      <button onClick={() => setSelectedGroup("one")} >Group one chat</button>
      <button onClick={() => setSelectedGroup("two")} >Group two chat</button>
      {selectedGroup && <h2>Selected group: {selectedGroup}</h2>}
      <br />
      {/* <br />
      <br /> */}

      {(selectedGroup && allMessages[selectedGroup].length !== 0) && allMessages[selectedGroup].map((value, index) => {
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
            {value.messageStatus === "❌" && <p onClick={() => handleSendMsg(true, index)} >Message failed try again</p> }
          </div>
        )
      })}

      <input type="text" value={draftMsg} onKeyDown={handleKeyDown} onChange={(e) => setDraftMsg(e.target.value)} />
      <button onClick={() => handleSendMsg(false)}  >Send message</button>
    </>
  )
}

type Message = {
  msg: string,
  id: `${string}-${string}-${string}-${string}-${string}`,
  senderID: number,
  messageStatus: "🕗" | "✅" | "❌"
}

type Chats = {
  [groupName: string]: Message[]
}



export default App
