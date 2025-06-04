import "./App.css";
import Login from "./Components/Login.js";
import Register from "./Components/Register.js";
import Profile from "./Components/Profile.js";
import Main from "./Components/Main.js";
import Dashboard from "./Components/Dashboard.js";
import Home from "./Components/HomeP.js";
import AdminProfile from "./AdminComponent/AdminProfile.js";
import ItineraryDisplay from "./Components/ItineraryDisplay.js";
import UpdEvents from "./AdminComponent/UpdEvents.js";
import AmnLogin from "./AdminComponent/AmnLogin.js";
import UpdItinerary from "./AdminComponent/UpdItinerary.js";
import Amain from "./AdminComponent/Amain.js";
import AdminDashboard from "./AdminComponent/AdminDashboard.js";
import MCQPage from "./Components/MCQPage";
import MCQResult from "./Components/MCQResult";
import McqClassification from "./Components/McqClassification.js";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState, useEffect, createContext } from "react";
import MyItineraries from "./Components/MyItineraries.js";
import { ToastContainer, toast } from 'react-toastify';
import MoodForm from "./Components/MoodForm.js";
export const UserContext = createContext(null);

function App() {
  const [selectedMood, setSelectedMood] = useState("");

  const [user, setUser] = useState(() => {
    try {
      const item = window.localStorage.getItem("user");
      return item ? JSON.parse(item) : {};
    } catch (e) {
      console.error("Error reading localStorage:", e);
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem("user", JSON.stringify(user));
  }, [user]);

  return (
    <UserContext.Provider value={{ user, setUser }}>

      <Router>
        <ToastContainer/>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/Login" element={<Login />} />
          <Route path="/Register" element={<Register />} />
          <Route path="/mcq" element={<MCQPage setSelectedMood={setSelectedMood} />} />
          <Route path="/Main" element={<Main />}>
            <Route index element={<Dashboard />} />
            <Route path="mcq-result" element={<MCQResult mood={selectedMood} />} />
            <Route path="Profile" element={<Profile />} />
            <Route path="mood-form" element={<MoodForm />} />
            <Route path="ItineraryDisplay" element={<ItineraryDisplay />} />
            <Route path="mcqclassification" element={<McqClassification />} />
            <Route path="my-itineraries" element={<MyItineraries />} />
          </Route>
          <Route path="/AdminLogin" element={<AmnLogin />} />
          <Route path="/admin" element={<Amain />}>
            <Route index element={<AdminDashboard />} />
            <Route path="upditinerary" element={<UpdItinerary />} />
            <Route path="updevents" element={<UpdEvents />} />
            <Route path="adminprofile" element={<AdminProfile />} />
          </Route>
        </Routes>
      </Router>
    </UserContext.Provider>
  );
}

export default App;
