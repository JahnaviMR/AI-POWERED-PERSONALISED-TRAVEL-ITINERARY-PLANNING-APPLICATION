import React, { useState } from "react";
import axios from "axios";

const McqClassification = () => {
  const [answers, setAnswers] = useState({});
  const [recommendation, setRecommendation] = useState(null);

  const questions = [
    { id: 1, text: "What kind of trip do you prefer?", options: ["Relaxing", "Adventurous", "Cultural", "Nature"] },
    { id: 2, text: "Do you like historical places?", options: ["Yes", "No"] },
    { id: 3, text: "Are you comfortable with long journeys?", options: ["Yes", "No"] },
  ];

  const handleAnswerChange = (questionId, answer) => {
    setAnswers({ ...answers, [questionId]: answer });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:8080/api/mcq/classify", answers);
      setRecommendation(response.data);
    } catch (error) {
      console.error("Error fetching recommendation:", error);
      alert("Failed to get recommendation. Please try again.");
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Plan Your Trip</h2>
      <form onSubmit={handleSubmit}>
        {questions.map((q) => (
          <div key={q.id} className="mb-3">
            <label className="form-label">{q.text}</label>
            <select className="form-control" onChange={(e) => handleAnswerChange(q.id, e.target.value)}>
              <option value="">Select an option</option>
              {q.options.map((option, index) => (
                <option key={index} value={option}>{option}</option>
              ))}
            </select>
          </div>
        ))}
        <button type="submit" className="btn btn-primary w-100">Get Recommendation</button>
      </form>
      {recommendation && (
        <div className="mt-4 p-3 border rounded">
          <h4>Recommended Category: {recommendation.category}</h4>
        </div>
      )}
    </div>
  );
};

export default McqClassification;
