import { useState } from "react"
import styles from "./LoginAndSignUp.module.scss"

export function LoginAndSignUp() {

  const [name, setName] = useState("")
  const [password, setPassword] = useState("")
  const [hasError, setHasError] = useState(false)
  const [isSignUp, setIsSignUp] = useState(true)

  / make the error state be more explicit, i.e signUpError or loginError

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
        console.log(response.ok)
        if( !(response.ok) ) {
          throw new Error("An error occured")
        }
        setHasError(false)
      }
      catch {
        setHasError(true)
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
        <h2 className={styles.loginOrSignUp} >Sign Up</h2>
        <label className={styles.label} >
          Name
          <input className={styles.inputFields} value={name} onChange={e => setName(e.target.value)} type="text" placeholder="eg: Aditya" />
        </label>

        <label className={styles.label} >
          Password
          <input className={styles.inputFields} value={password} onChange={e => setPassword(e.target.value)} onKeyDown={handleKeyDown} type="password" />
        </label>

        <p className={`${hasError ? "" : styles.invisible} ${styles.ifUserNameTaken}`} >User name already taken</p>

        {<p className={styles.toggleBetweenLoginAndSignUp} onClick={() => setIsSignUp(curr => !curr)} >{isSignUp ? "Existing user? Sign in" : "Not registered? Sign up"}</p>}

        <button className={styles.loginOrSignUpButton} onClick={handleClick} >
          Sign Up
        </button>

      </div>
    </div>
  )
}