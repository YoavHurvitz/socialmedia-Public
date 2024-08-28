import React, { useState } from "react";
import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import HomePage from "./scenes/homePage";
import LoginPage from "./scenes/loginPage";
import ProfilePage from "./scenes/profilePage";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { createTheme } from "@mui/material/styles";
import { themeSettings } from "./theme";
import useSocket from "./hooks/useSocket";
import ChatOverlay from "./components/ChatOverlay";

function App() {
  const mode = useSelector((state) => state.mode);
  const theme = useMemo(() => createTheme(themeSettings(mode)), [mode]);
  const isAuth = Boolean(useSelector((state) => state.token));
  const user = useSelector((state) => state.user);

  const socket = useSocket();
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div className="app">
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Routes>
            <Route 
              path="/" 
              element={isAuth ? <HomePage socket={socket} openChat={() => setIsChatOpen(true)} /> : <LoginPage />} 
            />
            <Route
              path="/home"
              element={isAuth ? <HomePage socket={socket} openChat={() => setIsChatOpen(true)} /> : <Navigate to="/" />}
            />
            <Route
              path="/profile/:userId"
              element={isAuth ? <ProfilePage socket={socket} openChat={() => setIsChatOpen(true)} /> : <Navigate to="/" />}
            />
          </Routes>
          {isAuth && isChatOpen && (
            <ChatOverlay
              socket={socket}
              userId={user._id}
              onClose={() => setIsChatOpen(false)}
            />
          )}
        </ThemeProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;