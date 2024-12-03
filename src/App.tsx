// import { useEffect } from "react"
import { useEffect, useState } from "react"
import { socket } from "./socket"

const allNames = ["Aditya", "Ben", "Connor", "Davey", "Evelyn", "Franklin", "Geralt", "Hank", "Markus"]
const randomId = Math.floor(Math.random() * allNames.length)
const theName = allNames[randomId]
function App() {
  const [isConnected, setIsConnected] = useState(socket.connected)
  const [name, setName] = useState(theName)
  const [id, setId] = useState(randomId)
  const [allMessages, setAllMessages] = useState<string[]>([])
  const [draftMsg, setDraftMsg] = useState("")

  useEffect(() => {

    function handleMessage(sender: string, idReceived: number, msg: string) {
      if(idReceived === id) return

      setAllMessages((curr) => {
        const copy = [...curr]
        copy.push(`${sender}: ${msg}`)
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
    socket.emit("message", name, id, draftMsg)
    setAllMessages((prev) => [...prev,`${name}: ${draftMsg}`])
    setDraftMsg("")
  }

  function handleKeyDown(e:React.KeyboardEvent<HTMLInputElement>) {
    if(e.key === "Enter") {
      handleSendMsg()
    }
  }

  return (
    <>
      <h2>Connected: {`${isConnected}`}</h2>
      <label>
        Name
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
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

      {allMessages && allMessages.map((msg, index) => {
        return <p key={index} >{msg}</p>
      })}

      <input type="text" value={draftMsg} onKeyDown={handleKeyDown} onChange={(e) => setDraftMsg(e.target.value)} />
      <button onClick={handleSendMsg}  >Send message</button>
    </>
  )
}

export default App
