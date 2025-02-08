import { useState } from "react"
import styles from "./SearchUsers.module.scss"

export function SearchUsers() {

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
      <div className={styles.container} >
        <div className={styles.searchFieldAndUserList} >
          <input type="text" className={styles.searchField} onChange={(e) => setSearchInput(e.target.value)} />
          <button onClick={handleSearch} >Search</button>

          {hasError 
            ? <p>There was an error</p>
            : users?.map(user => <p key={user.id}>{user.name}</p>)
          }

        </div>
      </div>
    </>
  )
}

type User = {
  id: number, name: string
}