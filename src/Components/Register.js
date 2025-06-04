import React, { useState,useEffect } from 'react';
import './AllCss/Register.css';
import video from './images/log.mp4';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [users, setusers] = useState([]);
  // const [message, setMessage] = useState('');
  useEffect(() => {
    axios
      .get("http://localhost:8080/all")
      .then((response) => setusers(response.data))
      .catch((error) => console.error("Error fetching districts:", error));
  }, []);

  const navigate = useNavigate();
  const handleRegister = async (event) => {
    event.preventDefault();

    if (!username || !password || !email) {
      toast.error('Fill in all the required information');
      return;
    } else if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }
    else if (users.find((user) => user.useremail === email)) {
      toast.warning('Username already exists with this email,Login to continue');
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/PostR", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          useremail: email,
          password: password,
        }),
      });

      if (response.ok) {
        toast.success("Registration successful");
        navigate("/Login");
      } else {
        toast.error("Failed to register. Please try again.");
      }
    } catch (error) {
      toast.error("Error during registration:", error);
      toast.error("An error occurred. Please try again later.");
    }
  };

  return (
    <div className="login-container">
      <video className="background-video" src={video} autoPlay loop muted></video>
      <div className="form-overlay">
        <h1>ℝ𝕖𝕘𝕚𝕤𝕥𝕖𝕣</h1>
        <form onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="btn btn-primary" type="submit">Register</button>
        </form>
        <p>Do you have an account? <span className='Rlink' onClick={() => navigate('/Login')}>Login</span></p>

      </div>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
    </div>
  );
}

export default Login;