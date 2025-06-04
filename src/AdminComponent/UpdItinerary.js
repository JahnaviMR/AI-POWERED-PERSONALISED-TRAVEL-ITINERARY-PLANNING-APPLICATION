import React, { useState, useEffect } from "react";
import axios from "axios";
import "../Components/AllCss/UpdItinerary.css";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function UpdItinerary() {
  const [formData, setFormData] = useState({
    id: null,
    district: "",
    place: "",
    latitude: "",
    longitude: "",
    description: "",
    tripWith: "",
    category: "",
    imageUrl: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [tripTypes, setTripTypes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [itineraries, setItineraries] = useState([]);

  useEffect(() => {
    fetchDropdownData();
    fetchItineraries();
  }, []);

  const fetchDropdownData = async () => {
    try {
      const tripRes = await axios.get("http://localhost:8080/api/admin/tripTypes");
      const categoryRes = await axios.get("http://localhost:8080/api/admin/categories");
      setTripTypes(tripRes.data);
      setCategories(categoryRes.data);
    } catch (error) {
      toast.error("Error fetching dropdown data:", error);
    }
  };

  const fetchItineraries = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/itinerary/all");
      setItineraries(response.data);
    } catch (error) {
      toast.error("Error fetching itineraries:", error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleMedia = (e) => {
    let file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      setFormData({ ...formData, imageUrl: reader.result });
      setSelectedFile(file.name);
    };
  };

  const handleEdit = (itinerary) => {
    setFormData({
      id: itinerary.id,
      district: itinerary.district,
      place: itinerary.place,
      description: itinerary.description,
      tripWith: itinerary.tripWith,
      category: itinerary.category,
      latitude: itinerary.latitude,
      longitude: itinerary.longitude,
      imageUrl: itinerary.imageUrl,
    });
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this itinerary?")) {
      try {
        await axios.delete(`http://localhost:8080/api/itinerary/delete/${id}`);
        toast.success("Itinerary deleted successfully!");
        fetchItineraries();
      } catch (error) {
        console.error("Error deleting itinerary:", error);
        toast.error("Failed to delete itinerary. Please try again.");
      }
    }
  };

  const trimFormData = (data) => {
    return {
      ...data,
      district: data.district.trim(),
      place: data.place.trim(),
      description: data.description.trim(),
      tripWith: data.tripWith.trim().toLowerCase(),
      category: data.category.trim().toLowerCase(),
      latitude: data.latitude.trim(),
      longitude: data.longitude.trim(),
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Trim all string fields before submitting
      const trimmedData = trimFormData(formData);
      
      const updatedFormData = {
        ...trimmedData,
        tripWith: trimmedData.tripWith.toLowerCase(),
        category: trimmedData.category.toLowerCase(),
      };

      if (isEditing) {
        await axios.put(
          `http://localhost:8080/api/itinerary/update/${formData.id}`,
          updatedFormData
        );
        toast.success("Itinerary updated successfully!");
      } else {
        await axios.post(
          "http://localhost:8080/api/itinerary/add",
          updatedFormData
        );
        toast.success("Itinerary added successfully!");
      }

      resetForm();
      fetchItineraries();
    } catch (error) {
      console.error("Error submitting itinerary:", error);
      toast.error("Error submitting itinerary. Please try again.");
    }
  };

  const resetForm = () => {
    setFormData({
      id: null,
      district: "",
      place: "",
      description: "",
      tripWith: "",
      latitude: "",
      longitude: "",
      category: "",
      imageUrl: "",
    });
    setSelectedFile(null);
    setIsEditing(false);
  };

  return (
    <div className="upd-itinerary">
      <section className="container">
        <div className="row justify-content-center">
          <div className="w-100">
            <h1 className="text-center mb-4">Update Itinerary</h1>
            <hr className="mb-4" />
            <div className="card p-4 shadow w-50 mx-auto">
              <form onSubmit={handleSubmit}>
                <input
                  className="form-control mb-3"
                  type="text"
                  name="district"
                  placeholder="Enter District Name"
                  value={formData.district}
                  onChange={handleChange}
                  required
                />
                <input
                  className="form-control mb-3"
                  type="text"
                  name="place"
                  placeholder="Place Name"
                  value={formData.place}
                  onChange={handleChange}
                  required
                />
                <input
                  className="form-control mb-3"
                  type="text"
                  name="description"
                  placeholder="Description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                />
                <select
                  className="form-control mb-3"
                  name="tripWith"
                  value={formData.tripWith}
                  onChange={handleChange}
                  required
                >
                  <option value="">Trip With</option>
                  {tripTypes.map((type, index) => (
                    <option key={index} value={type.toLowerCase()}>
                      {type}
                    </option>
                  ))}
                </select>
                <select
                  className="form-control mb-3"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((cat, index) => (
                    <option key={index} value={cat.toLowerCase()}>
                      {cat}
                    </option>
                  ))}
                </select>
                <input
                  className="form-control mb-3"
                  type="file"
                  accept="image/*"
                  onChange={handleMedia}
                  required={!isEditing}
                />
                {selectedFile && <p>Selected: {selectedFile}</p>}
                <input
                  className="form-control mb-3"
                  type="text"
                  name="latitude"
                  placeholder="Latitude"
                  value={formData.latitude}
                  onChange={handleChange}
                />
                <input
                  className="form-control mb-3"
                  type="text"
                  name="longitude"
                  placeholder="Longitude"
                  value={formData.longitude}
                  onChange={handleChange}
                />
                <div className="d-flex justify-content-between">
                  <button className="btn btn-primary w-25" type="submit">
                    {isEditing ? "Update" : "Add"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      <section className="container mt-5">
        <h2 className="text-center mb-4">Itineraries</h2>
        <table className="table table-success">
          <thead>
            <tr>
              <th>District</th>
              <th>Place</th>
              <th>Trip With</th>
              <th>Category</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {itineraries.map((itinerary) => (
              <tr key={itinerary.id}>
                <td>{itinerary.district}</td>
                <td>{itinerary.place}</td>
                <td>{itinerary.tripWith}</td>
                <td>{itinerary.category}</td>
                <td>
                  <button
                    className="btn btn-warning btn-sm me-2"
                    onClick={() => handleEdit(itinerary)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(itinerary.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <ToastContainer 
        position="top-right" 
        autoClose={3000} 
        hideProgressBar={false} 
        newestOnTop={false} 
        closeOnClick 
        rtl={false} 
        pauseOnFocusLoss 
        draggable 
        pauseOnHover 
      />
    </div>
  );
}

export default UpdItinerary;