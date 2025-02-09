import { useState } from "react"

import { socket } from "../socket"

import styles from "./CreateGroup.module.scss"

export function CreateGroup( {setShowCreateGroup, userId}: CreateGroupParams ) { 

  const [groupName, setGroupName] = useState("")

  function handleCreateGroup() {
    socket.emit("createGroup", groupName, `${userId}`)
  }

  return (
    <div className={styles.container} onMouseDown={() => setShowCreateGroup(false)} >
      <div className={styles.inputFieldAndUsers} onMouseDown={e => e.stopPropagation()} >
        <input type="text" value={groupName} onChange={(e) => setGroupName(e.target.value)} placeholder="Group name" />
        <button className={styles.button} onClick={handleCreateGroup} >Create group</button>
      </div>
    </div>
  )
}


type CreateGroupParams = {
  setShowCreateGroup: React.Dispatch<React.SetStateAction<boolean>>,
  userId: number,
}