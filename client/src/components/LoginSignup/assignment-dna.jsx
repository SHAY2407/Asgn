"use client"
import React from "react";
import { Info, Dna, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import "./assignment-dna.css";

function CircularProgress({ value, className }) {
  return (
    <div className={`circular-progress ${className || ''}`}>
      <svg viewBox="0 0 36 36">
        <path className="circle-bg" d="M18 2a16 16 0 1 1 0 32 16 16 0 1 1 0-32" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray="100,100" />
        <path
          className="circle-progress"
          d="M18 2a16 16 0 1 1 0 32 16 16 0 1 1 0-32"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeDasharray={`${value},100`}
          strokeLinecap="round"
        />
      </svg>
      <span className="progress-value">{value}%</span>
    </div>
  );
}

export default function AssignmentDNA() {
  const skills = [
    { name: "Critical Thinking", coverage: 85, performance: 72, trend: "increasing", weight: 5 },
    { name: "Problem Solving", coverage: 60, performance: 68, trend: "stable", weight: 4 },
    { name: "Data Analysis", coverage: 35, performance: 55, trend: "decreasing", weight: 3 },
    { name: "Communication", coverage: 90, performance: 82, trend: "increasing", weight: 4 },
    { name: "Research Methods", coverage: 25, performance: 40, trend: "stable", weight: 2 },
  ];

  const getTrendIcon = (trend) => {
    switch (trend) {
      case "increasing": return <TrendingUp className="trend-icon trend-up" />;
      case "decreasing": return <TrendingDown className="trend-icon trend-down" />;
      default: return <Minus className="trend-icon trend-stable" />;
    }
  };

  return (
    <div className="assignment-dna">
      <div className="dna-header">
        <div className="header-title">
          <Dna className="dna-icon" />
          <h2>Assignment DNA</h2>
        </div>
      </div>
      
      <div className="collapsed-content">
        <div className="stats-container">
          <div className="stat-box">
            <p className="stat-label">Total Skills</p>
            <p className="stat-value">5</p>
          </div>
          <div className="stat-box">
            <p className="stat-label">Need Attention</p>
            <p className="stat-value attention">2</p>
          </div>
        </div>
        
        <div className="info-alert">
          <Info className="info-icon" />
          <p>Increase data analysis activities - currently under-assessed by 65%</p>
        </div>
        
        <div className="skills-grid">
          {skills.map((skill, idx) => (
            <div key={idx} className="skill-card">
              <CircularProgress value={skill.coverage} className={skill.coverage < 50 ? "low" : skill.coverage < 75 ? "medium" : "high"} />
              <div className="skill-info">
                <p className="skill-name">{skill.name}</p>
                <p className="skill-stat">Performance: {skill.performance}%</p>
                <p className="skill-stat">Weight: {skill.weight}</p>
              </div>
              <div className="trend-container">{getTrendIcon(skill.trend)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
