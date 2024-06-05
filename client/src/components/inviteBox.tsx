import React from "react";
import { UserAndSocketContext } from "../context/UserAndsocketContext";
import { Socket } from "socket.io-client";
interface InviteBoxProps {
  geoPosition: {
    x: number;
    y: number;
  };
  position: {
    x: number;
    y: number;
  };
  username: string;
  receiverId: number;
  isInviteBoxOpen: React.MutableRefObject<boolean>;
  setInviteBox: React.Dispatch<
    React.SetStateAction<{
      geoPosition: {
        x: number;
        y: number;
      };
      position: { x: number; y: number };
      username: string;
      receiverId: number;
    } | null>
  >;
}
const InviteBox: React.FC<InviteBoxProps> = ({
  geoPosition,
  position,
  username,
  receiverId,
  isInviteBoxOpen,
  setInviteBox,
}) => {
  const userContext = React.useContext(UserAndSocketContext);
  const socket: Socket | null = userContext ? userContext.socket : null;
  const user = userContext ? userContext.user : null;
  const handleInvite = () => {
    console.log("Invite to chat");
    socket?.emit("let's chat", {
      username: (user as { username: string }).username,
      senderId: (user as { id: number }).id,
      receiverId: receiverId,
      position: position,
    });
  };
  const handleClose = () => {
    console.log("Close");
    isInviteBoxOpen.current = false;
    setInviteBox(null);
  };
  const APIkey = "9e5c5fedc43e4ba0bc3c1f766636251c";
  const getpos = async () => {
    console.log(geoPosition);
    const lat = geoPosition.x.toFixed(7);
    const long = geoPosition.y.toFixed(7);
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${lat}%2C${long}&key=${APIkey}`;
    // console.log("url ", url);
    const response = await fetch(url);
    const data = await response.json();
    // console.log("data ", data);
    const city = data.results[0].formatted;
    // console.log("city ", city);
    return city;
  };
  const [country, setCountry] = React.useState<string[]>([]);

  React.useEffect(() => {
    const fetchCountry = async () => {
      const result = await getpos();
      setCountry(result.split(","));
    };

    fetchCountry();
  }, []);
  return (
    <div
      style={{
        position: "absolute",
        left: `${position.x + 1}px`,
        top: `${position.y + 1}px`,
      }}
      className="bg-white border-1 border-black rounded-lg z-10 w-48 h-70"
    >
      <p className="flex bg-blue-300 justify-center rounded-t-lg h-[80%] text-sm p-2 text-wrap">
        {username}
      </p>
      <table className="table-auto bg-gray-200 h-[80%] text-sm  text-wrap">
        <tbody>
          <tr className="border-b-[0.5px] border-black">
            <td className="px-4 py-1">City:</td>
            <td className="px-4 py-1">{country[0]}</td>
          </tr>
          <tr className="border-b border-black">
            <td className="px-4 py-1">State:</td>
            <td className="px-4 py-1">{country[1]}</td>
          </tr>
          <tr>
            <td className="px-4 py-1">Country:</td>
            <td className="px-4 py-1">{country[2]}</td>
          </tr>
        </tbody>
      </table>
      <div className="flex">
        <button
          className="h-[10%] w-[50%] bg-red-500 rounded-bl-lg text-slate-100"
          onClick={() => handleClose()}
        >
          Close
        </button>
        <button
          className="h-[10%] w-[50%] bg-green-500 rounded-br-lg text-black"
          onClick={() => handleInvite()}
        >
          Invite to Chat
        </button>
      </div>
    </div>
  );
};

export default InviteBox;
