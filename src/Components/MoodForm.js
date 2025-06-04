import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import questionsData from "./questions";
import "bootstrap/dist/css/bootstrap.min.css";
import "./MoodForm.css";

const MoodForm = () => {
  const navigate = useNavigate();
  const chatEndRef = useRef(null);

  const [messages, setMessages] = useState([
    {
      text: "👋 Hi! I'm your AI trip planner. Let's find the best trip for you!",
      sender: "bot",
    },
    { text: "Answer a few quick questions to get started!", sender: "bot" },
  ]);

  const [districtOptions, setDistrictOptions] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [categoryYesCounts, setCategoryYesCounts] = useState({});
  const [categoryAskCounts, setCategoryAskCounts] = useState({});
  const [categoriesQueue, setCategoriesQueue] = useState([]);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [askedQuestions, setAskedQuestions] = useState({});
  const [step, setStep] = useState("questioning");
  const [isKidsSelected, setIsKidsSelected] = useState(false);
  const [isAdultsSelected, setIsAdultsSelected] = useState(false);
  const [district, setDistrict] = useState("");
  const [days, setDays] = useState(1);
  const [categoryFinalized, setCategoryFinalized] = useState(null);
  const [additionalRoundDone, setAdditionalRoundDone] = useState(false);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    fetchDistricts();
    const categories = Object.keys(questionsData);
    setCategoriesQueue(categories);
    askNextCategoryQuestion(categories[0]);
  }, []);

  useEffect(() => {
    if (currentQuestion && step === "questioning") {
      simulateTyping(currentQuestion);
    }
  }, [currentQuestion, step]);

  useEffect(() => {
    if (categoryFinalized && step === "questioning") {
      askKidsQuestion();
    }
  }, [categoryFinalized]);

  const fetchDistricts = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/itinerary/districts");
      setDistrictOptions(res.data);
    } catch (error) {
      console.error("Error fetching districts:", error);
    }
  };

  const simulateTyping = (message, delay = 700) => {
    setIsTyping(true);
    setTimeout(() => {
      setMessages((prev) => [...prev, { text: message, sender: "bot" }]);
      setIsTyping(false);
    }, delay);
  };

  const getRandomQuestion = (category) => {
    const questions = questionsData[category];
    const asked = askedQuestions[category] || [];
    const remaining = questions.filter((q) => !asked.includes(q));
    if (remaining.length === 0) return null;

    const question = remaining[Math.floor(Math.random() * remaining.length)];
    setAskedQuestions((prev) => ({
      ...prev,
      [category]: [...(prev[category] || []), question],
    }));
    return question;
  };

  const askNextCategoryQuestion = (category) => {
    const question = getRandomQuestion(category);
    if (question) {
      setCurrentCategory(category);
      setCurrentQuestion(question);
      setCategoryAskCounts((prev) => ({
        ...prev,
        [category]: (prev[category] || 0) + 1,
      }));
    } else {
      const currentIndex = categoriesQueue.indexOf(category);
      if (currentIndex < categoriesQueue.length - 1) {
        const nextCategory = categoriesQueue[currentIndex + 1];
        askNextCategoryQuestion(nextCategory);
      } else {
        finalizeCategory(categoryYesCounts);
      }
    }
  };

  const handleAnswer = (answer) => {
    setMessages((prev) => [
      ...prev,
      {
        text: `You said: ${answer === "yes" ? "Yes ✅" : "No ❌"}`,
        sender: "user",
      },
    ]);

    const updatedYesCounts = { ...categoryYesCounts };
    if (answer === "yes") {
      updatedYesCounts[currentCategory] = (updatedYesCounts[currentCategory] || 0) + 1;
      setCategoryYesCounts(updatedYesCounts);
      if (updatedYesCounts[currentCategory] >= 4) {
        setCategoryFinalized(currentCategory);
        return;
      }
    }

    const nextQ = getRandomQuestion(currentCategory);
    if (nextQ) {
      setCurrentQuestion(nextQ);
    } else {
      const currentIndex = categoriesQueue.indexOf(currentCategory);
      if (currentIndex < categoriesQueue.length - 1) {
        const nextCategory = categoriesQueue[currentIndex + 1];
        askNextCategoryQuestion(nextCategory);
      } else {
        finalizeCategory(updatedYesCounts);
      }
    }
  };

  const finalizeCategory = (yesCounts) => {
    const sorted = Object.entries(yesCounts).sort((a, b) => b[1] - a[1]);
    const topCategory = sorted[0]?.[0];
    const topCount = sorted[0]?.[1] || 0;

    if (topCount >= 4) {
      setCategoryFinalized(topCategory);
    } else if (!additionalRoundDone && sorted.length > 1) {
      const topTwo = sorted.slice(0, 2).map(([cat]) => cat);
      const moreQuestions = topTwo
        .map((cat) => getRandomQuestion(cat))
        .filter((q) => q !== null);
      if (moreQuestions.length > 0) {
        setAdditionalRoundDone(true);
        askNextCategoryQuestion(topTwo[0]);
      } else {
        setCategoryFinalized(topCategory); // fallback only if all exhausted
      }
    } else {
      setCategoryFinalized(topCategory); // final fallback after 2 rounds
    }
  };

  const askKidsQuestion = () => {
    simulateTyping("Do you have kids in your trip?");
    setStep("kids");
  };

  const handleKidsAdultsAnswer = (answer) => {
    setMessages((prev) => [
      ...prev,
      {
        text: `You said: ${answer === "yes" ? "Yes ✅" : "No ❌"}`,
        sender: "user",
      },
    ]);

    if (step === "kids") {
      setIsKidsSelected(answer === "yes");
      simulateTyping("Are there adults in your trip?");
      setStep("adults");
    } else if (step === "adults") {
      setIsAdultsSelected(answer === "yes");
      simulateTyping("Where do you want to go?");
      setStep("district");
    }
  };

  const handleDistrictSelect = (e) => setDistrict(e.target.value);

  const submitDistrict = () => {
    if (!district) {
      alert("Please select a district.");
      return;
    }
    setMessages((prev) => [...prev, { text: `You chose: ${district}`, sender: "user" }]);
    simulateTyping("How many days is your trip?");
    setStep("days");
  };

  const handleDaysInput = (e) => setDays(e.target.value);

  const submitDays = () => {
    setMessages((prev) => [
      ...prev,
      { text: `You chose: ${days} days`, sender: "user" },
    ]);
    simulateTyping("Great! Let me find the best places for you. 🚀");

    setTimeout(() => {
      const { finalMood, extraCategories } = determineFinalMood();
      navigate("/main/mcq-result", {
        state: { mood: [finalMood, ...extraCategories], district, days },
      });
    }, 2000);
  };

  const determineFinalMood = () => {
    let finalMood = categoryFinalized || "Cultural";

    let extraCategories = [];
    if (isKidsSelected && isAdultsSelected) {
      extraCategories = ["Entertainment", "Social & Fun", "Cultural", "Relaxation"];
    } else if (isKidsSelected) {
      extraCategories = ["Entertainment", "Social & Fun"];
    } else if (isAdultsSelected) {
      extraCategories = ["Cultural", "Relaxation"];
    }

    return { finalMood, extraCategories };
  };

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-3">AI Trip Planner Bot</h2>

      <div className="card shadow-lg p-3 w-50 mx-auto">
        <div className="card-body chat-box overflow-auto" style={{ maxHeight: "400px" }}>
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`alert ${msg.sender === "bot" ? "alert-info" : "alert-success"} mb-2`}
            >
              {msg.text}
            </div>
          ))}
          {isTyping && <div className="typing-indicator">Bot is typing...</div>}
          <div ref={chatEndRef} />
        </div>

        <div className="card-footer">
          {step === "questioning" && currentQuestion && (
            <div className="d-flex gap-2 mt-2">
              <button className="btn btn-success" onClick={() => handleAnswer("yes")}>
                Yes
              </button>
              <button className="btn btn-danger" onClick={() => handleAnswer("no")}>
                No
              </button>
            </div>
          )}

          {(step === "kids" || step === "adults") && (
            <div className="d-flex gap-2 mt-2">
              <button className="btn btn-success" onClick={() => handleKidsAdultsAnswer("yes")}>
                Yes
              </button>
              <button className="btn btn-danger" onClick={() => handleKidsAdultsAnswer("no")}>
                No
              </button>
            </div>
          )}

          {step === "district" && (
            <div className="mt-3">
              <select value={district} onChange={handleDistrictSelect} className="form-select mb-2">
                <option value="">Select District</option>
                {districtOptions.map((d, idx) => (
                  <option key={idx} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              <button className="btn btn-primary" onClick={submitDistrict}>
                Submit
              </button>
            </div>
          )}

          {step === "days" && (
            <div className="mt-3">
              <input
                type="number"
                value={days}
                min="1"
                onChange={handleDaysInput}
                className="form-control mb-2"
              />
              <button className="btn btn-primary" onClick={submitDays}>
                Submit
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MoodForm;
