// import { useEffect } from "react"
import { useEffect, useState } from "react"
import { socket } from "./socket"

import { Message } from "./message/Message"

const allNames = ["Aditya", "Ben", "Connor", "Davey", "Evelyn", "Franklin", "Geralt", "Hank", "Markus"]
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
    }

    function handleDisconnect() {
      // socket.connect()
      setIsConnected(false)
    }

    function handleMessageReceived(sender: string, idReceived: number, msg: string) {
      if (idReceived === id) return

      setAllMessages((curr) => {
        console.log("setting this state")
        const copy = JSON.parse(JSON.stringify(curr))
        // copy.push({msg: `${sender}: ${msg}`, id: self.crypto.randomUUID(), senderID: idReceived})
        const nonNullSelectedGroup = selectedGroup!
        copy[nonNullSelectedGroup].push({ msg: `${sender}: ${msg}`, id: self.crypto.randomUUID(), senderID: idReceived })
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
    setAllMessages((prev) => {
      const copy = JSON.parse(JSON.stringify(prev))
      const nonNullSelectedGroup = selectedGroup!
      copy[nonNullSelectedGroup].push({ msg: `${sender}: ${draftMsg}`, id: self.crypto.randomUUID(), senderID: id })
      return copy
    })


    setDraftMsg("")
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      handleSendMsg()
    }
  }

  function handleRoomSelect(roomName: "one" | "two") {
    socket.emit("joinRoom", roomName)
    setAllMessages(prev => {
      const copy = { ...prev }
      copy[roomName] = []
      console.log("Inside room select")
      console.log(copy)
      return copy
    })
    setSelectedGroup(roomName)
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

      <button onClick={() => handleRoomSelect("one")} >Join Room one</button>
      <button onClick={() => handleRoomSelect("two")} >Join Room two</button>

      <br />
      <br />
      <br />
      <br />

      <button>Group one chat</button>
      <button>Group two chat</button>
      <br />
      <br />
      <br />

      {(selectedGroup && allMessages[selectedGroup].length !== 0) && allMessages[selectedGroup].map(value => {
        return (
          <Message
            key={value.id}
            sender={sender}
            senderID={value.senderID}
            userID={id}
            msg={value.msg.split(": ")[1]}
            selectedGroup={selectedGroup}
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
  senderID: number
}

type Chats = {
  [groupName: string]: Message[]
}



export default App
