import React, { useEffect, useState, useRef } from "react";
import io, { Socket } from "socket.io-client";
// import axios from "axios";

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
const socket: Socket = io("http://localhost:5001");
const ChatBox: React.FC<ChatBoxProps> = ({
  position,
  chatWith,
  setChatBox,
  isChatBoxOpen,
}) => {
  const [messages, setMessages] = useState<string[]>([]);
  const [msg, setMsg] = useState<string>("");

  useEffect(() => {
    socket.on("chat message", (msg) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
    });

    return () => {
      socket.off("chat message");
    };
  }, []);

  const handleSend = () => {
    if (msg === "") return;
    setMessages((prevMessages) => [...prevMessages, msg]);
    socket.emit("sendMessage", { msg: msg });
  };
  const handleCancel = () => {
    setChatBox(null);
    isChatBoxOpen.current = false;
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
      <div className="h-[85%] bg-slate-200 border-b-2 border-black rounded-t-lg text-sm text-black overflow-y-auto ">
        {messages.length > 0 &&
          messages.map((msg, index) => (
            <div
              className="text-wrap  bg-slate-400 pl-2 border-1 border-solid border-black"
              key={index}
            >
              {msg}
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
