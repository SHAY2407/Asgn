import React, { useEffect } from 'react';
import './teacher-dashboard.css';
import { CiCalendar, CiSettings, CiLogout } from "react-icons/ci";
import { PiNotebookLight, PiStudent, PiExam } from "react-icons/pi";
import { AlertTriangle, TrendingUp, Calendar, Clock, Brain } from 'lucide-react';
import { Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import AssignmentDNA from './assignment-dna';
import ScheduleOverview from './schedule-overview';

function Teacher() {
  const socket = io("http://localhost:3002");

  socket.on("connect", () => {
    console.log("Connected to backend change stream.");
  });

  
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/fullcalendar@6.1.15/index.global.min.js';
    script.async = true;

    script.onload = () => {
      const calendarEl = document.getElementById('calendar');
      if (calendarEl) {
        const calendar = new FullCalendar.Calendar(calendarEl, {
          initialView: 'dayGridMonth',
          events: [], // Start with an empty events array
        });

        // Fetch events from the events.json file
        fetch('/events.json')
          .then(response => response.json())
          .then(data => {
            calendar.addEventSource(data);
            calendar.render();
          })
          .catch(error => console.error("Error loading events:", error));
      }
    };

    document.body.appendChild(script);

    socket.on("newEvent", (event) => {
      if (calendar) {
        calendar.addEvent(event);
      } else {
        console.warn("Calendar is not initialized yet.");
      }
    });

    return () => {
      document.body.removeChild(script);
      socket.disconnect();
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
        <div><div id="calendar" className="calendar-container">
          {/* Schedule overview should render below calendar*/}
          
        </div><ScheduleOverview /></div>
        

        
        <div className="info-card">
          <div className="card-header">
            <Brain className="header-icon" />
            <div>
              <h2>AI-Powered Insights</h2>
              <p>Real-time analytics and predictions</p>
            </div>
          </div>
          
          <div className="insights-container">
            <div className="insight-item">
              <AlertTriangle className="insight-icon warning" />
              <div className="insight-content">
                <span className="insight-title">Burnout Risk Alert</span>
                <span className="insight-value">3 students at risk</span>
              </div>
            </div>

            <div className="insight-item">
              <TrendingUp className="insight-icon success" />
              <div className="insight-content">
                <span className="insight-title">Grade Trends</span>
                <span className="insight-value">7 students changed</span>
              </div>
            </div>

            <div className="insight-item">
              <Calendar className="insight-icon info" />
              <div className="insight-content">
                <span className="insight-title">Workload Heatmap</span>
                <span className="insight-value">Past 7 days</span>
              </div>
            </div>

            <div className="insight-item">
              <Clock className="insight-icon purple" />
              <div className="insight-content">
                <span className="insight-title">Deadline Optimizer</span>
                <span className="insight-value">1 suggestion</span>
              </div>
            </div>
          </div>
          <AssignmentDNA />
        </div>

      </div>
    </div>
  );
}

export default Teacher;

