import { useState } from "react"
import styles from "./LoginAndSignUp.module.scss"

export function LoginAndSignUp() {

  const [name, setName] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<"username taken" | "invalid password" | "unexpected error" | "">("")
  const [isSignUp, setIsSignUp] = useState(true)

  / sign in functionality

  function handleClick() {
    (async () => {
      try {
      / make the URL as a templete literal string, /signup or /login
        const response = await fetch("http://localhost:3000/signup", {
          method: "POST",
          body: JSON.stringify({
            name,
            password
          }),
          headers: {
            "Content-type": "application/json; charset=UTF-8"
          }
        })

        if(response.status === 406) {
          // incase username is already taken
          throw new Error("406");
        }
        else if( !(response.ok) ) {
          throw new Error("An unexpected error occured")
        }

        const userId = await response.json()
        console.log(`user id is ${userId}`)
        // console.log(response.ok)
        setError("")
      }
      catch(e) {
        if(e instanceof Error && e.message === "406") {
          // console.log(e.name)
          // console.log(e.stack)
          // console.log(e.message)
          setError("username taken")
        }
        else {
          setError("unexpected error")
        }
      }

    })()
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if(e.key === "Enter") {
      handleClick()
    }
  }

  return (
    <div className={styles.container} >
      <div className={styles.form} >
        <h2 className={styles.loginOrSignUp} >{isSignUp ? "Sign up" : "Login"}</h2>
        <label className={styles.label} >
          Name
          <input className={styles.inputFields} value={name} onChange={e => setName(e.target.value)} type="text" placeholder="eg: Aditya" />
        </label>

        <label className={styles.label} >
          Password
          <input className={styles.inputFields} value={password} onChange={e => setPassword(e.target.value)} onKeyDown={handleKeyDown} type="password" />
        </label>

        <p className={`${error ? "" : styles.invisible} ${styles.ifUserNameTaken}`} >
          {error === "username taken"
            ? "Username already taken"
            : error === "invalid password"
              ? "Incorrect credentials"
              : "An unexpected error occured"
          }
        </p>

        {<button className={`${styles.toggleBetweenLoginAndSignUp}`} onClick={() => setIsSignUp(curr => !curr)} >{isSignUp ? "Existing user? Sign in" : "Not registered? Sign up"}</button>}

        <button className={`${styles.loginOrSignUpButton} ${styles.right}`} onClick={handleClick} >
          Sign Up
        </button>

      </div>
    </div>
  )
}