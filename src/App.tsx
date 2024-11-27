import { useEffect, useState } from "react"

function App() {

  const [msg, setMsg] = useState("hello world")

  useEffect(() => {
    fetch('http://localhost:3000')
      // .then(res => res.json())
      .then(value => value.text())
      .then(value => setMsg(value))
  },[])

  return <h1>{msg}</h1>
}

export default App
