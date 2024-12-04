export function Message({msg}: MessageProps) {
  return <p>{msg}</p>
}

type MessageProps = {
  msg: string
}
