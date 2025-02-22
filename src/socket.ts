// import { io, Socket } from 'socket.io-client';

// "undefined" means the URL will be computed from the `window.location` object
// const URL = 'http://localhost:3000';

export type ServerToClientEvents = {
  message: (sender: string, id: number, msg: string, fromGroup: string) => void,
  getMissedMessages: (message: {[group: string]: {id: `${string}-${string}-${string}-${string}-${string}`, msg: string, senderID: number, messageStatus: "🕗" | "✅" | "❌",isRetrying: boolean}[] }) => void,
  getGroupIdsAndNames: (groupIdsAndName: {[id: string]: {name: string, chatType: "group" | "private"} }) => void,
  makeClientJoinRoom: (pvtConvId: string,pvtConvoName: string, chatType: "group" | "private") => void
}

export type ClientToServerEvents = {
  message: (sender:string, id:number, msg:string, selectedGroup: string, cryptoId: `${string}-${string}-${string}-${string}-${string}`, callback: (response: {status: "ok" | "error"}, cryptoId: `${string}-${string}-${string}-${string}-${string}`, selectedGroup: string ) => void) => void,
  joinRoom: (roomName: string) => void,
  createPvtConvo: (fromId: number,fromName: string, toId:string, toName: string) => void,
  createGroup: (groupName: string, fromUserId: string) => void,
  inviteUserToGroup: (groupId: string, userId: string, groupName: string) => void
}

export type ParametersToSendMessage = Parameters<ClientToServerEvents["message"]>

// this is needed to send the unique id of the client to the server on connection
export const allNames = ["", "Aditya", "Ben", "Connor"]
export const randomId = Math.floor(Math.random() * (allNames.length - 1) ) + 1
// export const theName = allNames[randomId]

// export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(URL, {
//   autoConnect: true,
//   query: {
//     userId: randomId
//   }
// });