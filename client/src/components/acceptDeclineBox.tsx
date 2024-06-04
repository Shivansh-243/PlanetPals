import React, { useEffect, useState } from "react";
import { UserAndSocketContext } from "../context/UserAndsocketContext";
import { Socket } from "socket.io-client";
interface AcceptDeclineProps {
  position: {
    x: number;
    y: number;
  };
  username: string;
  senderId: number;
  isAcceptDeclineBoxOpen: React.MutableRefObject<boolean>;
}
const AcceptDeclineBox: React.FC<AcceptDeclineProps> = ({
  position,
  username,
  senderId,
  isAcceptDeclineBoxOpen,
}) => {
  const userContext = React.useContext(UserAndSocketContext);
  const socket: Socket | null = userContext ? userContext.socket : null;
  const user = userContext ? userContext.user : null;
  const handleAccept = () => {
    console.log("Accepted");
    socket?.emit("acceptRequest", {
      position: position,
      receiverId: (user as { id: number }).id,
      senderId: senderId,
    });
  };
  const handleCancel = () => {
    console.log("Cancelled");
    socket?.emit("cancelRequest", {
      receiverId: (user as { id: number }).id,
      senderId: senderId,
    });
    isAcceptDeclineBoxOpen.current = false;
  };

  return (
    <div
      style={{
        position: "absolute",
        left: `${position.x + 1}px`,
        top: `${position.y + 1}px`,
      }}
      className="bg-white border-1 border-black rounded-lg z-10 w-48 h-70"
    >
      <p className="flex justify-center h-[80%] text-sm p-2 text-wrap">
        you have a talk request from {username}
      </p>
      <div className="flex">
        <button
          className="h-[10%] w-[50%] bg-red-500 rounded-bl-lg text-slate-100"
          onClick={() => handleCancel()}
        >
          Cancel
        </button>
        <button
          className="h-[10%] w-[50%] bg-green-500 rounded-br-lg text-black"
          onClick={() => handleAccept()}
        >
          Accept
        </button>
      </div>
    </div>
  );
};

export default AcceptDeclineBox;
