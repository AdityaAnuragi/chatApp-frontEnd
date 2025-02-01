import { io, Socket } from 'socket.io-client';

// "undefined" means the URL will be computed from the `window.location` object
const URL = 'http://localhost:3000';

export type ServerToClientEvents = {
  message: (sender: string, id: number, msg: string, fromGroup: "1" | "2") => void,
  getMissedMessages: (message: any[]) => void
}

export type ClientToServerEvents = {
  message: (sender:string, id:number, msg:string, selectedGroup: "1" | "2", cryptoId: `${string}-${string}-${string}-${string}-${string}`, callback: (response: {status: "ok" | "error"}, cryptoId: `${string}-${string}-${string}-${string}-${string}`, selectedGroup: "1" | "two" ) => void) => void,
  joinRoom: (roomName: string) => void
}

export type ParametersToSendMessage = Parameters<ClientToServerEvents["message"]>

// this is needed to send the unique id of the client to the server on connection
export const allNames = ["", "Aditya", "Ben"]
export const randomId = Math.floor(Math.random() * (allNames.length - 1) ) + 1
// export const theName = allNames[randomId]

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(URL, {
  autoConnect: false,
  query: {
    userId: randomId
  }
});