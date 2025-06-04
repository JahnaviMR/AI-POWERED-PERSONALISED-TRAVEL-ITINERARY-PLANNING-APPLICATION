import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaClipboardList } from "react-icons/fa";
import { BsPersonCircle } from "react-icons/bs";
import { MdLogout } from "react-icons/md";
import { IoIosSave } from "react-icons/io";

function Main() {



  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <div className="container-fluid">
          <Link className="navbar-brand text-dark" to="/Main">Itinerary App</Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              {/* <li className="nav-item">
                <Link className="nav-link" to="/"><FaHome/> Home</Link>
              </li> */}
              <li className="nav-item">
                <Link className="nav-link text-dark " to="ItineraryDisplay"><FaClipboardList /> Itinerary</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link text-dark" to="Profile"><BsPersonCircle/> Profile</Link>
              </li>
              <li className="nav-item">
              <Link to="my-itineraries"className="nav-link text-dark" >
              <IoIosSave/> My Itineraries
              </Link></li>

              <li className="nav-item">
                <Link className="nav-link text-dark" to="/"><MdLogout /> LogOut</Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <Outlet />


    </div>
  );
}

export default Main;
