import { useState } from "react"

// import { socket } from "../socket"

import styles from "./CreateGroup.module.scss"
import { Socket } from "socket.io-client"
import { ServerToClientEvents, ClientToServerEvents } from "../socket"

export function CreateGroup( {setShowCreateGroup, userId, socket}: CreateGroupParams ) { 

  const [groupName, setGroupName] = useState("")

  function handleCreateGroup() {
    socket.emit("createGroup", groupName, `${userId}`)
  }

  function handleClick() {
    handleCreateGroup()
    setShowCreateGroup(false)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if(e.key === "Enter") {
      handleClick()
    }
  }

  return (
    <div className={styles.container} onMouseDown={() => setShowCreateGroup(false)} >
      <div className={styles.inputFieldAndUsers} onMouseDown={e => e.stopPropagation()} >
        <h4 className={styles.information} >Create a new group</h4>
        <input
          type="text"
          className={styles.inputField}
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="eg: Project team"
          maxLength={100}
          autoFocus 
        />
        <button className={styles.button} onClick={handleClick} >Create group</button>
      </div>
    </div>
  )
}


type CreateGroupParams = {
  setShowCreateGroup: React.Dispatch<React.SetStateAction<boolean>>,
  socket: Socket<ServerToClientEvents, ClientToServerEvents>
  userId: number,
}