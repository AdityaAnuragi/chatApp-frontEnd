// import { useEffect } from "react"
import { useEffect, useState } from "react"
import { socket } from "./socket"

function App() {
  const [name, setName] = useState("")
  const [draftMsg, setDraftMsg] = useState("")
  const [allMessages, setAllMessages] = useState<string []>([])
  const [isConnected, setIsConnected] = useState(socket.connected)

  useEffect(() => {

    function handleMessage(sender: string, msg: string) {
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

  },[])

  function handleSendMsg() {
    socket.emit("message", name, draftMsg)
    setDraftMsg("")
  }

  return (
    <>
      <h2>Connected: {`${isConnected}`}</h2>
      <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
      <br/>
      <br/>
      <br/>
      <button onClick={() => socket.connect()} >Connect</button>
      <button onClick={() => socket.disconnect()} >disconnect</button>
      <br/>
      <br/>

      {allMessages && allMessages.map(msg => {
        return <p>{msg}</p>
      })}

      <input type="text" value={draftMsg} onChange={(e) => setDraftMsg(e.target.value)} />
      <button onClick={handleSendMsg} >Send message</button>
    </>
  )
}

export default App
