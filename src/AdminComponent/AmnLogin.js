import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../Components/AllCss/AmnLogin.css'; 
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
function AmnLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();

    if (!username || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          password: password,
        }),
      });

      if (response.ok) {
        toast.success("Login successful");
        navigate("/admin");
      } else {
        toast.error("Invalid credentials. Please try again.");
      }
    } catch (error) {
      toast.error("Error during login:", error);
      toast.error("An error occurred. Please try again later.");
    }
  };

  return (
    <div className="container mx-auto my-5">
      <div className="row justify-content-center align-items-center ">
        <div className="col-md-6 col-lg-4">
          <div className="card shadow-lg">
            <div className="card-header bg-primary text-white text-center">
              <h3 className="mb-0">Admin Login</h3>
            </div>
            <div className="card-body p-4">
              <form onSubmit={handleLogin}>
                <div className="form-group mb-3">
                  <label htmlFor="UserEmail" className="form-label">Username</label>
                  <input
                    type="text"
                    className="form-control"
                    id="username"
                    placeholder="Enter Email"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
                <div className="form-group mb-4">
                  <label htmlFor="password" className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn btn-primary w-100">Login</button>
              </form>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />    </div>
  );
}

export default AmnLogin;