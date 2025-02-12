import React, { useState, useEffect, useCallback } from 'react';
import './Dashboard.css'; // Custom CSS
import ProjectCard from './ProjectCard.js';
import { useNavigate } from 'react-router-dom';

const backendUrl = process.env.REACT_APP_BACKEND_URL;

/*
${backendUrl}/api/projects/progress
input: user-id, projectid
output: progress: 50
*/



const Dashboard = () => {

  const getNextDayMidnight = () => {
    const date = new Date();
    date.setDate(date.getDate() + 1); // Move to next day
    date.setHours(0, 0, 0, 0); // Set time to "00:00:00"
    
    // Format the date to "YYYY-MM-DDTHH:MM" for the datetime-local input
    return date.toISOString().slice(0, 16);
  };

  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [selectedDateTime, setSelectedDateTime] = useState(getNextDayMidnight());
  const [showPopup, setShowPopup] = useState(false);
  const [newProject, setNewProject] = useState({ name: ''});
  const [loading, setLoading] = useState(true); // Add loading state

  const userId = localStorage.getItem('userId'); // Assume userId is stored in local storage

  // Define fetchProjects using useCallback so it is memoized and available to handleSubmit
  const fetchProjects = useCallback(async () => {
    try {
      const encodedData = new URLSearchParams();
      encodedData.append('id', userId);
      const response = await fetch(`${backendUrl}/api/projects/fetchByUser`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: encodedData.toString(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }

      const data = await response.json();
      await fetchProjectProgress(data);

    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  }, [userId]); // Re-run the function if userId changes

  const fetchProjectProgress = async (projectList) => {
    try {
      const updatedProjects = await Promise.all(
        projectList.map(async (project) => {
          const encodedData = new URLSearchParams();
          encodedData.append('id', project._id);
          const response = await fetch(`${backendUrl}/api/projects/progress`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: encodedData.toString(),
          });

          if (!response.ok) {
            throw new Error('Failed to fetch project\'s progress');
          }

          const progressData = await response.json();
          if(progressData.progress == null ){
            progressData.progress = 0;
          }
          
          const roundedProgress = Math.round(progressData.progress);

          return { ...project, progress: roundedProgress };
        })
      );
      setProjects(updatedProjects);
    } catch (error) {
      console.error("Error fetching project progress:", error);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]); // Call fetchProjects once the component mounts

  // State for managing projects
  /*
  const [projects, setProjects] = useState([
    { id: 1, name: 'Project Alpha', progress: 50, users: [{ name: 'Alice', tasks: 5, completed: 3 }, { name: 'Bob', tasks: 4, completed: 2 }] },
    { id: 2, name: 'Project Beta', progress: 70, users: [{ name: 'Charlie', tasks: 5, completed: 5 }, { name: 'David', tasks: 3, completed: 1 }] },
    // Add more projects as needed
  ]);
  */

  // Handle when project card is clicked
  const handleCardClick = (project) => {
    navigate(`/projectpage?id=${project._id}`); // Redirect to ProjectPage with the project ID in the URL
  };
  
  // Toggle the popup window
  const togglePopup = () => {
    setShowPopup(!showPopup);
  };
  
  // Handle form inputs for new project
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProject((prevProject) => ({ ...prevProject, [name]: value }));
  };
  
  const handleSubmit = async () => {
    try {
      // Send the data to the backend to create the project
      const encodedData = new URLSearchParams();

      encodedData.append('creator', userId);
      encodedData.append('name', newProject.name);
      encodedData.append('members', userId); // Assuming the members are an array of userIds
      encodedData.append('deadline', selectedDateTime);

      console.log("Encoded data for project creation:", encodedData.toString());
  
      const response = await fetch(`${backendUrl}/api/projects/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded', // Use URL encoded format for this request
        },
        body: encodedData.toString(),
      });

      console.log("Request sent to server.");
  
      if (!response.ok) {
        throw new Error('Failed to create project');
      }
  
      const result = await response.json();
      console.log("Response from server:", result);
  
      if (result.msg === 'project created') {
        // Project created successfully, refetch the list of projects
        fetchProjects(); // Call the function to refetch projects
        setNewProject({ name: ''}); // Reset the form
        setSelectedDateTime(getNextDayMidnight()); // Reset the due date input
        togglePopup(); // Close the popup
      } else {
        console.error('Failed to create project: ', result.msg);
      }
    } catch (error) {
      console.error('Error creating project: ', error);
    }
  };
  

  return (
    <div className="dashboard">
      
      <div className="header">
        <h2 className='projects-title-style'>Projects</h2>
        <button className="add-project-button" onClick={togglePopup}>+</button>
      </div>
      <div className="horizontal-line"></div>
      <div className="projects-container">
        {loading ? (
          <h6>Loading projects...</h6> // Display a loading message while waiting for the response
        ) : (
          projects.length === 0 ? (
            <h6>It looks like you don’t have any projects yet. Add one to get started!</h6>
          ) : (
            projects.map((project) => (
              <ProjectCard
                key={project._id} // Use _id for a unique key
                project={project}
                handleClick={handleCardClick}
              />
            ))
          )
        )}
      </div>
      <div className="horizontal-line"></div>

      {showPopup && (
        <div className="popup">
          <div className="popup-content">
            <h3 className='projects-title-style'>Create New Project</h3>
            <label>Project Name</label>
            <input
              type="text"
              name="name"
              value={newProject.name}
              placeholder='Enter new project name'
              onChange={handleInputChange}
            />
            <label>Due date</label>
            <input 
              type="datetime-local" 
              className="datetime-input" 
              defaultValue={getNextDayMidnight()} 
              onChange={(e) => setSelectedDateTime(e.target.value)} 
            />
            <div className="popup-buttons">
              <button className="cancel" onClick={togglePopup}>Cancel</button>
              <button className="submit" onClick={handleSubmit}>Submit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
