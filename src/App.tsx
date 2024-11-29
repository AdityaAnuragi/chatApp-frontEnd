// import { useEffect } from "react"
import { socket } from "./socket"

function App() {
  return (
    <>
      <h1>hey</h1>
      <button onClick={() => socket.connect()} >Connect</button>
      <button onClick={() => socket.disconnect()} >disconnect</button>
      <button onClick={() => socket.emit("greet", "front end says hello")} >greet</button>
    </>
  )
}

export default App
