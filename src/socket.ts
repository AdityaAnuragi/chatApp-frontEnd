import { io, Socket } from 'socket.io-client';

// "undefined" means the URL will be computed from the `window.location` object
const URL = 'http://localhost:3000';

type ServerToClientEvents = {
  message: (sender: string, id: number, message : string) => void;
}

type ClientToServerEvents = {
  message: (sender:string, id:number, msg:string) => void
}

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(URL, {
  autoConnect: false
});