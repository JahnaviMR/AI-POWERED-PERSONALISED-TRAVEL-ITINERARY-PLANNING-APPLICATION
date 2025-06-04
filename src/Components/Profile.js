import React, {  useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { UserContext } from '../App';

function Profile() {
  const navigate = useNavigate();
  const { user } = useContext(UserContext); 

  // useEffect(() => {
  //   const fetchAdminData = async () => {
  //     try {
  //       const response = await fetch("http://localhost:8080/admin/profile");
  //       if (!response.ok) {
  //         throw new Error("Failed to fetch data");
  //       }
  //       const data = await response.json();
  //       setAdminData(data);
  //     } catch (error) {
  //       console.error("Error fetching admin data:", error);
  //     }
  //   };

  //   fetchAdminData();
  // }, []);

  const handleLogout = () => {
    navigate("/");
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center  mx-auto">
        <div className="col-md-8">
          <div className="card w-50">
            <div className="card-header">
              <h3 className="text-center">User Profile</h3>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-4">

                </div>

                <div className="col-md-8">
                  {user ? ( 
                    <>
                      <p><strong>Username:</strong> {user.username}</p>
                      <p><strong>Email:</strong> {user.useremail}</p>
                      <p><strong>Password:</strong> {user.password}</p>
                      <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
                    </>
                  ) : (
                    <p>Loading user data...</p>
                  )}
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
