import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

function AdminProfile() {
  const [adminData, setAdminData] = useState([]); 
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/admin/getdata");
        const data = await response.json();

        if (Array.isArray(data) && data.length > 0) {
          setAdminData(data[0]); 
        } else {
          console.error("Invalid admin data format:", data);
        }
      } catch (error) {
        console.error("Error fetching admin data:", error);
      }
    };

    fetchAdminData();
  }, []);

  const handleLogout = () => {
    navigate("/AdminLogin");
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header">
              <h3 className="text-center">Admin Profile</h3>
            </div>
            <div className="card-body">
              {adminData.username ? (
                <div className="row">
                  <div className="col-md-4 text-center">
                    {/* Profile Image Placeholder */}
                    {/* <img
                      src={"https://via.placeholder.com/150"}
                      alt="Profile"
                      className="img-fluid rounded-circle"
                      style={{ width: "150px", height: "150px" }}
                    /> */}
                  </div>
                  <div className="col-md-8">
                    <p><strong>Email:</strong> {adminData.username}</p>
                    <p><strong>Password:</strong> {adminData.password}</p>
                    <button className="btn btn-danger mt-3" onClick={handleLogout}>
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-center">Loading admin details...</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminProfile;
