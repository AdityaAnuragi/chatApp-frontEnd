// import { MouseEventHandler } from "react";
import styles from "./GroupLists.module.scss"
import { Dispatch, SetStateAction } from "react"

export function GroupLists({groups, setSelectedGroup, selectedGroup}: GroupListsProps ) {
  return (
    <div className={`${styles.container}`} >
      {Object.keys(groups).map(group => <div className={`${styles.group} ${group === selectedGroup ? styles.selectedGroup : ""}`} key={group} onClick={() => setSelectedGroup(group)}>{`${groups[group].name}`}</div>)}
    </div>
  )
}


type GroupListsProps = {
  groups: {[id: string]: {name: string,chatType: "group" | "private"}}, 
  setSelectedGroup: Dispatch<SetStateAction<string | null>>,
  selectedGroup: string | null
}