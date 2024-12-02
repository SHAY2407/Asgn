import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './teacher-dashboard.css'

const getDateIndex = (date, currentDate) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const targetDate = new Date(date);
  if (targetDate.getMonth() !== month || targetDate.getFullYear() !== year) {
    return null; // Date is outside the current month
  }

  return firstDayOfMonth + targetDate.getDate() - 1;
};

const AssignmentLine = ({ startDate, endDate, currentDate }) => {
  const startIndex = getDateIndex(startDate, currentDate);
  const endIndex = getDateIndex(endDate, currentDate);

  if (startIndex === null || endIndex === null) return null;

  const gridColumns = 7;
  const startRow = Math.floor(startIndex / gridColumns);
  const startColumn = startIndex % gridColumns;
  const endRow = Math.floor(endIndex / gridColumns);
  const endColumn = endIndex % gridColumns;

  const lines = [];
  
  // Same row case
  if (startRow === endRow) {
    const leftPosition = `${(startColumn / gridColumns) * 100}%`;
    const width = `${((endColumn - startColumn + 1) / gridColumns) * 100}%`;

    lines.push(
      <div
        key={`${startDate}-${endDate}-line`}
        className="absolute bg-red-500 h-1 rounded"
        style={{
          top: `${startRow * 6}rem`,
          left: leftPosition,
          width: width,
        }}
      />
    );
  } else {
    // Multi-row case
    for (let row = startRow; row <= endRow; row++) {
      let leftPosition = "0%";
      let width = "100%";
      
      // Adjust the start of the line for the first row
      if (row === startRow) {
        leftPosition = `${(startColumn / gridColumns) * 100}%`;
        width = `${((gridColumns - startColumn) / gridColumns) * 100}%`;
      }
      
      // Adjust the end of the line for the last row
      if (row === endRow) {
        width = `${((endColumn + 1) / gridColumns) * 100}%`;
      }

      lines.push(
        <div
          key={`${startDate}-${endDate}-line-${row}`}
          className="absolute bg-red-500 h-1 rounded"
          style={{
            top: `${row * 6}rem`,
            left: leftPosition,
            width: width,
          }}
        />
      );
    }
  }

  return <>{lines}</>;
};

const ModernSeamlessCalendar = ({ assignments }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  return (
    <div className="bg-gray-900 rounded-3xl shadow-xl p-8 relative">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-100">
          {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h2>
        <div className="flex space-x-4">
          <button onClick={prevMonth} className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-100 transition-colors">
            <ChevronLeft size={24} />
          </button>
          <button onClick={nextMonth} className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-100 transition-colors">
            <ChevronRight size={24} />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-x-1 gap-y-2 relative">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center font-medium text-gray-400 pb-2">{day}</div>
        ))}
        {Array.from({ length: 42 }).map((_, index) => {
          const day = index - firstDayOfMonth + 1;
          return (
            <div key={index} className="h-24 relative border-b border-gray-800">
              {day > 0 && day <= daysInMonth && (
                <div className="absolute top-1 left-1 font-medium text-gray-400">{day}</div>
              )}
            </div>
          );
        })}

        {/* Render assignment lines dynamically based on assignment dates */}
        {assignments.map((assignment, index) => (
          <AssignmentLine
            key={index}
            startDate={assignment.startDate}
            endDate={assignment.endDate}
            currentDate={currentDate}
          />
        ))}
      </div>
    </div>
  );
};

export default function ModernAssignmentPage() {
  // Example assignments with start and end dates
  const assignments = [
    { startDate: '2024-08-03', endDate: '2024-08-09' },
    { startDate: '2024-08-14', endDate: '2024-08-17' }
  ];

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100">
      {/* Sidebar */}
      <div className="w-20 bg-gray-800 shadow-lg flex flex-col items-center py-8">
        {/* Sidebar content here */}
      </div>

      {/* Main content */}
      <div className="flex-1 p-12 overflow-auto">
        <h1 className="text-4xl font-bold mb-8 text-gray-100">Assignments Calendar</h1>
        <ModernSeamlessCalendar assignments={assignments} />
      </div>
    </div>
  );
}


====================================================
/* Container Styles */
.bg-gray-900 {
    background-color: #1f2937;
  }
  
  .bg-gray-800 {
    background-color: #374151;
  }
  
  .text-gray-100 {
    color: #f3f4f6;
  }
  
  .text-gray-400 {
    color: #9ca3af;
  }
  
  .text-gray-200 {
    color: #e5e7eb;
  }
  
  .font-bold {
    font-weight: 700;
  }
  
  .font-medium {
    font-weight: 500;
  }
  
  .shadow-xl {
    box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
  }
  
  .shadow-lg {
    box-shadow: 0 8px 10px rgba(0, 0, 0, 0.1);
  }
  
  .rounded-3xl {
    border-radius: 1.5rem;
  }
  
  .rounded-full {
    border-radius: 9999px;
  }
  
  .p-8 {
    padding: 2rem;
  }
  
  .p-12 {
    padding: 3rem;
  }
  
  .p-2 {
    padding: 0.5rem;
  }
  
  /* Flexbox & Grid Layout */
  .flex {
    display: flex;
  }
  
  .flex-col {
    flex-direction: column;
  }
  
  .flex-1 {
    flex: 1;
  }
  
  .justify-between {
    justify-content: space-between;
  }
  
  .items-center {
    align-items: center;
  }
  
  .space-x-4 > * + * {
    margin-left: 1rem;
  }
  
  .grid {
    display: grid;
  }
  
  .grid-cols-7 {
    grid-template-columns: repeat(7, minmax(0, 1fr));
  }
  
  .gap-x-1 {
    column-gap: 0.25rem;
  }
  
  .gap-y-2 {
    row-gap: 0.5rem;
  }
  
  /* Button & Transition Styles */
  button {
    cursor: pointer;
    border: none;
    background: none;
  }
  
  .bg-gray-700:hover {
    background-color: #4b5563;
  }
  
  .bg-gray-800:hover {
    background-color: #1f2937;
  }
  
  .transition-colors {
    transition: background-color 0.2s ease-in-out;
  }
  
  /* Calendar Cell Styles */
  .relative {
    position: relative;
  }
  
  .h-24 {
    height: 6rem;
  }
  
  .border-b {
    border-bottom-width: 1px;
  }
  
  .border-gray-800 {
    border-color: #1f2937;
  }
  
  .absolute {
    position: absolute;
  }
  
  .top-1 {
    top: 0.25rem;
  }
  
  .left-1 {
    left: 0.25rem;
  }
  
  /* Assignment Indicator Styles */
  .assignment-indicator .absolute {
    position: absolute;
  }
  
  .bg-red-500 {
    background-color: #f87171;
  }
  
  .h-[2px] {
    height: 2px;
  }
  
  .rounded-full {
    border-radius: 9999px;
  }
  
  .text-sm {
    font-size: 0.875rem;
  }
  
  /* Calendar Heading Styles */
  .text-3xl {
    font-size: 1.875rem;
  }
  
  .text-4xl {
    font-size: 2.25rem;
  }
  
  .mb-8 {
    margin-bottom: 2rem;
  }
  
  .pb-2 {
    padding-bottom: 0.5rem;
  }
  
  .h-screen {
    height: 100vh;
  }
  
  .w-20 {
    width: 5rem;
  }
  
  /* Sidebar Styles */
  .overflow-auto {
    overflow: auto;
  }
  
  .sidebar {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 2rem 0;
  }
  
  .sidebar-item {
    padding: 1rem;
    width: 100%;
    text-align: center;
    color: #f3f4f6;
    cursor: pointer;
  }
  
  .sidebar-item:hover {
    background-color: #374151;
  }
  
  /* Chevron Icons */
  button svg {
    color: #f3f4f6;
    width: 1.5rem;
    height: 1.5rem;
  }
  /* Assignment Line Styles */
  .h-1 {
    height: 0.25rem;
  }
  
  .bg-red-500 {
    background-color: #f87171;
  }
  
  .rounded {
    border-radius: 0.25rem;
  }
  
  /* Other styles are already provided in the previous CSS */
  