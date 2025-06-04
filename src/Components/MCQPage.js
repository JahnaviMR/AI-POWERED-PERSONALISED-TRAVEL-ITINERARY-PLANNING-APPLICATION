import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./AllCss/MCQPage.css";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
function MCQPage() {
  const navigate = useNavigate();
  const [districts, setDistricts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tripTypes, setTripTypes] = useState([]);
  const [answers, setAnswers] = useState({
    district: "",
    travelWith: "",
    category: "",
    duration: "",
  });
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios
      .get("http://localhost:8080/api/itinerary/districts")
      .then((response) => setDistricts(response.data))
      .catch((error) => console.error("Error fetching districts:", error));
  }, []);

 const fetchCategories = async (district, travelWith) => {
    try {
        const response = await axios.get(
            `http://localhost:8080/api/admin/categories?district=${district}`
        );
        let updatedCategories = response.data;

        if (travelWith === "Kids" && !updatedCategories.includes("Entertainment")) {
            updatedCategories.push("Entertainment");
        }
        if (travelWith === "Adults" && !updatedCategories.includes("Cultural")) {
            updatedCategories.push("Cultural");
        }
        if (travelWith === "Both") {
            if (!updatedCategories.includes("Entertainment")) {
                updatedCategories.push("Entertainment");
            }
            if (!updatedCategories.includes("Cultural")) {
                updatedCategories.push("Cultural");
            }
        }

        setCategories(updatedCategories);
    } catch (error) {
      toast.error("Error fetching categories:", error);
    }
};


  const fetchTripTypes = async (district, category) => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/admin/tripTypes?district=${district}&category=${category}`
      );
      setTripTypes(response.data);
    } catch (error) {
      toast.error("Error fetching trip types:", error);
    }
  };

  const questions = [
    {
      name: "district",
      text: "Which district are you traveling to?",
      options: districts,
    },
    {
      name: "travelWith",
      text: "Who are you traveling with?",
      options: ["Kids", "Adults", "Both", "None"],
    },
    {
      name: "category",
      text: "What kind of trip category do you prefer?",
      options: categories,
    },
    {
      name: "tripType",
      text: "What type of trip are you looking for?",
      options: tripTypes,
    },
    {
      name: "budget",
      text: "What is your budget range?",
      options: ["Low", "Medium", "High"],
    },
    {
      name: "duration",
      text: "How many days will your trip be?",
      type: "number",
    },
  ];

  const handleAnswer = async (value) => {
    setLoading(true);
    setTimeout(async () => {
      const question = questions[currentQuestion];
      const updatedAnswers = { ...answers, [question.name]: value };
      setAnswers(updatedAnswers);

      if (question.name === "district") {
        await fetchCategories(value, answers.travelWith);
      }
      if (question.name === "travelWith") {
        await fetchCategories(answers.district, value);
      }
      if (question.name === "category") {
        await fetchTripTypes(answers.district, value);
      }

      setMessages((prev) => [
        ...prev,
        { text: question.text, sender: "bot" },
        { text: value, sender: "user" },
      ]);
      setLoading(false);
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        submitAnswers(updatedAnswers);
      }
    }, 500);
  };

  const handleDurationInput = (e) =>
    setAnswers((prev) => ({ ...prev, duration: e.target.value }));

  const handleDurationEnter = (e) => {
    if (e.key === "Enter" && answers.duration) {
      submitAnswers(answers);
    }
  };
  const submitAnswers = async (finalAnswers) => {
    try {
      // console.log("Sending request with data:", finalAnswers);
      
      const response = await axios.post(
        "http://localhost:8080/api/mcq/classifyMood",
        finalAnswers
      );
  
      // console.log("Response from server:", response.data);
  
      const { mood, places } = response.data;
  
      if (!places || places.length === 0) {
        toast.warning("No recommendations found. Try again with different inputs.");
        return;
      }
  
      navigate("/main/mcq-result", {
        state: {
          mood: Array.isArray(mood) ? mood : [mood],
          district: finalAnswers.district,
          days: finalAnswers.duration,
          places, 
        },
      });
    } catch (error) {
      toast.error("Error fetching recommendations:", error);
      alert("Something went wrong! Check console for details.");
    }
  };
  
  

  return (
    <div className="chat-container">
      <h2 className="text-center">Trip Planner Chat</h2>
      <div className="chat-box">
        {messages.map((msg, index) => (
          <div key={index} className={`chat-message ${msg.sender}`}>
            {msg.text}
          </div>
        ))}
        {loading && <div className="chat-message bot loading">...</div>}
        {currentQuestion < questions.length && !loading && (
          <div className="chat-message bot">
            {questions[currentQuestion].text}
          </div>
        )}
      </div>
      <div className="chat-input">
        {questions[currentQuestion]?.name === "district" ? (
          <select
            className="form-control"
            onChange={(e) => handleAnswer(e.target.value)}
            defaultValue=""
          >
            <option value="" disabled>
              Select a district
            </option>
            {districts.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        ) : questions[currentQuestion]?.type === "number" ? (
          <input
            type="number"
            className="form-control"
            placeholder="Enter number of days"
            value={answers.duration}
            onChange={handleDurationInput}
            onKeyDown={handleDurationEnter}
          />
        ) : (
          (questions[currentQuestion]?.options || []).map((option, index) => (
            <button
              key={index}
              className="btn btn-secondary m-2"
              onClick={() => handleAnswer(option)}
            >
              {option}
            </button>
          ))
        )}
      </div>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
    </div>
  );
}

export default MCQPage;
