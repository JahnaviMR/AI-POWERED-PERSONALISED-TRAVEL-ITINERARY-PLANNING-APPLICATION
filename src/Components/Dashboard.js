import React from 'react';
import './AllCss/Dashboard.css';
import { AiOutlineFileAdd } from "react-icons/ai";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from 'react-router-dom';
import { LuBot } from "react-icons/lu";

function Dashboard() {
  const [showMCQ, setShowMCQ] = useState(false);
  const navigate = useNavigate();
  const navigates = useNavigate();

  const handleCreateItinerary = () => {
    setShowMCQ(true);
    navigate("/mcq");
  };

  return (
    <div className="dashboard">
      <div className="container mt-4">
        <h1 className="text-center">Dashboard</h1>
        <p className="text-center">Welcome to the itinerary planner!</p>
        <button className="btn btn-primary" onClick={() => navigates("mood-form")}>
          <LuBot className='fs-5 m-1'/> AI for Trip Planning
        </button>
        <div className="text-center mt-3">
          <button className="btn btn-primary btn-lg" onClick={handleCreateItinerary}>
            <AiOutlineFileAdd /> Create Itinerary
          </button>
        </div>
      </div>

      {showMCQ && (
        <div className="container mt-4">
          <h2 className="text-center">Answer a few questions to get your itinerary</h2>
          <p className="text-center">OR</p>
          <div className="text-center">
            <Link to="/admin/upditinerary" className="btn btn-secondary btn-lg">
              Manually Create Itinerary
            </Link>
          </div>
        </div>
      )}

      <h1 className="dashboard-title">Welcome to Your Dashboard</h1>
      <div className="dashboard-cards">
        
        <div className="card">
          <p><b>😴 Feeling Bored? Let’s Flip the Vibe!
            🚶‍♀️ Solo? 👨‍👩‍👧‍👦 Family? 🤪 Friends?
            Whoever you're with, we're your ultimate travel buddy! 🧭

            Don’t know where to go?
            No sweat! Just answer a few quick questions and...</b></p>
          <p><b>✨ VOILÀ! Your dream itinerary appears like magic!

            From adventure to relaxation, romance to spirituality
            we’ve got something for every mood! 😎

            Pack up the vibes. Hit the road.
            Let’s make memories! 📸</b></p>
        </div>
        <div className="card">
          <h2><b>🌐 Travel Identity</b></h2>
          <h5><b>Who are you when you travel?</b></h5>
          <p>Manage your travel persona, preferences, and profile settings. It's your passport to personalized adventures!</p>
        </div>
        <div className="card">
          <h2><b>🛠️ Trip Workshop</b></h2>
          <h5><b>Where will your curiosity take you?</b></h5>
          <p>Build, tweak, and fine-tune your dream itineraries. This is your travel laboratory!</p>
        </div>
        <div className="card">
          <h2><b>What Can You Explore Here?</b></h2>
          <p>
            Discover the features of this platform:
          </p>
          <ul>
            <li>🗺️ <strong>Plan Trips</strong>: </li>
            <p>Create personalized itineraries based on your preferences.</p>
            <li>👨‍👩‍👧‍👦 <strong>Travel with Family</strong>: </li>
            <p>Get recommendations for family-friendly activities.</p>
            <li>💰 <strong>Budget Management</strong>: </li>
            <p>Choose trips that fit your budget.</p>
            <li>📅 <strong>Duration Planning</strong>:</li>
            <p> Plan trips for any number of days.</p>
            <li>🎢 <strong>Entertainment</strong>: </li>
            <p>Find fun and exciting activities for kids and adults.</p>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;