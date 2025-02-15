// import { MouseEventHandler } from "react";
import styles from "./GroupLists.module.scss"
import { Dispatch, SetStateAction } from "react"

export function GroupLists({groups, setSelectedGroup, selectedGroup, setShowCreateGroup, setShowSearchUser}: GroupListsProps ) {
  return (
    <div className={`${styles.container}`} >
      <div className={styles.routeAndButtonContainer} >
        <h2>Chats</h2>
        <div>
          <i onClick={() => setShowCreateGroup(true)} className={`fa-solid fa-user-group ${styles.icon}`}></i>
          <i onClick={() => setShowSearchUser(true)} className={`fa-solid fa-magnifying-glass ${styles.icon}`}></i>
        </div>
      </div>
      {/* ${selectedGroup !== null ? styles.invisible : ""} */}
      {Object.keys(groups).map((group, index) => <div className={`${styles.group} ${group === selectedGroup ? styles.selectedGroup : ""} ${index === 0 ? styles.firstGroup : ""}`} key={group} onClick={() => setSelectedGroup(group)}>{`${groups[group].name}`}</div>)}
    </div>
  )
}


type GroupListsProps = {
  groups: {[id: string]: {name: string,chatType: "group" | "private"}}, 
  setSelectedGroup: Dispatch<SetStateAction<string | null>>,
  selectedGroup: string | null,
  setShowCreateGroup: React.Dispatch<React.SetStateAction<boolean>>,
  setShowSearchUser: React.Dispatch<React.SetStateAction<boolean>>
}