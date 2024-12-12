import { io, Socket } from 'socket.io-client';

// "undefined" means the URL will be computed from the `window.location` object
const URL = 'http://localhost:3000';

export type ServerToClientEvents = {
  message: (sender: string, id: number, msg: string, fromGroup: "one" | "two") => void;
}

export type ClientToServerEvents = {
  message: (sender:string, id:number, msg:string, selectedGroup: "one" | "two", callback: (response: {status: "ok" | "error"}) => void) => void,
  joinRoom: (roomName: string) => void
}

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(URL, {
  autoConnect: false
});