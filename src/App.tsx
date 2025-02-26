import { useEffect, useRef, useState } from "react"

import { HomePage } from "./homePage/HomePage"
import { LoginAndSignUp } from "./loginAndSignUp/LoginAndSignUp"

import { io, Socket } from 'socket.io-client';
import { ServerToClientEvents, ClientToServerEvents } from "./socket";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userId, setUserId] = useState(-1)
  const [name, setName] = useState("")
  const URL = "https://chatapp-server-3x2r.onrender.com"

  const socket = useRef<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null)

  // const socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = useRef(null)

  useEffect(() => {
    console.log("A project by Aditya Anuragi")
  }, [])

  // const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(URL, {
  //   autoConnect: userId === -1 ? false : true,
  //   query: {
  //     userId
  //   }
  // });

  function logInUser(userId: number) {
    // console.log(`The number is ${userId}`)
    setUserId(userId)
    setIsLoggedIn(true)
    socket.current = io(URL, {
      autoConnect: userId === -1 ? false : true,
      query: {
        userId
      }
    });
  }

  return isLoggedIn ? <HomePage socket={socket.current!} id={userId} sender={name} key={`${isLoggedIn}`} /> : <LoginAndSignUp logInUser={logInUser} name={name} setName={setName} key={`${isLoggedIn}`} />
}

export default App