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

  useEffect(() => {
    socket?.on("message", (data) => {
      if (data.id === (user as { id: number }).id) return;
      setMessages((prevMessages) => [...prevMessages, data]);
    });
    console.log("chatBox");

    return () => {
      socket?.off("message");
    };
  }, []);
  useEffect(() => {
    socket?.on("online", (data) => {
      console.log("online ", data);
    });
    return () => {
      socket?.off("online");
    };
  }, []);
  const handleSend = () => {
    if (msg === "") return;
    setMessages((prevMessages) => [
      ...prevMessages,
      { id: (user as { id: number }).id, msg: msg },
    ]);
    socket?.emit("sendMessage", { id: (user as { id: number }).id, msg: msg });
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
      className="bg-white border-1 border-black rounded-lg z-10 w-48 h-72"
    >
      <h3 className="flex justify-center bg-slate-500 text-white rounded-t-lg">
        {chatWith}
      </h3>
      <div className="h-[85%] bg-slate-200 border-b-2 border-black text-sm text-black overflow-y-auto ">
        {messages.length > 0 &&
          messages.map((data, index) => (
            <div
              className="text-wrap  bg-slate-400 pl-2 border-1 border-solid border-black"
              key={index}
            >
              {data.msg}
            </div>
          ))}
      </div>
      <input
        className="w-[100%] border-1 border-solid text-black text-wrap text-sm p-1 border-black"
        type="text"
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
