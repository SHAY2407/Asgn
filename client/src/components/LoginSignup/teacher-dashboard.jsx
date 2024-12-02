import React, { useEffect } from 'react';
import './teacher-dashboard.css';
import { CiCalendar, CiSettings, CiLogout } from "react-icons/ci";
import { PiNotebookLight, PiStudent, PiExam } from "react-icons/pi";
import { Link } from 'react-router-dom';


function Teacher() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/fullcalendar@6.1.15/index.global.min.js';
    script.async = true;
    script.onload = () => {
      const calendarEl = document.getElementById('calendar');
      if (calendarEl) {
        const calendar = new FullCalendar.Calendar(calendarEl, {
          initialView: 'dayGridMonth',
          events: [
            {
              title: 'Assignment 1',
              start: '2024-08-22',
              end: '2024-08-27',
            },
          ],
        });
        calendar.render();
      }
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="teacher-dashboard">
      {/* Navigation Menu */}
      <div className="navigation-menu">
        <div className="profile-section">
          <h1>Asgn.</h1>
        </div>
        <ul>
          <li>
            <CiCalendar className="nav-icon" /> Calendar
          </li>
          <li>
            <Link to="/assignment" className="nav-link">
              <PiNotebookLight className="nav-icon" /> Assignment
            </Link>
          </li>
          <li>
            <PiStudent className="nav-icon" /> Students
          </li>
          <li>
            <PiExam className="nav-icon" /> Grading
          </li>
        </ul>

        {/* Settings and Logout Options */}
        <div className="bottom-options">
          <ul>
            <li>
              <CiSettings className="nav-icon" /> Settings
            </li>
            <li>
              <CiLogout className="nav-icon" /> Logout
            </li>
          </ul>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Calendar */}
        <div id="calendar" className="calendar-container"></div>
        {/* Event List */}
        <div className="event-list">
          <div className="event">
            <h4>22-26 AUGUST: ASSIGNMENT 1</h4>
            <p>Thursday, 22 August, 2024 - Monday, 26 August, 2024</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Teacher;
