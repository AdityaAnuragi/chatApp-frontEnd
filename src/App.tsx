// import { useEffect } from "react"
import { useEffect, useState } from "react"
import { socket } from "./socket"

import { ServerToClientEvents } from "./socket"

import { Message } from "./message/Message"

const allNames = ["Aditya", "Ben", "Connor", "Davey", "Evelyn", "Franklin", "Geralt", "Hank", "Kratos", "Leon", "Markus", "Trevor"]
const randomId = Math.floor(Math.random() * allNames.length)
const theName = allNames[randomId]



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
      if (selectedGroup) {
        socket.emit("joinRoom", selectedGroup)
      }
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
        copy[fromGroup].push({ msg: `${sender}: ${msg}`, id: self.crypto.randomUUID(), senderID: idReceived, isSent: true })
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
  }, [id, selectedGroup])

  function handleSendMsg() {
    let index = -1;
    setAllMessages((prev) => {
      const copy = JSON.parse(JSON.stringify(prev)) as Chats
      const nonNullSelectedGroup = selectedGroup!
      index = copy[nonNullSelectedGroup].push({ msg: `${sender}: ${draftMsg}`, id: self.crypto.randomUUID(), senderID: id, isSent: false })
      index -= 1
      return copy
    })

    const nonNullSelectedGroup = selectedGroup!

    socket.emit("message", sender, id, draftMsg, nonNullSelectedGroup, (response) => {
      // console.log(`The status is ${response.status}`)
      if (response.status === "ok") {
        setAllMessages((prev) => {
          const copy = JSON.parse(JSON.stringify(prev)) as Chats
          const nonNullSelectedGroup = selectedGroup!
          copy[nonNullSelectedGroup][index].isSent = true
          return copy
        })
      }
    })


    setDraftMsg("")
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      handleSendMsg()
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

      <button onClick={() => handleRoomJoin("one")} >Join Room one</button>
      <button onClick={() => handleRoomJoin("two")} >Join Room two</button>

      <br />
      <br />
      <br />
      <br />

      <button onClick={() => setSelectedGroup("one")} >Group one chat</button>
      <button onClick={() => setSelectedGroup("two")} >Group two chat</button>
      <br />
      <br />
      <br />

      {(selectedGroup && allMessages[selectedGroup].length !== 0) && allMessages[selectedGroup].map(value => {
        return (
          <Message
            key={value.id}
            // sender={sender}
            senderID={value.senderID}
            userID={id}
            msg={value.msg.split(": ")[1]}
            isSent={value.isSent}
            // selectedGroup={selectedGroup}
          />
        )
      })}

      <input type="text" value={draftMsg} onKeyDown={handleKeyDown} onChange={(e) => setDraftMsg(e.target.value)} />
      <button onClick={handleSendMsg}  >Send message</button>
    </>
  )
}

type Message = {
  msg: string,
  id: string,
  senderID: number,
  isSent: boolean
}

type Chats = {
  [groupName: string]: Message[]
}



export default App
