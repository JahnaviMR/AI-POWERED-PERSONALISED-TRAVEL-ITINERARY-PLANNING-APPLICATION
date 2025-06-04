import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import {
  Modal,
  Button,
  Card,
  Row,
  Col,
  Badge,
  Form,
  ProgressBar,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  FaMapMarkerAlt,
  FaArrowLeft,
  FaTrash,
  FaEye,
  FaMap,
  FaEdit,
  FaStar,
} from "react-icons/fa";
import { UserContext } from "../App";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function MyItineraries() {
  const { user } = useContext(UserContext);
  const [itineraries, setItineraries] = useState([]);
  const [viewData, setViewData] = useState([]);
  const [statusData, setStatusData] = useState({});
  const [showItineraryModal, setShowItineraryModal] = useState(false);
  const [showEventsModal, setShowEventsModal] = useState(false);
  const [selectedItinerary, setSelectedItinerary] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [isEditingFeedback, setIsEditingFeedback] = useState(false);
  const [events, setEvents] = useState([]);
  const [district, setDistrict] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const navigate = useNavigate();
  const [placeIds, setPlaceIds] = useState([]);

  useEffect(() => {
    fetchItineraries();
  }, []);

  const fetchItineraries = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/trip-places/all");
      const userItineraries = (response.data || []).filter(
        (itinerary) => itinerary.user === user.useremail
      );
      const places = (response.data || []).map(itinerary => JSON.parse(itinerary.placeids || "[]")).flat();
      setPlaceIds(places);

      userItineraries.forEach((itinerary) => {
        if (itinerary.statusJson) {
          try {
            itinerary.statusData = JSON.parse(itinerary.statusJson);
          } catch (e) {
            itinerary.statusData = {};
          }
        } else {
          itinerary.statusData = {};
        }
      });

      setItineraries(userItineraries);
    } catch (error) {
      toast.error("Error fetching itineraries.");
    }
  };

  /**
    * Calculate the distance between two points on Earth (Haversine formula).
    * @param {number} lat1 - Latitude of point 1 (in decimal degrees).
    * @param {number} lon1 - Longitude of point 1 (in decimal degrees).
    * @param {number} lat2 - Latitude of point 2 (in decimal degrees).
    * @param {number} lon2 - Longitude of point 2 (in decimal degrees).
    * @returns {number} Distance in kilometers (rounded to 2 decimal places).
    */
  function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const φ1 = lat1 * Math.PI / 180; // Convert degrees to radians
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) *
      Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return parseFloat(distance.toFixed(2)); // Round to 2 decimal places
  }


  const sortPlacesByProximity = (places, days) => {
    if (!places || places.length === 0) return [];

    const sortedDays = [];
    let remainingPlaces = [...places];
    const placesPerDay = Math.ceil(places.length / days);

    for (let day = 0; day < days; day++) {
      if (remainingPlaces.length === 0) break;

      const startingPoint = day === 0
        ? remainingPlaces[0]
        : sortedDays[day - 1][sortedDays[day - 1].length - 1];

      if (!startingPoint || isNaN(parseFloat(startingPoint.latitude)) || isNaN(parseFloat(startingPoint.longitude))) {
        console.error('Invalid starting point:', startingPoint);
        continue;
      }

      const placesWithDistances = remainingPlaces.map(place => {
        if (isNaN(parseFloat(place.latitude)) || isNaN(parseFloat(place.longitude))) {
          console.error('Invalid place coordinates:', place);
          return { ...place, distanceFromStart: Infinity };
        }

        const distance = calculateDistance(
          startingPoint.latitude,
          startingPoint.longitude,
          place.latitude,
          place.longitude
        );
        return {
          ...place,
          distanceFromStart: distance,
          latitude: parseFloat(place.latitude),
          longitude: parseFloat(place.longitude)
        };
      });

      placesWithDistances.sort((a, b) => a.distanceFromStart - b.distanceFromStart);
      const dayPlaces = placesWithDistances.slice(0, placesPerDay);

      const dayPlacesWithDistances = dayPlaces.map((place, index) => {
        if (index === 0) return { ...place, distance: 0 };

        const prevPlace = dayPlaces[index - 1];
        const distance = calculateDistance(
          prevPlace.latitude,
          prevPlace.longitude,
          place.latitude,
          place.longitude
        );
        return {
          ...place,
          distance: isNaN(distance) ? 0 : distance
        };
      });

      sortedDays.push(dayPlacesWithDistances);
      remainingPlaces = remainingPlaces.filter(
        p => !dayPlaces.some(dp => dp.id === p.id)
      );
    }

    return sortedDays;
  };

  const fetchFilteredData = async (district, days, placeIds, itinerary) => {
    try {
      if (typeof placeIds === "string") {
        placeIds = JSON.parse(placeIds);
      }

      if (!Array.isArray(placeIds) || placeIds.length === 0) {
        toast.warn("No valid place IDs provided.");
        setViewData([]);
        return;
      }

      const response = await axios.get(
        `http://localhost:8080/api/itinerary/byIds?ids=${placeIds.join(',')}`
      );

      const fetchedPlaces = response.data;

      if (!Array.isArray(fetchedPlaces) || fetchedPlaces.length === 0) {
        toast.warn("No data found for selected places.");
        setViewData([]);
        return;
      }

      const validPlaces = fetchedPlaces.filter(place =>
        !isNaN(parseFloat(place.latitude)) && !isNaN(parseFloat(place.longitude))
      );

      if (validPlaces.length !== fetchedPlaces.length) {
        console.warn('Some places had invalid coordinates and were filtered out');
      }

      const sortedDays = sortPlacesByProximity(validPlaces, days);

      setViewData(sortedDays);
      setSelectedItinerary(itinerary);
      setFeedback(itinerary.review || "");
      setRating(itinerary.rating || 0);
      setIsEditingFeedback(!itinerary.review);
      setStatusData(itinerary.statusData || {});
      setShowItineraryModal(true);

    } catch (error) {
      console.error("Error fetching filtered data:", error);
      toast.error("Failed to fetch itinerary data.");
      setViewData([]);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const dateObj = new Date(dateString);
    return dateObj.toLocaleDateString(undefined, options);
  };

  const generateMapUrl = (placesArray) => {
    if (!placesArray || placesArray.length === 0) return "#";

    const encodedPlaces = placesArray.map((p) => {
      const district = p.district ? encodeURIComponent(p.district) : "";
      const place = p.place ? encodeURIComponent(p.place) : "";

      return `${district}${district && place ? ',' : ''}${place}`;
    });

    return `https://www.google.com/maps/dir/${encodedPlaces.join('/')}`;
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this itinerary?")) {
      try {
        await axios.delete(`http://localhost:8080/api/trip-places/delete/${id}`);
        toast.success("Itinerary deleted successfully!");
        fetchItineraries();
      } catch (error) {
        toast.error("Error deleting itinerary.");
      }
    }
  };

  const submitFeedback = async () => {
    if (!feedback.trim()) {
      toast.warn("Feedback cannot be empty.");
      return;
    }

    try {
      const response = await axios.put(
        `http://localhost:8080/api/trip-places/updateview/${selectedItinerary.id}`,
        {
          review: feedback,
          rating: rating
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Update response:", response.data);
      toast.success("Feedback and rating submitted successfully!");
      setIsEditingFeedback(false);
      fetchItineraries();
    } catch (error) {
      console.error("Update error:", error.response?.data || error.message);
      toast.error("Failed to submit feedback or rating.");
    }
  };

  const handleStatusChange = async (placeId, newStatus) => {
    try {
      const updatedStatusData = {
        ...statusData,
        [placeId]: newStatus
      };

      setStatusData(updatedStatusData);

      await axios.put(
        `http://localhost:8080/api/trip-places/updatestatus/${selectedItinerary.id}`,
        updatedStatusData
      );

      toast.success("Status updated successfully!");
    } catch (error) {
      toast.error("Failed to update status.");
      console.error("Status update error:", error);
    }
  };

  const calculateCompletionPercentage = () => {
    if (!viewData || viewData.length === 0) return 0;

    // Count all places across all days
    const totalPlaces = viewData.reduce((sum, day) => sum + day.length, 0);

    if (totalPlaces === 0) return 0;

    // Count visited places
    const visitedCount = Object.entries(statusData).reduce((count, [placeId, status]) => {
      return status === "Visited" ? count + 1 : count;
    }, 0);

    return Math.round((visitedCount / totalPlaces) * 100);
  };

  const handleShowEvents = async (districtName) => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/events/bydistrict/${encodeURIComponent(districtName)}`
      );
      setDistrict(districtName);
      setEvents(response.data || []);
      setShowEventsModal(true);
    } catch (error) {
      toast.error("Error fetching events.");
    }
  };

  const handleRatingSubmit = async (newRating) => {
    try {
      const response = await axios.put(
        `http://localhost:8080/api/trip-places/updateview/${selectedItinerary.id}`,
        { rating: newRating },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Rating update response:", response.data);
      toast.success("Rating updated successfully!");
      setRating(newRating);
      fetchItineraries();
    } catch (error) {
      console.error("Rating update error:", error.response?.data || error.message);
      toast.error("Failed to update rating.");
    }
  };

  const renderStars = (forDisplay = false, displayRating = 0) => {
    const currentRating = forDisplay ? displayRating : (hoverRating || rating);
    return [1, 2, 3, 4, 5].map((star) => (
      <FaStar
        key={star}
        className="star"
        color={currentRating >= star ? "#ffc107" : "#e4e5e9"}
        onMouseEnter={forDisplay ? null : () => setHoverRating(star)}
        onMouseLeave={forDisplay ? null : () => setHoverRating(0)}
        onClick={forDisplay ? null : () => handleRatingSubmit(star)}
        style={{
          cursor: forDisplay ? "default" : "pointer",
          fontSize: forDisplay ? "18px" : "24px",
          margin: "0 2px"
        }}
      />
    ));
  };

  return (
    <div className="container mt-4">
      <button className="btn btn-info mb-3" onClick={() => navigate(-1)}>
        <FaArrowLeft className="me-1" /> Back
      </button>

      <h2 className="text-center text-primary mb-4">My Itineraries</h2>

      {itineraries.length > 0 ? (
        itineraries.map((itinerary) => (
          <div key={itinerary.id} className="mb-4">
            <h4 className="text-success">
              {itinerary.category} - {itinerary.district} - {itinerary.days} Days
            </h4>

            <div className="card p-4 shadow border-0 rounded-4 w-50">
              <p><strong>District:</strong> {itinerary.district}</p>
              <p><strong>Days:</strong> {itinerary.days}</p>
              <div className="mb-2">
                <strong>Rating:</strong>
                <div className="d-inline-block ms-2">
                  {renderStars(true, itinerary.rating || 0)}
                  {itinerary.rating ? (
                    <span className="ms-2">{itinerary.rating.toFixed(1)}</span>
                  ) : (
                    <span className="ms-2 text-muted">Not rated yet</span>
                  )}
                </div>
              </div>
              <span className="d-flex justify-content-end mt-2">
                <button
                  className="btn btn-info me-2"
                  onClick={() =>
                    fetchFilteredData(itinerary.district, itinerary.days, itinerary.placeids, itinerary)
                  }
                >
                  <FaEye className="me-1" /> View
                </button>
                <button
                  className="btn btn-secondary me-2"
                  onClick={() => handleShowEvents(itinerary.district)}
                >
                  <FaMapMarkerAlt className="me-1" /> Events
                </button>
                <button className="btn btn-danger" onClick={() => handleDelete(itinerary.id)}>
                  <FaTrash className="me-1" /> Delete
                </button>
              </span>
            </div>
          </div>
        ))
      ) : (
        <p className="text-center">No saved itineraries.</p>
      )}

      <Modal show={showItineraryModal} onHide={() => setShowItineraryModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Full Itinerary Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {viewData.length > 0 ? (
            <>
              <ProgressBar
                now={calculateCompletionPercentage()}
                label={`${calculateCompletionPercentage()}% (${Object.values(statusData).filter(s => s === "Visited").length}/${viewData.reduce((sum, day) => sum + day.length, 0)})`}
                className="mb-4"
                variant="success"
                style={{ height: "30px" }}
              />

              <div className="mb-4">
                <h5>Rate this itinerary:</h5>
                <div className="d-flex align-items-center">
                  <div className="me-3">
                    {renderStars()}
                  </div>
                  <span className="text-muted">
                    {rating ? `You rated this ${rating} star${rating !== 1 ? 's' : ''}` : "Click to rate"}
                  </span>
                </div>
              </div>

              {viewData.map((dayGroup, dayIdx) => (
                <Card key={dayIdx} className="mb-4 shadow-sm w-100">
                  <Card.Header className="bg-light d-flex align-items-center">
                    <Badge bg="primary" className="me-2 p-2 rounded-circle">
                      Day {dayIdx + 1}
                    </Badge>
                    <h5 className="m-0">Day {dayIdx + 1} Itinerary</h5>
                  </Card.Header>
                  <Card.Body>
                    {dayGroup.map((place, idx) => (
                      <Row key={idx} className="align-items-center mb-3">
                        <Col md={4}>
                          {place.imageUrl ? (
                            place.imageUrl.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
                              <img
                                src={place.imageUrl}
                                className="img-fluid rounded"
                                alt={place.place}
                                style={{ height: "120px", objectFit: "cover", width: "100%" }}
                              />
                            ) : place.imageUrl.startsWith('https://') ? (
                              <div
                                className="bg-secondary text-white text-center d-flex align-items-center justify-content-center rounded"
                                style={{ height: "120px" }}
                              >
                                <p className="mb-2 text-white m-1 ">Link Available</p>
                                <a
                                  href={place.imageUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn btn-sm btn-primary"
                                >
                                  Click here
                                </a>
                              </div>
                            ) : (
                              <div
                                className="bg-secondary text-white text-center d-flex align-items-center justify-content-center rounded"
                                style={{ height: "120px" }}
                              >
                                <img
                                  src={place.imageUrl}
                                  className="img-fluid rounded"
                                  alt={place.place}
                                  style={{ height: "120px", objectFit: "cover", width: "100%" }}
                                />
                              </div>
                            )
                          ) : (
                            <div
                              className="bg-secondary text-white text-center d-flex align-items-center justify-content-center rounded"
                              style={{ height: "120px" }}
                            >
                              No Image
                            </div>
                          )}
                        </Col>

                        <Col md={8}>
                          <h6 className="text-primary">{place.place}</h6>
                          <p className="small">{place.description}</p>
                          {idx > 0 && (
                            <p className="text-muted small">
                              <strong>Distance from previous:</strong> {place.distance} km
                            </p>
                          )}
                          <Form.Select
                            className="mt-2 w-25"
                            value={statusData[place.id] || ""}
                            onChange={(e) => handleStatusChange(place.id, e.target.value)}
                          >
                            <option value="">Select Status</option>
                            <option value="Visited">Visited</option>
                            <option value="Not Visited">Not Visited</option>
                          </Form.Select>
                        </Col>
                      </Row>
                    ))}

                    <div className="text-center mt-3">
                      <a
                        href={generateMapUrl(dayGroup)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline-success"
                      >
                        <FaMap className="me-1" /> View Full Map - Day {dayIdx + 1}
                      </a>
                    </div>
                  </Card.Body>
                </Card>
              ))}

              <Form.Group className="mt-4">
                <Form.Label>Feedback:</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={feedback}
                  readOnly={!isEditingFeedback}
                  onChange={(e) => setFeedback(e.target.value)}
                />
                {isEditingFeedback ? (
                  <Button className="mt-2 btn-success" onClick={submitFeedback}>
                    Submit Feedback
                  </Button>
                ) : (
                  <Button className="mt-2 btn-primary" onClick={() => setIsEditingFeedback(true)}>
                    <FaEdit className="me-1" /> Edit Feedback
                  </Button>
                )}
              </Form.Group>
            </>
          ) : (
            <p>No itinerary data available.</p>
          )}
        </Modal.Body>
      </Modal>

      <Modal show={showEventsModal} onHide={() => setShowEventsModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title className="text-primary">
            Events in {district}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {events.length > 0 ? (
            <div className="event-list-container" style={{
              maxHeight: '60vh',
              overflowY: 'auto',
              margin: '1rem 0',
              border: '1px solid #dee2e6',
              borderRadius: '0.25rem',
              padding: '0.5rem'
            }}>
              {events.map((event) => (
                <div key={event.id} className="border rounded p-3 mb-3 shadow-sm">
                  <h5 className="text-success mb-1">{event.eventname}</h5>
                  <p className="mb-1">
                    <strong>District:</strong> {event.district}
                  </p>
                  <p className="mb-1">
                    <strong>Date:</strong> {formatDate(event.eventDate)}
                  </p>
                  <p className="mb-2">
                    <strong>Description:</strong> {event.description}
                  </p>
                  {event.locationUrl && (
                    <p className="mb-0">
                      <a
                        href={event.locationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline-primary btn-sm"
                      >
                        View Location
                      </a>
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted">No events available.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEventsModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      <ToastContainer />
    </div>
  );
}

export default MyItineraries;