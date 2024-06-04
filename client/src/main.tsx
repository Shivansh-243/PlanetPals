// import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { UserAndSocketProvider } from "./context/UserAndsocketContext.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <UserAndSocketProvider>
      <App />
    </UserAndSocketProvider>
  </BrowserRouter>
);
