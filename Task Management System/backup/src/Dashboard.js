import React, { useState } from 'react';
import './Dashboard.css'; // Custom CSS
import ProjectCard from './ProjectCard';
import { useNavigate } from 'react-router-dom';

const backendUrl = process.env.REACT_APP_BACKEND_URL;

/*
${backendUrl}/api/projects/fetchByUser
input: userId 
output: pname, _id(store in local as projectID), datetime, 
*/

/*
${backendUrl}/api/projects/progress
input: user-id, projectid
output: progress: 50
*/



const Dashboard = () => {

  const navigate = useNavigate();

  // State for managing projects
  const [projects, setProjects] = useState([
    { id: 1, name: 'Project Alpha', progress: 50, users: [{ name: 'Alice', tasks: 5, completed: 3 }, { name: 'Bob', tasks: 4, completed: 2 }] },
    { id: 2, name: 'Project Beta', progress: 70, users: [{ name: 'Charlie', tasks: 5, completed: 5 }, { name: 'David', tasks: 3, completed: 1 }] },
    // Add more projects as needed
  ]);

  // Handle when project card is clicked
  const handleCardClick = (project) => {
    navigate(`/projectpage?id=${project.id}`); // Redirect to ProjectPage with the project ID in the URL
  };

  // Popup state for adding new project
  const [showPopup, setShowPopup] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', users: [], tasks: [], progress: 0 });

  // Toggle the popup window
  const togglePopup = () => {
    setShowPopup(!showPopup);
  };

  // Handle form inputs for new project
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProject((prevProject) => ({ ...prevProject, [name]: value }));
  };

  // Add task to the new project
  const addTask = () => {
    if (newProject.task) {
      setNewProject((prevProject) => ({
        ...prevProject,
        tasks: [...prevProject.tasks, prevProject.task],
        task: '' // Clear the task input after adding
      }));
    }
  };

  // Submit new project
  const handleSubmit = () => {
    setProjects([...projects, newProject]);
    setNewProject({ name: '', users: [], tasks: [], progress: 0 });
    togglePopup();
  };

  return (
    <div className="dashboard">
      <div className="header">
        <button className="add-project-button" onClick={togglePopup}>+</button>
      </div>

      <div className="projects-container">
        {projects.map((project, index) => (
          <ProjectCard
            key={index}
            project={project}
            handleClick={handleCardClick}
          />
        ))}
      </div>

      {showPopup && (
        <div className="popup">
          <div className="popup-content">
            <h3>Create New Project</h3>
            <label>Project Name</label>
            <input
              type="text"
              name="name"
              value={newProject.name}
              onChange={handleInputChange}
            />

            <label>Add Users</label>
            <input
              type="text"
              name="users"
              placeholder="Search for users..."
              onChange={handleInputChange}
            />

            <label>Add Tasks</label>
            <input
              type="text"
              name="task"
              value={newProject.task || ''}
              placeholder="Add a task..."
              onChange={handleInputChange}
            />
            <button onClick={addTask}>Add Task</button>

            {newProject.tasks.length > 0 && (
              <ul className="task-list">
                {newProject.tasks.map((task, idx) => (
                  <li key={idx}>{task}</li>
                ))}
              </ul>
            )}

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
