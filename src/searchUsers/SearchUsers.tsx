import { useState } from "react"
import styles from "./SearchUsers.module.scss"
import { Socket } from "socket.io-client"
import { ClientToServerEvents, ServerToClientEvents } from "../socket"

// import { socket } from "../socket"

export function SearchUsers({ userId, setShowSearchUser, sender, forCreatingPvtConvo, selectedGroupId, setShowInviteToGroup, selectedGroupName, socket }: SearchUsersParams) {

  const [searchInput, setSearchInput] = useState("")
  const [hasError, setHasError] = useState(false)
  const [showDone, setShowDone] = useState(false)
  const [users, setUsers] = useState<User[]>()

  function handleSearch() {
    (async () => {
      try {
        const res = await fetch("https://chatapp-server-3x2r.onrender.com/users", {
          method: "POST",
          body: JSON.stringify({
            search: searchInput
          }),
          headers: {
            "Content-type": "application/json; charset=UTF-8"
          }
        })
        const result = await res.json() as User[]
        setUsers(result)
        setHasError(false)
        // console.log("The result is")
        // console.log(result)
      }
      catch {
        setHasError(true)
      }

    })()
  }

  function createPvtConvo(newUserId: string, newUserName: string) {
    socket.emit("createPvtConvo", userId, sender, newUserId, newUserName)
  }

  function inviteToGroup(groupId: string | null, invitedUserId: string) {
    if (groupId && selectedGroupName) {
      socket.emit("inviteUserToGroup", groupId, invitedUserId, selectedGroupName)
    }
  }

  function handleClick(newUserId: string, newUserName: string) {
    setShowDone(true)
    if (forCreatingPvtConvo) {
      createPvtConvo(newUserId, newUserName)
    }
    else {
      inviteToGroup(selectedGroupId, newUserId)
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSearchInput(e.target.value)
    setShowDone(false)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  return (
    <>
      <div className={styles.container} onMouseDown={() => forCreatingPvtConvo ? setShowSearchUser(false) : setShowInviteToGroup(false)} >
        <div className={styles.searchFieldAndUserList} onMouseDown={e => e.stopPropagation()} >
          {/* <button className={styles.closeButton} onClick={() => forCreatingPvtConvo ? setShowSearchUser(false) : setShowInviteToGroup(false)} >X</button> */}
          <i onClick={() => forCreatingPvtConvo ? setShowSearchUser(false) : setShowInviteToGroup(false)} className={`fa-solid fa-xmark ${styles.icon}`}></i>
          {/* {forCreatingPvtConvo ? <h4>Search for users</h4> :<h4>Add new user to group</h4>} */}
          <h2 className={styles.information} >{forCreatingPvtConvo ? "Search for users" : "Add new user to group"}</h2>
          <div className={styles.searchInputAndButton} >
            <input type="text" className={styles.searchField} onChange={handleChange} onKeyDown={handleKeyDown} placeholder="eg: Aditya" maxLength={100} autoFocus />
            {/* <button className={styles.searchButton} onClick={handleSearch} >Search</button> */}
            <i onClick={handleSearch} className={`fa-solid fa-magnifying-glass ${styles.icon}`}></i>
          </div>

          <div className={styles.queryResult} >
            {hasError
              ? <p>There was an error</p>
              : users?.length !== 0
                ? users?.filter(user => `${user.id}` !== `${userId}`).map(user => {
                  return (
                    <div key={user.id} className={styles.userNameAndAddUser} >
                      <p>{user.name}</p>
                      {/* <button className={styles.addUser} onClick={() => handleClick(user.id, user.name)} >Add user</button> */}
                      <i onClick={() => handleClick(user.id, user.name)} className={`fa-solid fa-plus ${styles.icon}`}></i>
                    </div>
                  )
                })
                : <p>No users found</p>
            }
          </div>
          {showDone &&
            <div className={styles.done} onClick={() => setShowSearchUser(false)} >
              <i className="fa-solid fa-check"></i>
              <p className={styles.doneText} >Done</p>
            </div>
          }

        </div>
      </div>
    </>
  )
}

type SearchUsersParams = {
  userId: number,
  sender: string
  forCreatingPvtConvo: boolean,
  selectedGroupId: string | null,
  selectedGroupName: string | null,
  socket: Socket<ServerToClientEvents, ClientToServerEvents>
  setShowSearchUser: React.Dispatch<React.SetStateAction<boolean>>,
  setShowInviteToGroup: React.Dispatch<React.SetStateAction<boolean>>
}

type User = {
  id: string,
  name: string
}