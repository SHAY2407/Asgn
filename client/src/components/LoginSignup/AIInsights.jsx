"use client"

import * as React from 'react'

// Icons
const Brain = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/></svg>
)

const AlertTriangle = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
)

const TrendingUp = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
)

const TrendingDown = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>
)

const Calendar = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
)

const Clock = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
)

// UI Components
const Button = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 ${className}`}
      ref={ref}
      {...props}
    />
  )
})
Button.displayName = "Button"

const Card = ({ className, ...props }) => (
  <div className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`} {...props} />
)

const CardHeader = ({ className, ...props }) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className}`} {...props} />
)

const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h3 ref={ref} className={`text-2xl font-semibold leading-none tracking-tight ${className}`} {...props} />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p ref={ref} className={`text-sm text-muted-foreground ${className}`} {...props} />
))
CardDescription.displayName = "CardDescription"

const CardContent = ({ className, ...props }) => (
  <div className={`p-6 pt-0 ${className}`} {...props} />
)

// Chart Components
const ChartContainer = ({ children, className, ...props }) => (
  <div className={`w-full h-[200px] ${className}`} {...props}>
    {children}
  </div>
)

const LineChart = ({ data }) => {
  const maxWorkload = Math.max(...data.map(d => d.workload))
  
  return (
    <svg viewBox="0 0 300 100" className="w-full h-full">
      {data.map((d, i) => (
        <React.Fragment key={d.day}>
          <line
            x1={i * 50}
            y1={100 - (data[i].workload / maxWorkload) * 80}
            x2={(i + 1) * 50}
            y2={100 - (data[i + 1]?.workload / maxWorkload * 80 || 0)}
            stroke="currentColor"
            strokeWidth="2"
          />
          <circle
            cx={i * 50}
            cy={100 - (d.workload / maxWorkload) * 80}
            r="4"
            fill="currentColor"
          />
          <text x={i * 50} y="100" textAnchor="middle" className="text-xs">{d.day}</text>
        </React.Fragment>
      ))}
    </svg>
  )
}

const workloadData = [
  { day: 'Mon', workload: 3 },
  { day: 'Tue', workload: 5 },
  { day: 'Wed', workload: 2 },
  { day: 'Thu', workload: 7 },
  { day: 'Fri', workload: 4 },
  { day: 'Sat', workload: 1 },
  { day: 'Sun', workload: 0 },
]

function BurnoutWarning() {
  const handleViewStudents = () => {
    console.log("Viewing students at risk of burnout")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-500" />
          Burnout Warning
        </CardTitle>
        <CardDescription>Students at risk of burnout</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-2xl font-bold">⚠️ 3 students at risk of burnout.</div>
        <Button onClick={handleViewStudents}>View Students</Button>
      </CardContent>
    </Card>
  )
}

function GradeTrends() {
  const handleDetailedTrends = () => {
    console.log("Viewing detailed grade trends")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-green-500" />
          Grade Trends
        </CardTitle>
        <CardDescription>Recent changes in student performance</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span className="text-lg">5 students are improving</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-red-500" />
            <span className="text-lg">2 students are declining</span>
          </div>
        </div>
        <Button onClick={handleDetailedTrends}>Detailed Trends</Button>
      </CardContent>
    </Card>
  )
}

function WorkloadHeatmap() {
  const handleAdjustDeadlines = () => {
    console.log("Adjusting deadlines")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-500" />
          Workload Heatmap
        </CardTitle>
        <CardDescription>Student workload over the past 7 days</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ChartContainer>
          <LineChart data={workloadData} />
        </ChartContainer>
        <Button onClick={handleAdjustDeadlines}>Adjust Deadlines</Button>
      </CardContent>
    </Card>
  )
}

function DeadlineOptimizer() {
  const handleApplyToCalendar = () => {
    console.log("Applying suggested deadline to calendar")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-purple-500" />
          Deadline Optimizer
        </CardTitle>
        <CardDescription>AI-suggested deadline adjustments</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-lg">
          🗓️ Suggested Deadline: Thursday for Assignment 3 (based on past trends).
        </div>
        <Button onClick={handleApplyToCalendar}>Apply to Calendar</Button>
      </CardContent>
    </Card>
  )
}

export function AIInsightsPanel() {
  const [selectedInsight, setSelectedInsight] = React.useState(null)

  const renderInsightDetails = () => {
    switch (selectedInsight) {
      case 'burnout':
        return <BurnoutWarning />
      case 'grades':
        return <GradeTrends />
      case 'workload':
        return <WorkloadHeatmap />
      case 'deadline':
        return <DeadlineOptimizer />
      default:
        return null
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          AI-Powered Insights
        </CardTitle>
        <CardDescription>Real-time analytics and predictions</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {selectedInsight ? (
          <div className="space-y-4">
            <Button onClick={() => setSelectedInsight(null)}>
              Back to Insights
            </Button>
            {renderInsightDetails()}
          </div>
        ) : (
          <>
            <Button
              className="flex items-center justify-between w-full"
              onClick={() => setSelectedInsight('burnout')}
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <span>Burnout Risk Alert</span>
              </div>
              <span className="text-sm text-muted-foreground">3 students at risk</span>
            </Button>
            <Button
              className="flex items-center justify-between w-full"
              onClick={() => setSelectedInsight('grades')}
            >
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span>Grade Trends</span>
              </div>
              <span className="text-sm text-muted-foreground">7 students changed</span>
            </Button>
            <Button
              className="flex items-center justify-between w-full"
              onClick={() => setSelectedInsight('workload')}
            >
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-500" />
                <span>Workload Heatmap</span>
              </div>
              <span className="text-sm text-muted-foreground">Past 7 days</span>
            </Button>
            <Button
              className="flex items-center justify-between w-full"
              onClick={() => setSelectedInsight('deadline')}
            >
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-purple-500" />
                <span>Deadline Optimizer</span>
              </div>
              <span className="text-sm text-muted-foreground">1 suggestion</span>
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default AIInsightsPanel; 