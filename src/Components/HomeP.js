import { useNavigate } from "react-router-dom";
import Homep from "./images/Homep.jpg";
import "./AllCss/Homep.css";
import { motion } from "framer-motion";

function HomeP() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <div className="home-image-container">
        <img src={Homep} alt="Home Page" className="home-image" />
      </div>
      <section className="home-content">
        <motion.h1 
          initial={{ opacity: 0, y: -50 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 1 }}
        >
          Welcome to the Travel Planner
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ delay: 0.5, duration: 1 }}
        >
          Plan your trips effortlessly with our smart itinerary generator
        </motion.p>
        <div className="home-buttons">
          <div className="dropdown">
            <button className="dropbtn">Login</button>
            <div className="dropdown-content">
              <button onClick={() => navigate("/Login")}>User Login</button>
              <button onClick={() => navigate("/AdminLogin")}>Admin Login</button>
            </div>
          </div>
          <button onClick={() => navigate("/Register")}>Register</button>
        </div>
      </section>
    </div>
  );
}

export default HomeP;
 