import React, { useState, useEffect } from "react";
import axios from "axios";
import "../Components/AllCss/Event.css";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

function UpdEvents() {
  const [isEditing, setIsEditing] = useState(false);
  const [districts, setDistricts] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [description, setDescription] = useState("");
  const [locationUrl, setLocationUrl] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [editId, setEditId] = useState(null);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetchDistricts();
    fetchEvents();
  }, []);

  const fetchDistricts = () => {
    axios.get("http://localhost:8080/api/itinerary/districts")
      .then(res => setDistricts(res.data))
      .catch(() => toast.error("Failed to load districts."));
  };

  const fetchEvents = () => {
    axios.get("http://localhost:8080/api/events/getevent")
      .then(res => setEvents(res.data))
      .catch(() => toast.error("Failed to load events."));
  };

  const handleSubmit = () => {
    const eventData = {
      district: selectedDistrict,
      description,
      locationUrl,
      eventDate: eventDate ? new Date(eventDate).toISOString() : null
    };

    axios.post("http://localhost:8080/api/events/events", eventData)
      .then(() => {
        toast.success("Event added successfully!");
        fetchEvents();
        resetForm();
      })
      .catch(() => toast.error("Failed to add event."));
  };

  const handleUpdate = () => {
    const updatedEvent = {
      district: selectedDistrict,
      description,
      locationUrl,
      eventDate: eventDate ? new Date(eventDate).toISOString() : null
    };

    axios.put(`http://localhost:8080/api/events/update/${editId}`, updatedEvent)
      .then(() => {
        toast.success("Event updated successfully!");
        fetchEvents();
        resetForm();
        setIsEditing(false);
      })
      .catch(() => toast.error("Failed to update event."));
  };

  const handleEditClick = (event) => {
    setIsEditing(true);
    setEditId(event.id);
    setSelectedDistrict(event.district);
    setDescription(event.description);
    setLocationUrl(event.locationUrl);

    if (event.eventDate) {
      const date = new Date(event.eventDate);
      const localDateTime = date.toISOString().slice(0, 16); 
      setEventDate(localDateTime);
    } else {
      setEventDate("");
    }
  };

  const handleDeleteClick = (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this event?");
    if (confirmed) {
      axios.delete(`http://localhost:8080/api/events/delete/${id}`)
        .then(() => {
          toast.success("Event deleted successfully!");
          fetchEvents();
        })
        .catch((err) => {
          console.error("Delete error:", err);
          toast.error("Failed to delete event.");
        });
    }
  };

  const resetForm = () => {
    setSelectedDistrict("");
    setDescription("");
    setLocationUrl("");
    setEventDate("");
    setEditId(null);
  };

  return (
    <div className="container mt-4">
      <h1>Manage Events</h1>
      <hr />

      <div className="row">
        <div className="col-md-6">
          <select
            className="form-select mb-2"
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
          >
            <option value="">Select District</option>
            {districts.map((dist, index) => (
              <option key={index} value={dist}>{dist}</option>
            ))}
          </select>

          <input
            className="form-control mb-2"
            type="text"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <input
            className="form-control mb-2"
            type="url"
            placeholder="Location URL"
            value={locationUrl}
            onChange={(e) => setLocationUrl(e.target.value)}
          />

          <input
            className="form-control mb-2"
            type="datetime-local"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
          />

          {!isEditing ? (
            <button className="btn btn-primary" onClick={handleSubmit}>Add Event</button>
          ) : (
            <>
              <button className="btn btn-secondary me-2" onClick={handleUpdate}>Update</button>
              <button className="btn btn-danger" onClick={() => {
                resetForm();
                setIsEditing(false);
              }}>Cancel</button>
            </>
          )}
        </div>

        <div className="col-md-6">
          <h4>All Events</h4>
          <table className="table table-bordered ">
            <thead>
              <tr>
                <th>District</th>
                <th>Description</th>
                <th>Location URL</th>
                <th>Event Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map(event => (
                <tr key={event.id}>
                  <td>{event.district}</td>
                  <td>{event.description}</td>
                  <td><a href={event.locationUrl} target="_blank" rel="noopener noreferrer">View</a></td>
                  <td>{event.eventDate ? new Date(event.eventDate).toLocaleString() : "N/A"}</td>
                  <td>
                    <button className="btn btn-sm btn-warning me-2" onClick={() => handleEditClick(event)}>Edit</button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDeleteClick(event.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ToastContainer position="top-right" autoClose={2000} pauseOnHover />
    </div>
  );
}

export default UpdEvents;
