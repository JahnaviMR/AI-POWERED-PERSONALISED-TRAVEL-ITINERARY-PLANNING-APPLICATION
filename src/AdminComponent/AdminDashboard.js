import React, { useState, useEffect } from "react";
import { FaUser, FaMapMarkedAlt } from "react-icons/fa";
import "../Components/AllCss/AdminDashboard.css";
import bgVideo from "../Components/images/large.mp4";
import axios from "axios";

function AdminDashboard() {
  const [text, setText] = useState("");
  const fullText = "Welcome to Admin Dashboard!";
  const [index, setIndex] = useState(0);
  const [users, setusers] = useState([]);
  const [itinerary, setitinerary] = useState([]);
  useEffect(() => {
    if (index < fullText.length) {
      const timeout = setTimeout(() => {
        setText(fullText.substring(0, index + 1));
        setIndex(index + 1);
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [index, fullText]);
  useEffect(() => {
    axios
      .get("http://localhost:8080/all")
      .then((response) => setusers(response.data))
      .catch((error) => console.error("Error fetching districts:", error));
  }, []);
  useEffect(() => {
    axios
      .get("http://localhost:8080/api/trip-places/all")
      .then((response) => setitinerary(response.data))
      .catch((error) => console.error("Error fetching districts:", error));
  }, []);
  return (
    <div className="admin-dashboard">
      <video autoPlay loop muted className="background-video">
        <source src={bgVideo} type="video/mp4" />
      </video>

      <div className="dashboard-overlay">
        <h1 className="typing-text">{text}</h1>
        <div className="stats-container">
          <div className="stat-card ">
            <FaUser className="icon" />
            <h3>Registered Users</h3>
            <p className="fs-4">{users.length}</p>
          </div>
          <div className="stat-card">
            <FaMapMarkedAlt className="icon" />
            <h3>Itineraries Created</h3>
            <p className="fs-4">{itinerary.length}</p>
          </div>
          {/* <div className="stat-card">
            <FaMoneyBillWave className="icon" />
            <h3>Revenue</h3>
            <p>$12,340</p>
          </div> */}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
