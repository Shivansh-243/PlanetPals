import React, { createContext, useState, ReactNode, useEffect } from "react";
import getLocation from "../components/getCurrentLocation";
import io, { Socket } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";

// Inside your UserAndSocketProvider component
// Define the shape of the context
interface ContextProps {
  user: object;
  setUser: React.Dispatch<React.SetStateAction<object>>;
  socket: Socket | null;
  // setSocket: React.Dispatch<React.SetStateAction<Socket | null>>;
  room: string;
  setRoom: React.Dispatch<React.SetStateAction<string>>;
}

// Create Context
const UserAndSocketContext = createContext<ContextProps | undefined>(undefined);

// Define the props for the provider
interface ProviderProps {
  children: ReactNode;
}

// Create Provider
const UserAndSocketProvider: React.FC<ProviderProps> = ({ children }) => {
  const [user, setUser] = useState<object>({});
  const [socket, setSocket] = useState<Socket | null>(null);
  const [room, setRoom] = useState<string>("");
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    if (Object.keys(user).length === 0 && location.pathname !== "/signup") {
      navigate("/login");
      return;
    }

    console.log("making socket connection...");
    const _socket: Socket = io("http://localhost:5001");

    if (socket === null) setSocket(_socket);
    // sending the online status to everyone
    const fetchLocation = async () => {
      const t = await getLocation();
      console.log(t);
      if (user) _socket.emit("online", { lat: t[0], long: t[1], user: user });
    };
    fetchLocation();
  }, [user, navigate, socket]);

  return (
    <UserAndSocketContext.Provider
      value={{ user, setUser, socket, room, setRoom }}
    >
      {children}
    </UserAndSocketContext.Provider>
  );
};

export { UserAndSocketContext, UserAndSocketProvider };
