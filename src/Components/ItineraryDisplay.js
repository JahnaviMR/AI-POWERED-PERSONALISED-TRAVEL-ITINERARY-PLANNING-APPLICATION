import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./AllCss/MCQPage.css";
import { Container, Row, Col, Card, Form, Button } from "react-bootstrap";
import { ToastContainer, toast } from 'react-toastify';

function ItineraryDisplay() {
  const navigate = useNavigate();
  const [districts, setDistricts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tripTypes, setTripTypes] = useState([]);
  const [answers, setAnswers] = useState({
    district: "",
    travelWith: "",
    category: "",
    tripType: "",
    budget: "",
    duration: "",
  });

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
      console.error("Error fetching categories:", error);
    }
  };

  const fetchTripTypes = async (district, category) => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/admin/tripTypes?district=${district}&category=${category}`
      );
      setTripTypes(response.data);
    } catch (error) {
      console.error("Error fetching trip types:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAnswers((prev) => ({ ...prev, [name]: value }));

    if (name === "district") fetchCategories(value, answers.travelWith);
    if (name === "travelWith") fetchCategories(answers.district, value);
    if (name === "category") fetchTripTypes(answers.district, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log("Sending request with data:", answers);
      const response = await axios.post(
        "http://localhost:8080/api/mcq/classifyMood",
        answers
      );
      console.log("Response from server:", response.data);

      const { mood, places } = response.data;
      if (!places || places.length === 0) {
        toast.error("No recommendations found. Try again with different inputs.");
        return;
      }

      navigate("/Main/mcq-result", {
        state: {
          mood: Array.isArray(mood) ? mood : [mood],
          district: answers.district, 
          days: answers.duration,
          places,
        },
      });

    } catch (error) {
      console.error("Error fetching recommendations:", error);
      toast.warning("Something went wrong! Check console for details.");
    }
  };

  return (
    <Container className="mt-4">
      <Card className="shadow-lg p-4 w-75 mx-auto">
        <h2 className="text-center mb-4">Trip Planner Form</h2>
        <Form onSubmit={handleSubmit}>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>District:</Form.Label>
                <Form.Select name="district" value={answers.district} onChange={handleChange}>
                  <option value="">Select District</option>
                  {districts.map((district, index) => (
                    <option key={index} value={district}>{district}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>Travel With:</Form.Label>
                <Form.Select name="travelWith" value={answers.travelWith} onChange={handleChange}>
                  <option value="">Select Option</option>
                  <option value="Kids">Kids</option>
                  <option value="Adults">Adults</option>
                  <option value="Both">Both</option>
                  <option value="None">None</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Category:</Form.Label>
                <Form.Select name="category" value={answers.category} onChange={handleChange}>
                  <option value="">Select Category</option>
                  {categories.map((category, index) => (
                    <option key={index} value={category}>{category}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>Trip Type:</Form.Label>
                <Form.Select name="tripType" value={answers.tripType} onChange={handleChange}>
                  <option value="">Select Trip Type</option>
                  {tripTypes.map((tripType, index) => (
                    <option key={index} value={tripType}>{tripType}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Budget:</Form.Label>
                <Form.Select name="budget" value={answers.budget} onChange={handleChange}>
                  <option value="">Select Budget</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>Duration (days):</Form.Label>
                <Form.Control
                  type="number"
                  name="duration"
                  value={answers.duration}
                  onChange={handleChange}
                  placeholder="Enter number of days"
                />
              </Form.Group>
            </Col>
          </Row>

          <div className="text-center">
            <Button type="submit" className="btn btn-primary mt-3">Get Recommendations</Button>
          </div>
          <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
        </Form>
      </Card>
    </Container>
  );
}

export default ItineraryDisplay;
