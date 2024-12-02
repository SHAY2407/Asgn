import React, { useState } from 'react';
import './generate-assignment.css';
import { CiCalendar, CiSettings, CiLogout } from "react-icons/ci";
import { PiNotebookLight, PiStudent, PiExam } from "react-icons/pi";
import { Save } from 'lucide-react';
import { Card, CardContent, Typography, Slider, Button, TextField, Select, MenuItem, InputLabel, FormControl } from '@mui/material';
import { Link } from 'react-router-dom';

const Assignment = () => {
  const initialFormState = {
    name: '',
    questionTypes: [],
    difficulty: 3,
    questionCount: 0,
    dueDate: '',
    context: '',
  };

  const [formData, setFormData] = useState(initialFormState);
  const [pdfFile, setPdfFile] = useState(null);
  const [predictedDays, setPredictedDays] = useState(null); 

  // Function to fetch predicted days from the backend
  const fetchPredictedDays = async () => {
    try {
      const response = await fetch('http://localhost:5000/predict_assignment_days');
      const data = await response.json();
      if (response.ok) {
        console.log('Predicted Days:', data.predicted_days); 
        setPredictedDays(data.predicted_days);  // Set the predicted days state
      } else {
        console.error('Failed to fetch predicted days:', data.error);
      }
    } catch (error) {
      console.error('Error fetching predicted days:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleQuestionTypeChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      questionTypes: e.target.value,
    }));
  };

  const handleSliderChange = (e, value) => {
    setFormData((prevState) => ({
      ...prevState,
      difficulty: value,
    }));
  };

  const handleFileChange = (e) => {
    setPdfFile(e.target.files[0]);
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setPdfFile(null);
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleSaveAssignment = async (e) => {
    e.preventDefault();

    const formDataToSend = new FormData();
    Object.keys(formData).forEach(key => {
      formDataToSend.append(key, formData[key]);
    });

    if (pdfFile) {
      formDataToSend.append('pdf', pdfFile);
    }

    try {
      const response = await fetch('http://localhost:3001/assignment', {
        method: 'POST',
        body: formDataToSend,
      });

      if (response.ok) {
        alert('Assignment saved successfully!');
        resetForm();
        // Fetch predicted days after saving assignment
        await fetchPredictedDays();  // Trigger the API call to get predicted days after save
      } else {
        alert('Failed to save assignment');
      }
    } catch (error) {
      console.error('Error saving assignment:', error);
      alert('Error saving assignment');
    }
  };

  const handleMakeAssignment = async () => {
    const eventDetails = {
      title: formData.name,
      start: new Date().toISOString().slice(0, 10),
      end: new Date(new Date().setDate(new Date().getDate() + predictedDays)).toISOString().slice(0, 10),
    };

    try {
      const response = await fetch('http://localhost:3001/teacher-dashboard/add-event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventDetails),
      });

      if (response.ok) {
        alert('Assignment added to calendar!');
      } else {
        console.error('Failed to add event to calendar');
      }
    } catch (error) {
      console.error('Error adding event to calendar:', error);
    }
  };

  return (
    <div className="container">
      <div className="navigation-menu">
        <div className="profile-section">
          <h1>Asgn.</h1>
        </div>
        <ul>
          <li>
            <Link to="/teacher-dashboard" className="nav-link">
              <CiCalendar className="nav-icon" /> Calendar
            </Link>
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

      <div className="main-content">
        <div className="form-section">
          <Card className="card">
            <CardContent>
              <form onSubmit={handleSaveAssignment}>
                <div className="form-group">
                  <TextField
                    id="name"
                    label="Assignment Name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter assignment name"
                    fullWidth
                    margin="normal"
                  />
                </div>

                <div className="form-group">
                  <FormControl fullWidth margin="normal">
                    <InputLabel id="questionTypes-label">Question Types</InputLabel>
                    <Select
                      labelId="questionTypes-label"
                      id="questionTypes"
                      name="questionTypes"
                      multiple
                      value={formData.questionTypes}
                      onChange={handleQuestionTypeChange}
                    >
                      <MenuItem value="multipleChoice">Multiple Choice</MenuItem>
                      <MenuItem value="shortAnswer">Short Answer</MenuItem>
                      <MenuItem value="longAnswer">Long Answer</MenuItem>
                      <MenuItem value="trueFalse">True/False</MenuItem>
                      <MenuItem value="codingProblem">Coding Problem</MenuItem>
                      <MenuItem value="essay">Essay</MenuItem>
                    </Select>
                  </FormControl>
                </div>

                <div className="form-group">
                  <Typography gutterBottom>Assignment Difficulty</Typography>
                  <Slider
                    id="difficulty"
                    min={1}
                    max={5}
                    step={1}
                    value={formData.difficulty}
                    onChange={handleSliderChange}
                    marks
                    valueLabelDisplay="auto"
                  />
                </div>

                <div className="form-group">
                  <TextField
                    id="questionCount"
                    name="questionCount"
                    type="number"
                    label="Number of Questions"
                    value={formData.questionCount}
                    onChange={handleInputChange}
                    InputProps={{ inputProps: { min: 0 } }}
                    fullWidth
                    margin="normal"
                  />
                </div>

                <div className="form-group">
                  <TextField
                    id="dueDate"
                    name="dueDate"
                    type="date"
                    label="Due Date (Optional)"
                    value={formData.dueDate}
                    onChange={handleInputChange}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                    margin="normal"
                  />
                </div>

                <div className="form-group">
                  <TextField
                    id="context"
                    name="context"
                    label="Assignment Context or Instructions"
                    value={formData.context}
                    onChange={handleInputChange}
                    placeholder="Enter assignment context or instructions..."
                    multiline
                    rows={4}
                    fullWidth
                    margin="normal"
                  />
                </div>

                <div className="form-group">
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                  />
                </div>

                <div className="button-group">
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<Save />}
                    className="button"
                  >
                    Save Assignment
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="predicted-days-section">
          <Card className="predicted-days-card">
            <CardContent>
            <Typography variant="h6">Predicted Days for Completion:</Typography>
              {predictedDays !== null ? (
                <>
                  <Typography variant="h4">{predictedDays.toFixed(2)} days</Typography>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={handleMakeAssignment}
                  >
                    Make Assignment
                  </Button>
                </>
              ) : (
                <Typography variant="body1">Click "Save Assignment" to fetch predicted days...</Typography>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Assignment;
