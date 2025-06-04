import React, { useState } from "react";
import axios from "axios";
import UserMood from "./UserMood";

function TripPlanner() {
  const [, setSelectedMood] = useState("");
  const [recommendations, setRecommendations] = useState([]);

  const handleMoodSelect = (mood) => {
    setSelectedMood(mood);
    fetchRecommendations(mood);
  };

  const fetchRecommendations = (mood) => {
    axios
      .get(`http://localhost:8080/api/user-mood/recommendations/${mood}`)
      .then((response) => {
        setRecommendations(response.data);
      })
      .catch((error) => {
        console.error("Error fetching recommendations:", error);
        alert("Failed to fetch recommendations. Please try again.");
      });
  };

  return (
    <div className="trip-planner container">
      <h1 className="text-center mb-4">Plan Your Trip</h1>
      
      <UserMood onSelectMood={handleMoodSelect} />
      
      <div className="recommendations mt-4">
        <h2>Recommended Destinations</h2>
        {recommendations.length > 0 ? (
          <ul>
            {recommendations.map((place, index) => (
              <li key={index}>{place}</li>
            ))}
          </ul>
        ) : (
          <p>No recommendations yet. Select a mood to get started.</p>
        )}
      </div>
    </div>
  );
}

export default TripPlanner;
