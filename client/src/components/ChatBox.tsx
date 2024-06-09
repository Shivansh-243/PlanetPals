import React, { useEffect, useState } from "react";
import { UserAndSocketContext } from "../context/UserAndsocketContext";
import { Socket } from "socket.io-client";
interface ChatBoxProps {
  position: {
    x: number;
    y: number;
  };
  chatWith: string;
  setChatBox: React.Dispatch<
    React.SetStateAction<{
      position: { x: number; y: number };
      message: string;
    } | null>
  >;
  isChatBoxOpen: React.MutableRefObject<boolean>;
}
interface Message {
  id: number;
  msg: string;
}
const ChatBox: React.FC<ChatBoxProps> = ({
  position,
  chatWith,
  setChatBox,
  isChatBoxOpen,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [msg, setMsg] = useState<string>("");

  const userContext = React.useContext(UserAndSocketContext);
  const socket: Socket | null = userContext ? userContext.socket : null;
  const user = userContext ? userContext.user : null;
  const room = userContext ? userContext.room : "";
  const messagesEndRef = React.useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    console.log("room ", room);
    let userMessages = (
      user as { sentMessages: any[]; receivedMessages: any[] }
    ).sentMessages.concat(
      (user as { sentMessages: any[]; receivedMessages: any[] })
        .receivedMessages
    );
    userMessages = userMessages.filter(
      (message) =>
        (message.senderId === parseInt(room[0]) &&
          message.receiverId === parseInt(room[1])) ||
        (message.senderId === parseInt(room[1]) &&
          message.receiverId === parseInt(room[0]))
    );
    userMessages.sort((a, b) => a.id - b.id);
    console.log("userMessages ", userMessages);
    if (messages.length >= userMessages.length) return;
    for (let i = 0; i < userMessages.length; i++) {
      setMessages((prevMessages) => [
        ...prevMessages,
        { id: userMessages[i].senderId, msg: userMessages[i].content },
      ]);
    }
  }, [room, user]);
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);
  useEffect(() => {
    socket?.on("message", (data) => {
      console.log("message ", data);
      setMessages((prevMessages) => [
        ...prevMessages,
        { id: data.id, msg: data.msg },
      ]);
    });
  }, []);
  const handleSend = () => {
    if (msg === "") return;
    setMessages((prevMessages) => [
      ...prevMessages,
      { id: (user as { id: number }).id, msg: msg },
    ]);
    socket?.emit("sendMessage", {
      id: (user as { id: number }).id,
      msg: msg,
      room: room,
    });
    setMsg("");
  };
  const handleCancel = () => {
    setChatBox(null);
    isChatBoxOpen.current = false;
    if (room !== "") socket?.emit("cancelChat", { room });
  };

  return (
    <div
      style={{
        position: "absolute",
        left: `${position.x + 1}px`,
        top: `${position.y + 1}px`,
      }}
      className="border-1 border-solid border-white rounded-lg z-10 w-48 h-72"
    >
      <h3 className="flex justify-center bg-slate-500 text-white rounded-t-lg">
        {chatWith}
      </h3>
      <div
        className="h-[85%] bg-slate-700  border-black text-sm text-black overflow-y-auto"
        style={{ scrollbarWidth: "none" }}
      >
        {messages.length > 0 &&
          messages.map((data, index) => (
            <div
              className={`text-wrap pl-2 mb-1 rounded-lg border-1 border-solid border-black ${
                data.id === (user as { id: number }).id
                  ? "bg-blue-500 w-[80%] rounded-l-none"
                  : "bg-gray-400 relative left-[20%] w-[80%] rounded-r-none"
              }`}
              key={index}
              ref={index === messages.length - 1 ? messagesEndRef : null}
            >
              {data.msg}
            </div>
          ))}
      </div>
      <input
        className="w-[100%] border-1 border-solid bg-gray-800 text-white text-wrap text-sm p-1 border-white"
        type="text"
        value={msg}
        onChange={(e) => setMsg(e.target.value)}
      />
      <div className="flex">
        <button
          className="h-[10%] w-[50%] bg-red-500 rounded-bl-lg text-slate-100"
          onClick={() => handleCancel()}
        >
          cancel
        </button>
        <button
          className="h-[10%] w-[50%] bg-blue-300 rounded-br-lg text-black"
          onClick={() => handleSend()}
        >
          send
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
