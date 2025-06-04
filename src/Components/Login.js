import React, { useState, useContext } from 'react';
import './AllCss/Login.css';
import video from './images/log.mp4';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; 
import { UserContext } from '../App';

function Login() {
  const { setUser } = useContext(UserContext);

  const [useremail, setUsername] = useState('');
  const [password, setPassword] = useState('');
  // const [message, setMessage] = useState('');

  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();

    if (!useremail || !password) {
      toast.error('Fill in all the required information');
      return;
    } else if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/ulogin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          useremail: useremail,
          password: password,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data);
        toast.success("Login successful");
        setTimeout(() => navigate("/main"), 1000); 
      } else {
        toast.error("Failed to login. Please try again.");
      }
    } catch (error) {
      console.error("Error during login:", error);
      toast.error("An error occurred. Please try again later.");
    }
  };

  return (
    <div className="login-container">
      <video className="background-video" src={video} autoPlay loop muted></video>
      <div className="form-overlay">
        <h1>𝕃𝕠𝕘𝕀𝕟</h1>
        <input
          type="email"
          placeholder="Username"
          value={useremail}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className='btn btn-primary' onClick={handleLogin}>Login</button>
        <p>Don't have an account? <a href='Register' className="Rlink" onClick={() => navigate('/Register')}>Register</a></p>
      </div>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
    </div>
  );
}

export default Login;