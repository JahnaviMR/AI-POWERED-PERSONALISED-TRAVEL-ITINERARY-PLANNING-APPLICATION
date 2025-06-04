import React, { useState, useEffect } from 'react';
import { Link, Outlet } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BsPersonCircle } from "react-icons/bs";
import { MdLogout } from "react-icons/md";
import { FaClipboardList } from "react-icons/fa";
import { FaCommentDots } from "react-icons/fa"; 
import axios from 'axios';
import { Modal, Button } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BsCalendar2EventFill } from "react-icons/bs";

function Admin() {
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbacks, setFeedbacks] = useState([]);

  const fetchFeedbacks = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/trip-places/all"); 
      setFeedbacks(response.data || ["No feedbacks available."]);
      setShowFeedbackModal(true);
    } catch (error) {
      toast.error("Failed to load feedbacks.");
    }
  };

  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-light">
        <div className="container-xl justify-content-around">
          <Link className="navbar-brand text-dark fw-bold" to="/admin">Itinerary App</Link>
          <button className="navbar-toggler btn-white" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon "></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0 mx-5">
              <li className="nav-item">
                <Link className="nav-link text-dark" to="upditinerary"><FaClipboardList /> Create Itinerary</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link text-dark" to="updevents"><BsCalendar2EventFill /> Events</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link text-dark" to="adminprofile"><BsPersonCircle/> Profile</Link>
              </li>
              <li className="nav-item">
                <button className="nav-link text-dark bg-transparent border-0" onClick={fetchFeedbacks}>
                  <FaCommentDots /> Feedbacks
                </button>
              </li>
              <li className="nav-item">
                <Link className="nav-link text-dark" to="/"><MdLogout /> LogOut</Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <Modal show={showFeedbackModal} onHide={() => setShowFeedbackModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>View Feedbacks</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {feedbacks.length > 0 ? (
           <div className="feedback-container" style={{
            maxHeight: '60vh',
            overflowY: 'auto',
            padding: '0.5rem',
            border: '1px solid #dee2e6',
            borderRadius: '0.5rem',
            margin: '1rem 0'
          }}>
            {feedbacks.length > 0 ? (
              feedbacks.map((item, idx) => item.review != null && (
                <div key={idx} className="feedback-item mb-3 p-3 border rounded shadow-sm">
                  <div className="d-flex flex-wrap justify-content-between align-items-center mb-2 gap-2">
                    <div className="d-flex flex-wrap gap-3">
                      <p className="mb-0 text-primary">
                        <strong>User:</strong> {item.user || 'Anonymous'}
                      </p>
                      <p className="mb-0 text-secondary">
                        <strong>District:</strong> {item.district || 'N/A'}
                      </p>
                      <p className="mb-0 ">
                        <strong>Category:</strong> {item.category || 'General'}
                      </p>
                    </div>
                  </div>
                  <div className="feedback-review mt-2">
                    <p className="mb-0 fs-5" style={{ lineHeight: '1.6' }}>
                      {item.review}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-muted">
                No feedback available yet
              </div>
            )}
          </div>
          ) : (
            <p className="text-center text-danger">No feedbacks available.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowFeedbackModal(false)}>Close</Button>
        </Modal.Footer>
      </Modal>

      <Outlet />
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default Admin;
