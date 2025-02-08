import { useState } from "react"
import styles from "./SearchUsers.module.scss"

export function SearchUsers({ userId, setShowSearchUser }: SearchUsersParams) {

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

  return (
    <>
      <div className={styles.container} onMouseDown={() => setShowSearchUser(false)} >
        <div className={styles.searchFieldAndUserList} onMouseDown={e => e.stopPropagation()} >
          <input type="text" className={styles.searchField} onChange={(e) => setSearchInput(e.target.value)} />
          <button onClick={handleSearch} >Search</button>

          {hasError
            ? <p>There was an error</p>
            : users?.length !== 0
              ? users?.filter(user => {
                  // console.log(`user.id is ${user.id}`)
                  // console.log(typeof userId)
                  // console.log(typeof user.id)
                  console.log(`${user.id}` !== `${userId}`)
                  return `${user.id}` !== `${userId}`
                }).map(user => {
                  return (
                    <div key={user.id} className={styles.userNameAndAddUser} >
                      <p>{user.name}</p>
                      <button className={styles.addUser}>Add user</button>
                    </div>
                  )
                })
              : <p>No users found</p>
          }

        </div>
      </div>
    </>
  )
}

type SearchUsersParams = {
  userId: number,
  setShowSearchUser: React.Dispatch<React.SetStateAction<boolean>>
}

type User = {
  id: number, 
  name: string
}