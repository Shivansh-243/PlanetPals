// import "./App.css";
import { Routes, Route } from "react-router-dom";
import Globe from "./components/globe";
import Signup from "./components/signUp";
import Login from "./components/login";

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Globe />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        {/* <Route path="/contact" element={<Contact />} /> */}
      </Routes>
    </div>
  );
}

export default App;
// export default function App() {
//   return <h1 className="text-3xl font-bold underline">Hello world!</h1>;
// }
