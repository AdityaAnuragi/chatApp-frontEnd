import { useState } from "react"
import styles from "./SearchUsers.module.scss"

import { socket } from "../socket"

export function SearchUsers({ userId, setShowSearchUser, sender, forCreatingPvtConvo, selectedGroupId, setShowInviteToGroup, selectedGroupName }: SearchUsersParams) {

  const [searchInput, setSearchInput] = useState("")
  const [hasError, setHasError] = useState(false)
  const [users, setUsers] = useState<User[]>()

  function handleSearch() {
    (async () => {
      try {
        const res = await fetch("http://localhost:3000/users", {
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
    if (forCreatingPvtConvo) {
      createPvtConvo(newUserId, newUserName)
    }
    else {
      inviteToGroup(selectedGroupId, newUserId)
    }
  }

  return (
    <>
      <div className={styles.container} onMouseDown={() => forCreatingPvtConvo ? setShowSearchUser(false) : setShowInviteToGroup(false)} >
        <div className={styles.searchFieldAndUserList} onMouseDown={e => e.stopPropagation()} >
          <button className={styles.closeButton} onClick={() => forCreatingPvtConvo ? setShowSearchUser(false) : setShowInviteToGroup(false)} >X</button>
          <div className={styles.searchInputAndButton} >
            <input type="text" className={styles.searchField} onChange={(e) => setSearchInput(e.target.value)} placeholder="Search for user" autoFocus />
            <button className={styles.searchButton} onClick={handleSearch} >Search</button>
          </div>

          <div className={styles.queryResult} >
            {hasError
              ? <p>There was an error</p>
              : users?.length !== 0
                ? users?.filter(user => `${user.id}` !== `${userId}`).map(user => {
                  return (
                    <div key={user.id} className={styles.userNameAndAddUser} >
                      <p>{user.name}</p>
                      <button className={styles.addUser} onClick={() => handleClick(user.id, user.name)} >Add user</button>
                    </div>
                  )
                })
                : <p>No users found</p>
            }
          </div>

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
  selectedGroupName: string | null
  setShowSearchUser: React.Dispatch<React.SetStateAction<boolean>>,
  setShowInviteToGroup: React.Dispatch<React.SetStateAction<boolean>>
}

type User = {
  id: string,
  name: string
}