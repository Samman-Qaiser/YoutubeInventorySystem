import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Topbar from "./components/Topbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Channels from "./pages/Channels";
import Purchases from "./pages/Purchases";
import Sales from "./pages/Sales";
import Login from "./pages/Login";
import { channelsData } from "./constants/data";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem("abbasstock_auth") === "true";
  });
  const [collapsed, setCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // ── Global channels state (shared between Channels & Purchases pages) ──────
  const [channels, setChannels] = useState([...channelsData]);

  const handleLogin = () => {
    localStorage.setItem("abbasstock_auth", "true");
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("abbasstock_auth");
    setIsLoggedIn(false);
  };

  if (!isLoggedIn) {
    return (
      <div className={darkMode ? "dark" : ""}>
        <Login onLogin={handleLogin} />
      </div>
    );
  }

  return (
    <div className={darkMode ? "dark" : ""}>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300 flex flex-col">
          <Navbar
            collapsed={collapsed}
            setCollapsed={setCollapsed}
            mobileMenuOpen={mobileMenuOpen}
            setMobileMenuOpen={setMobileMenuOpen}
            onLogout={handleLogout}
          />
          <Topbar
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            collapsed={collapsed}
            setMobileMenuOpen={setMobileMenuOpen}
            onLogout={handleLogout}
          />
          <main
            className={`pt-16 min-h-screen transition-all duration-300 flex flex-col
              ${collapsed ? "md:ml-16" : "md:ml-56"}`}
          >
            <div className="p-6 flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/channels"  element={<Channels  channels={channels} setChannels={setChannels} />} />
                <Route path="/purchases" element={<Purchases channels={channels} setChannels={setChannels} />} />
                <Route path="/sales"     element={<Sales     channels={channels} setChannels={setChannels} />} />
                <Route path="*"         element={<Navigate to="/" replace />} />
              </Routes>
            </div>
            <Footer />
          </main>
        </div>
      </BrowserRouter>
    </div>
  );
}