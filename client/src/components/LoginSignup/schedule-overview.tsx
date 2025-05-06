"use client";
import React, { useState, useEffect } from "react";
import { ClipboardList, Clock, BookOpen, ChevronLeft, ChevronRight } from "lucide-react";
import { io } from "socket.io-client";
import "./schedule-overview.css";

interface Assignment {
  subject: string;
  title: string;
  due: string;
  timeLeft: string;
  reason: string; // Add reason to the assignment interface
}

interface ScheduledAssignment {
  _id: string;
  assignment_id: string;
  title: string;
  start_date: string;
  predicted_days: number;
  reason: string;
  created_at: string;
}

const subjectTypes = ["math", "science", "english", "history"];

export default function ScheduleOverview() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false); // Modal state
  const [modalContent, setModalContent] = useState<string>(""); // Modal content
  const assignmentsPerPage = 3;

  const openModal = (reason: string) => {
    setModalContent(reason || "No reason provided."); // Set modal content
    setIsModalOpen(true); // Open modal
  };

  const closeModal = () => {
    setIsModalOpen(false); // Close modal
    setModalContent(""); // Clear modal content
  };

  const convertToAssignment = (scheduledAssignment: ScheduledAssignment): Assignment => {
    const startDate = new Date(scheduledAssignment.start_date);
    const now = new Date();
    const daysLeft = Math.ceil((startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const timeLeft = `${daysLeft} days`;

    const dueDate = startDate.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
    });

    const subject = scheduledAssignment.title.charAt(0).toUpperCase() + scheduledAssignment.title.slice(1);

    return {
      title: subject,
      subject: subject,
      due: dueDate,
      timeLeft: timeLeft,
      reason: scheduledAssignment.reason || "No reason provided.", // Add reason
    };
  };

  useEffect(() => {
    const socket = io("http://localhost:3002");

    socket.emit("getInitialAssignments");

    socket.on("initialAssignments", (data: ScheduledAssignment[]) => {
      const formattedAssignments = data.map((item) => convertToAssignment(item));
      setAssignments(formattedAssignments);
      setLoading(false);
    });

    socket.on("newEvent", (event) => {
      const newAssignment: Assignment = {
        title: event.title.charAt(0).toUpperCase() + event.title.slice(1),
        subject: event.title.charAt(0).toUpperCase() + event.title.slice(1),
        due: new Date(event.start).toLocaleDateString("en-US", { month: "long", day: "numeric" }),
        timeLeft: calculateTimeLeft(event.start),
        reason: event.reason || "No reason provided.", // Add reason
      };

      setAssignments((prev) => [newAssignment, ...prev]);
    });

    setTimeout(() => {
      if (loading) {
        setLoading(false);
      }
    }, 5000);

    return () => {
      socket.disconnect();
    };
  }, [loading]);

  const calculateTimeLeft = (dateStr: string): string => {
    const date = new Date(dateStr);
    const now = new Date();
    const daysLeft = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return `${daysLeft} days`;
  };

  const getTimeLeftClass = (timeLeft: string) => {
    const days = Number.parseInt(timeLeft.split(" ")[0]);
    if (days <= 2) return "status-urgent";
    if (days <= 5) return "status-upcoming";
    return "status-future";
  };

  const createPlaceholderAssignments = () => {
    return Array.from({ length: 3 }, (_, i) => {
      const subject = subjectTypes[i % subjectTypes.length];
      const daysLeft = [1, 4, 7][i];
      return {
        subject: subject.charAt(0).toUpperCase() + subject.slice(1),
        title: loading ? "Loading..." : `No assignment`,
        due: loading ? "..." : `April ${10 + i}`,
        timeLeft: `${daysLeft} days`,
        reason: "No reason provided.", // Placeholder reason
      };
    });
  };

  const nextPage = () => {
    if ((currentPage + 1) * assignmentsPerPage < assignments.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const placeholderAssignments = createPlaceholderAssignments();

  let displayAssignments;
  if (loading) {
    displayAssignments = placeholderAssignments;
  } else if (assignments.length === 0) {
    displayAssignments = placeholderAssignments;
  } else {
    const startIndex = currentPage * assignmentsPerPage;
    const endIndex = startIndex + assignmentsPerPage;
    const currentAssignments = assignments.slice(startIndex, endIndex);

    if (currentAssignments.length < assignmentsPerPage) {
      displayAssignments = [
        ...currentAssignments,
        ...placeholderAssignments.slice(0, assignmentsPerPage - currentAssignments.length),
      ];
    } else {
      displayAssignments = currentAssignments;
    }
  }

  const showNavigation = assignments.length > assignmentsPerPage;
  const canGoNext = !loading && (currentPage + 1) * assignmentsPerPage < assignments.length;
  const canGoPrev = !loading && currentPage > 0;

  return (
    <div className="schedule-overview-container">
      <div className="schedule-header">
        <ClipboardList className="schedule-icon" />
        <h3 className="schedule-title">Schedule Overview</h3>

        {showNavigation && (
          <div className="navigation-controls">
            <button
              className={`nav-button ${!canGoPrev ? "nav-button-disabled" : ""}`}
              onClick={prevPage}
              disabled={!canGoPrev}
              aria-label="Previous assignments"
            >
              <ChevronLeft className="nav-icon" size={20} strokeWidth={2.5} />
            </button>
            <button
              className={`nav-button ${!canGoNext ? "nav-button-disabled" : ""}`}
              onClick={nextPage}
              disabled={!canGoNext}
              aria-label="Next assignments"
            >
              <ChevronRight className="nav-icon" size={20} strokeWidth={2.5} />
            </button>
          </div>
        )}
      </div>

      <div className="assignment-carousel">
        {displayAssignments.map((assignment, index) => (
          <div key={index} className="assignment-card">
            {assignment.title !== "No assignment" ? (
              <>
                <div className="assignment-icon-container">
                  <BookOpen className="assignment-icon" />
                </div>
                <div className="assignment-content">
                  <h4 className="assignment-title">{assignment.title}</h4>
                  <span className={`subject-badge subject-${assignment.subject.toLowerCase()}`}>
                    {assignment.subject}
                  </span>
                </div>
                <div className="assignment-due">
                  <span className={`time-left ${getTimeLeftClass(assignment.timeLeft)}`}>
                    {assignment.timeLeft}
                  </span>
                  <div className="due-date">
                    <Clock className="clock-icon" />
                    <span>{assignment.due}</span>
                  </div>
                </div>
                <button className="reason-button" onClick={() => openModal(assignment.reason)}>
                  Reason
                </button>
              </>
            ) : (
              <h4 className="no-assignment">No Assignments</h4>
            )}
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="close-button" onClick={closeModal}>
              &times;
            </button>
            <h3>Reason</h3>
            <p>{modalContent}</p>
          </div>
        </div>
      )}
    </div>
  );
}