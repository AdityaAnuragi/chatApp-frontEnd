import { useState } from "react"
import styles from "./LoginAndSignUp.module.scss"

import { URL } from "../socket"

export function LoginAndSignUp({ logInUser, name, setName }: { logInUser: (userId: number) => void, name: string, setName: React.Dispatch<React.SetStateAction<string>> }) {

  // const [name, setName] = useState("Aditya")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<"username taken" | "invalid password" | "unexpected error" | "">("")
  const [isSignUp, setIsSignUp] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  // sign in functionality

  function signUpOrLogin() {
    (async () => {
      try {
        // make the URL as a templete literal string, /signup or /login
        const response = await fetch(`${URL}/${isSignUp ? "signup" : "signin"}`, {
          method: "POST",
          body: JSON.stringify({
            name,
            password
          }),
          headers: {
            "Content-type": "application/json; charset=UTF-8"
          }
        })

        if (response.status === 406) {
          // incase username is already taken
          throw new Error("406");
        }
        else if (!(response.ok)) {
          throw new Error("An unexpected error occured")
        }

        const userId = await response.json()
        // console.log(`user id is ${userId}`)
        // console.log(response.ok)
        logInUser(Number(userId))
        setIsLoading(false)
        setError("")
      }
      catch (e) {
        if (e instanceof Error && e.message === "406") {
          // console.log(e.name)
          // console.log(e.stack)
          // console.log(e.message)
          setError("username taken")
        }
        else {
          setError("unexpected error")
        }
        setIsLoading(false)
      }

    })()
  }

  function handleClick(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    e.preventDefault()
    setError("");
    setIsLoading(true);
    signUpOrLogin()
    // (async () => {
    //   try {
    //     // make the URL as a templete literal string, /signup or /login
    //     const response = await fetch(`https://chatapp-server-production-6c0f.up.railway.app/${isSignUp ? "signup" : "signin"}`, {
    //       method: "POST",
    //       body: JSON.stringify({
    //         name,
    //         password
    //       }),
    //       headers: {
    //         "Content-type": "application/json; charset=UTF-8"
    //       }
    //     })

    //     if (response.status === 406) {
    //       // incase username is already taken
    //       throw new Error("406");
    //     }
    //     else if (!(response.ok)) {
    //       throw new Error("An unexpected error occured")
    //     }

    //     const userId = await response.json()
    //     // console.log(`user id is ${userId}`)
    //     // console.log(response.ok)
    //     logInUser(Number(userId))
    //     setIsLoading(false)
    //     setError("")
    //   }
    //   catch (e) {
    //     if (e instanceof Error && e.message === "406") {
    //       // console.log(e.name)
    //       // console.log(e.stack)
    //       // console.log(e.message)
    //       setError("username taken")
    //     }
    //     else {
    //       setError("unexpected error")
    //     }
    //     setIsLoading(false)
    //   }

    // })()
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      signUpOrLogin()
    }
  }

  return (
    <div className={styles.container} >
      <div className={styles.form} >
        <h2 className={styles.loginOrSignUp} >{isSignUp ? "Sign up" : "Login"}</h2>
        <label className={styles.label} >
          Name
          <input name="username" type="text" className={styles.inputFields} value={name} onChange={e => setName(e.target.value)}  placeholder="eg: Aditya" maxLength={100} />
        </label>

        <label className={styles.label} >
          Password
          <input name="password" type="password" autoComplete={isSignUp ? "new-password" : ""} className={styles.inputFields} value={password} onChange={e => setPassword(e.target.value)} onKeyDown={handleKeyDown} />
        </label>

        <p className={`${error ? "" : styles.invisible} ${styles.ifUserNameTaken}`} >
          {error === "username taken"
            ? "Username already taken"
            : error === "invalid password"
              ? "Incorrect credentials"
              : "An unexpected error occured"
          }
        </p>

        <button className={`${styles.toggleBetweenLoginAndSignUp}`} onClick={() => { setIsSignUp(curr => !curr); setError("") }} >{isSignUp ? "Existing user? Sign in" : "Not registered? Sign up"}</button>

        {/* <button className={`${styles.loginOrSignUpButton} ${styles.right}`} onClick={handleClick}/>
          {isLoading ? "Loading..." : isSignUp ? "Sign Up" : "Login"}
        </button> */}

        <button type="submit" className={`${styles.loginOrSignUpButton} ${styles.right}`} onClick={handleClick} >
          {isLoading ? "Loading..." : isSignUp ? "Sign Up" : "Login"}
        </button>

      </div>
    </div>
  )
}