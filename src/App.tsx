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
  const [id, setId] = useState(randomId)
  const [allMessages, setAllMessages] = useState<Message[]>([])
  const [draftMsg, setDraftMsg] = useState("")

  useEffect(() => {

    function handleMessage(sender: string, idReceived: number, msg: string) {
      if(idReceived === id) return

      setAllMessages((curr) => {
        const copy = [...curr]
        copy.push({msg: `${sender}: ${msg}`, id: self.crypto.randomUUID()})
        return copy
      })
    }

    function handleConnect() {
      setIsConnected(true)
    }

    function handleDisconnect() {
      setIsConnected(false)
    }

    socket.on("message", handleMessage)
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    return () => {
      socket.off("message", handleMessage)
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
    }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleSendMsg() {
    // socket.emit("message", sender, id, draftMsg, (response) => {
    //   console.log(`The status is ${response.status}`)
    // })
    setAllMessages((prev) => [...prev,{msg: `${sender}: ${draftMsg}`, id: self.crypto.randomUUID()}])
    setDraftMsg("")
  }

  function handleKeyDown(e:React.KeyboardEvent<HTMLInputElement>) {
    if(e.key === "Enter") {
      handleSendMsg()
    }
  }
  // console.log(`Value: ${allMessages.length !== 0}`)
  // console.log(allMessages)
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
        <input type="number" value={id} onChange={(e) => setId(Number(e.target.value))} />
      </label>
      <br />
      <br />
      <br />

      <button onClick={() => socket.connect()} >Connect</button>
      <button onClick={() => socket.disconnect()} >disconnect</button>
      <br />
      <br />

      {(allMessages.length !== 0) && allMessages.map(value => {
        return <Message key={value.id} sender={sender} id={id} msg={value.msg.split(": ")[1]} />
      })}

      <input type="text" value={draftMsg} onKeyDown={handleKeyDown} onChange={(e) => setDraftMsg(e.target.value)} />
      <button onClick={handleSendMsg}  >Send message</button>
    </>
  )
}

type Message = {
  msg: string,
  id: string
}

export default App
