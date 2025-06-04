import React, { useEffect, useState, useContext } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaMapMarkerAlt, FaMap, FaCalendarAlt, FaExternalLinkAlt, FaStar, FaRegStar, FaChild, FaUser } from "react-icons/fa";
import { UserContext } from "../App";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./AllCss/MCQResult.css";
import "./AllCss/EventsModal.css";

function MCQResult() {
  const { user } = useContext(UserContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [mood, setMood] = useState([]);
  const [district, setDistrict] = useState("");
  const [places, setPlaces] = useState([]);
  const [daysSelected, setDaysSelected] = useState(1);
  const [previousPage, setPreviousPage] = useState(null);
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [savedItineraries, setSavedItineraries] = useState([]);
  const [showSavedItineraries, setShowSavedItineraries] = useState(false);
  const [selectedItineraryPlaces, setSelectedItineraryPlaces] = useState([]);
  const [showItineraryDetails, setShowItineraryDetails] = useState(false);

  useEffect(() => {
    if (location.state) {
      setMood(location.state.mood || []);
      setDistrict(location.state.district || "");
      setDaysSelected(Number(location.state.days) || 1);
      setPreviousPage(location.state.previousPage || "/main");
    }
  }, [location.state]);

  useEffect(() => {
    if (mood.length > 0 && district) {
      fetchPlaces(mood, district);
      fetchSavedItineraries();
    }
  }, [mood, district]);

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

  // Function to sort places by proximity
  const sortPlacesByProximity = (places) => {
    if (!places || places.length < 2) return places;

    const sortedPlaces = [places[0]];  // Start with the first place
    let remainingPlaces = [...places.slice(1)];

    while (remainingPlaces.length > 0) {
      const lastPlace = sortedPlaces[sortedPlaces.length - 1];
      let nearestIndex = 0;
      let minDistance = Infinity;

      remainingPlaces.forEach((place, index) => {
        const distance = calculateDistance(
          parseFloat(lastPlace.latitude),
          parseFloat(lastPlace.longitude),
          parseFloat(place.latitude),
          parseFloat(place.longitude)
        );

        if (distance < minDistance) {
          minDistance = distance;
          nearestIndex = index;
        }
      });

      // Add the nearest place to the sorted places list
      sortedPlaces.push(remainingPlaces[nearestIndex]);
      // Remove the nearest place from the remaining places list
      remainingPlaces.splice(nearestIndex, 1);
    }

    return sortedPlaces;
  };

  const fetchPlaces = async (selectedCategory, selectedDistrict) => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/itinerary/filter?category=${encodeURIComponent(
          selectedCategory
        )}&district=${encodeURIComponent(selectedDistrict)}`
      );

      const sortedPlaces = sortPlacesByProximity(response.data || []);
      setPlaces(sortedPlaces);
    } catch (error) {
      toast.error("Error fetching places.");
    }
  };

  const fetchSavedItineraries = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/trip-places/all?district=${encodeURIComponent(district)}&category=${encodeURIComponent(mood.join(", "))}`
      );
      const sortedItineraries = response.data.sort((a, b) => b.rating - a.rating);
      setSavedItineraries(sortedItineraries);
    } catch (error) {
      toast.error("Error fetching saved itineraries.");
    }
  };

  const fetchItineraryPlaces = async (itinerary) => {
    console.log("Fetching itinerary places for:", itinerary);

    let placeIds = itinerary.placeids;
    if (typeof placeIds === 'string') {
      try {
        placeIds = JSON.parse(placeIds);
      } catch (e) {
        console.error("Invalid place ID format:", placeIds);
        return;
      }
    }

    try {
      const response = await axios.get("http://localhost:8080/api/itinerary/byIds", {
        params: { ids: placeIds },
        paramsSerializer: params => params.ids.map(id => `ids=${id}`).join('&')
      });

      const sortedPlaces = sortPlacesByProximity(response.data || []);
      setSelectedItineraryPlaces(groupPlacesByDays(sortedPlaces, itinerary.days));
      setShowItineraryDetails(true);
    } catch (error) {
      toast.error("Error fetching itinerary places.");
      console.error(error);
    }
  };

  const groupPlacesByDays = (places, selectedDays) => {
    if (!places || places.length === 0) return []; // Return empty if no places
  
    const sortedPlaces = sortPlacesByProximity(places);
    const totalPlaces = sortedPlaces.length;
  
    // Determine places per day based on selected days
    const placesPerDay = selectedDays === 3 ? 3 : 
                        selectedDays === 2 ? 4 : 
                        3; // default to 3 for other cases
  
    let groupedPlaces = [];
    let currentIndex = 0;
    let dayCount = 0;
  
    while (currentIndex < totalPlaces && dayCount < selectedDays) {
      dayCount++;
      
      // Calculate places for this day
      const remainingPlaces = totalPlaces - currentIndex;
      const placesThisDay = Math.min(placesPerDay, remainingPlaces);
      
      // Skip empty days
      if (placesThisDay <= 0) break;
  
      const dayPlaces = sortedPlaces.slice(currentIndex, currentIndex + placesThisDay)
        .map((place, index) => {
          if (dayCount === 1 && index === 0) return { ...place, distance: 0 };
          
          if (index === 0) {
            const prevDayLastPlace = groupedPlaces[dayCount-2]?.places?.[groupedPlaces[dayCount-2]?.places?.length-1];
            if (!prevDayLastPlace) return { ...place, distance: 0 };
            
            const distance = calculateDistance(
              parseFloat(prevDayLastPlace.latitude),
              parseFloat(prevDayLastPlace.longitude),
              parseFloat(place.latitude),
              parseFloat(place.longitude)
            );
            return { ...place, distance };
          }
          
          const prevPlace = sortedPlaces[currentIndex + index - 1];
          const distance = calculateDistance(
            parseFloat(prevPlace.latitude),
            parseFloat(prevPlace.longitude),
            parseFloat(place.latitude),
            parseFloat(place.longitude)
          );
          return { ...place, distance };
        });
  
      groupedPlaces.push({
        day: dayCount,
        places: dayPlaces
      });
      
      currentIndex += placesThisDay;
    }
  
    return groupedPlaces;
  };

  const groupedPlaces = groupPlacesByDays(places, daysSelected);

  useEffect(() => {
    if (places.length > 0 && groupedPlaces.length > 0) {
      const minPlaces = Math.min(...groupedPlaces.map(d => d.places.length));
      const maxPlaces = Math.max(...groupedPlaces.map(d => d.places.length));
      
      if (groupedPlaces.length < daysSelected) {
        toast.info(`Showing ${places.length} places across ${groupedPlaces.length} days (${minPlaces}-${maxPlaces} places per day)`);
      } else {
        toast.info(`Distributing ${places.length} places across ${daysSelected} days (${minPlaces}-${maxPlaces} places per day)`);
      }
    }
  }, [groupedPlaces, daysSelected, places.length]);

  const saveItinerary = async () => {
    try {
      // Get all place IDs from the displayed grouped places
      const allPlaces = groupedPlaces.flatMap(group => group.places);
      const placeIds = allPlaces.map(place => place._id || place.id);

      const itineraryData = {
        district: district || "Unknown",
        days: daysSelected,
        user: user.useremail,
        category: mood.length > 0 ? mood.join(", ") : "Unknown",
        places: JSON.stringify(allPlaces),
        placeids: JSON.stringify(placeIds),
        rating: 0
      };

      await axios.post(
        "http://localhost:8080/api/trip-places/save",
        itineraryData
      );
      toast.success("Itinerary saved successfully!");
      fetchSavedItineraries();
    } catch (error) {
      toast.error("Error saving itinerary.");
      console.error("Error details:", error.response?.data);
    }
  };

  const handleShowEvents = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/events/bydistrict/${encodeURIComponent(district)}`
      );
      setEvents(response.data || []);
      setShowModal(true);
    } catch (error) {
      toast.error("Error fetching events.");
    }
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

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderRatingStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={`full-${i}`} className="text-warning" />);
    }

    if (hasHalfStar) {
      stars.push(<FaStar key="half" className="text-warning" />);
    }

    const remainingStars = 5 - stars.length;
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<FaRegStar key={`empty-${i}`} className="text-warning" />);
    }

    return stars;
  };

  const renderCategoryIcons = (categories) => {
    if (!categories) return null;

    return (
      <div className="category-icons">
        {categories.includes("Kids") && (
          <span className="me-2" title="Kid-friendly">
            <FaChild className="text-primary" />
          </span>
        )}
        {categories.includes("Adults") && (
          <span title="Adult-friendly">
            <FaUser className="text-success" />
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="container mt-4">
      <button
        className="btn btn-info mb-3"
        onClick={() => navigate(previousPage)}
      >
        {"<-"} Back
      </button>

      <h2 className="text-center mb-4">🌍 Recommended Itinerary</h2>
      <h4 className="text-center">
        Categories:{" "}
        <span className="badge bg-primary fs-5 px-3">
          {mood.join(", ") || "None"}
        </span>
      </h4>
      <h5 className="text-center">
        District:{" "}
        <span className="badge bg-success fs-5 px-3">{district || "None"}</span>
      </h5>

      <div className="text-center my-4 ">
        <button
          className="btn btn-warning btn-lg animate-button me-3"
          onClick={handleShowEvents}
        >
          <FaCalendarAlt className="me-2" />
          View Events in {district}
        </button>
        <button
          className="btn btn-primary btn-lg animate-button"
          onClick={() => setShowSavedItineraries(!showSavedItineraries)}
        >
          {showSavedItineraries ? "Hide" : "Show"} Recommended from Users
        </button>
      </div>

      {showSavedItineraries && (
        <div className="saved-itineraries-container mb-5 recomended">
          <h3 className="text-center mb-4">⭐ Recommended from Users in {district}</h3>
          <div className="row">
            {savedItineraries.length > 0 ? (
              savedItineraries.map((itinerary, index) => (
                <div key={index} className="col-md-4 mb-4">
                  <div
                    className="card h-100 cursor-pointer"
                    onClick={() => fetchItineraryPlaces(itinerary)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="card-header bg-info text-white">
                      <h5>{itinerary.district} Itinerary</h5>
                    </div>
                    <div className="card-body">
                      <p className="overflow-hidden"><strong>Categories:</strong> {itinerary.category}</p>
                      <p><strong>Days:</strong> {itinerary.days}</p>
                      <p className="overflow-auto"><strong>Feedback:</strong> {itinerary.review?itinerary.review:"No feedback given"}</p>
                      <div className="rating mb-3">
                        <strong>Rating:</strong>
                        <div className="d-inline ms-2">
                          {renderRatingStars(itinerary.rating || 0)}
                          <span className="ms-2">({itinerary.rating?.toFixed(1) || '0.0'})</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-12">
                <p className="text-center text-muted">No recommended itineraries found for this district and mood.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {showItineraryDetails ? (
        <div className="timeline">
          <button
            className="btn btn-secondary mb-3"
            onClick={() => setShowItineraryDetails(false)}
          >
            Back to Results
          </button>
          <h3 className="text-center mb-4">Recommended Itinerary Details</h3>
          {selectedItineraryPlaces.map((group) => (
            <div key={group.day} className="timeline-item">
              <div className="timeline-dot">Day {group.day}</div>
              <div className="timeline-content card p-5 w-100">
                {group.places.map((place, index) => (
                  <div
                    key={index}
                    className="row mb-3 align-items-center shadow-sm p-2 rounded bg-light"
                  >
                    <div className="col-md-4">
                        {place.imageUrl ? (
                          place.imageUrl.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
                            <img
                              src={place.imageUrl}
                              className="img-fluid"
                              alt={place.place || "Place"}
                              style={{
                                height: "120px",
                                width: "100%",
                                objectFit: "cover",
                              }}
                            />
                          ) : place.imageUrl.startsWith('https://') ? (
                            <div
                              className="d-flex align-items-center justify-content-center"
                              style={{
                                height: "120px",
                                width: "100%",
                                backgroundColor: "#e9ecef",
                                border: "1px dashed #ccc",
                                textAlign: "center",
                                flexDirection: "column",
                              }}
                            >
                              <p className="mb-2">Link Available</p>
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
                              className="bg-secondary text-white d-flex align-items-center justify-content-center"
                              style={{ height: "120px", width: "100%" }}
                            > <img
                                src={place.imageUrl}
                                className="img-fluid"
                                alt={place.place || "Place"}
                                style={{
                                  height: "120px",
                                  width: "100%",
                                  objectFit: "cover",
                                }}
                              />
                            </div>
                          )
                        ) : (
                          <div
                            className="bg-secondary text-white d-flex align-items-center justify-content-center"
                            style={{ height: "120px", width: "100%" }}
                          >
                            No Image
                          </div>
                        )}
                      </div>
                    <div className="col-md-8">
                      <div className="d-flex justify-content-between align-items-start">
                        <h6 className="fw-bold mb-1">
                          {place.place || "Unknown Place"}
                        </h6>
                        {renderCategoryIcons(place.category)}
                      </div>
                      <p className="mb-1 text-muted">
                        <strong>District:</strong> {place.district || "Unknown"}
                      </p>
                      <p className="small text-truncate" style={{ maxWidth: "90%" }}>
                        {place.description || "No description available."}
                      </p>
                      {index > 0 && (
                        <p>
                          <strong>Distance from previous:</strong> {place.distance} km
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                <div className="text-center mt-3">
                  <a
                    href={generateMapUrl(group.places)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline-success"
                  >
                    <FaMap className="me-1" />
                    View Full Map - Day {group.day}
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="timeline">
          {groupedPlaces.length > 0 ? (
            groupedPlaces.map((group) => (
              <div key={group.day} className="timeline-item">
                <div className="timeline-dot">Day {group.day}</div>
                <div className="timeline-content card p-5 w-100">
                  {group.places.map((place, index) => (
                    <div
                      key={index}
                      className="row mb-3 align-items-center shadow-sm p-2 rounded bg-light"
                    >
                      <div className="col-md-4">
                        {place.imageUrl ? (
                          place.imageUrl.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
                            <img
                              src={place.imageUrl}
                              className="img-fluid"
                              alt={place.place || "Place"}
                              style={{
                                height: "120px",
                                width: "100%",
                                objectFit: "cover",
                              }}
                            />
                          ) : place.imageUrl.startsWith('https://') ? (
                            <div
                              className="d-flex align-items-center justify-content-center"
                              style={{
                                height: "120px",
                                width: "100%",
                                backgroundColor: "#e9ecef",
                                border: "1px dashed #ccc",
                                textAlign: "center",
                                flexDirection: "column",
                              }}
                            >
                              <p className="mb-2">Link Available</p>
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
                              className="bg-secondary text-white d-flex align-items-center justify-content-center"
                              style={{ height: "120px", width: "100%" }}
                            > <img
                                src={place.imageUrl}
                                className="img-fluid"
                                alt={place.place || "Place"}
                                style={{
                                  height: "120px",
                                  width: "100%",
                                  objectFit: "cover",
                                }}
                              />
                            </div>
                          )
                        ) : (
                          <div
                            className="bg-secondary text-white d-flex align-items-center justify-content-center"
                            style={{ height: "120px", width: "100%" }}
                          >
                            No Image
                          </div>
                        )}
                      </div>

                      <div className="col-md-8">
                        <div className="d-flex justify-content-between align-items-start">
                          <h6 className="fw-bold mb-1">
                            {place.place || "Unknown Place"}
                          </h6>
                          {renderCategoryIcons(place.category)}
                        </div>
                        <p className="mb-1 text-muted">
                          <strong>District:</strong> {place.district || "Unknown"}
                        </p>
                        <p className="small text-truncate" style={{ maxWidth: "90%" }}>
                          {place.description || "No description available."}
                        </p>
                        {index > 0 && (
                          <p>
                            <strong>Distance from previous:</strong> {place.distance} km
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                  <div className="text-center mt-3">
                    <a
                      href={generateMapUrl(group.places)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline-success"
                    >
                      <FaMap className="me-1" />
                      View Full Map - Day {group.day}
                    </a>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-muted mt-4">
              No recommendations found. Try again.
            </p>
          )}
        </div>
      )}

      <div className="text-center mb-5">
        <button className="btn btn-success btn-lg me-3" onClick={saveItinerary}>
          Save Itinerary
        </button>
        <Link to="/main/ItineraryDisplay" className="btn btn-secondary btn-lg">
          ✍️ Create Your Own Itinerary
        </Link>
      </div>

      {showModal && (
        <div className="custom-modal-overlay">
          <div className="custom-modal">
            <h4>Events in {district}</h4>
            {events.length > 0 ? (
              <div className="event-list-container" style={{ 
                maxHeight: '60vh',
                overflowY: 'auto',
                margin: '1rem 0',
                border: '1px solid #dee2e6',
                borderRadius: '0.25rem'
              }}>
                <ul className="list-group">
                  {events.map((event, idx) => (
                    <li key={idx} className="list-group-item">
                      <p>
                        <strong>Date:</strong>{" "}
                        {event.eventDate ? formatDateTime(event.eventDate) : "N/A"}
                      </p>
                      <p>
                        <strong>Description:</strong>{" "}
                        {event.description || "No description"}
                      </p>
                      {event.locationUrl && (
                        <p>
                          <a
                            href={event.locationUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary"
                          >
                            <FaMapMarkerAlt className="me-1" /> View Location{" "}
                            <FaExternalLinkAlt />
                          </a>
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-muted py-3">No events found in this district.</p>
            )}
            <button
              className="btn btn-danger mt-3 w-100"
              onClick={() => setShowModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default MCQResult;