// ProjectPage.js
import React from 'react';
import './ProjectPage.css';
import { useLocation } from 'react-router-dom';
import { ProgressBar } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

/*
document
/api/fsharing/fetch_files
input: project_ID
output: filename, filepath, pid, uid, _id
*/

/*
/api/fsharing/download
input: _id
output:direct download
*/

/*
/api/fsharing/upload
input: file
refresh browser
*/

/*
/api/fsharing/delete
input: _id
refresh browser
*/

/*
${backendUrl}/api/projects/fetchById
input: projectID
output: members(array of strings), uid(creatorID)(check with userID stored in local storage)
*/

/*
${backendUrl}/api/projects/user_info
input: members(array of strings), projectID
output: name, progress
*/


const ProjectPage = () => {
  // Retrieve the project ID from the UR
  
  const navigate = useNavigate();

  const handleMemberClick = (memberId) => {
    navigate(`/member?projectId=${projectData.id}&memberId=${memberId}`);
  };

  const query = new URLSearchParams(useLocation().search);
  const projectId = query.get('id');

    // Dummy data for demonstration purposes
    const projectData = {
        id: projectId,
        name: `Project ${projectId === '1' ? 'Alpha' : 'Beta'}`,
        dueDate: '2024-12-31',
        progress: 75, // Progress percentage
        members: [
            { name: 'Alice', tasks: 5, completed: 3 },
            { name: 'Bob', tasks: 4, completed: 2 },
            { name: 'Charlie', tasks: 6, completed: 5 },
        ],
    };

  // Use the project ID to fetch or display project details (dummy content for now)
  return (
    <div className="project-page">
      <div className="horizontal-line"></div>
      <div className = "title-and-progress">
        <h1 className= "project-title">{projectData.name}</h1>
        <button className='edit-button'> Edit</button>
        <div className="custom-progress-bar">
          <ProgressBar
            now={projectData.progress}
            label={`${projectData.progress}%`}
          />
        </div>
      </div>
      <div className="horizontal-line"></div>
      <h6 className='duedateclass'>Due Date: {projectData.dueDate}</h6>
      <button className='button-style'>Documents</button>
      <h2>Members and Task Progress</h2>
      <div className="horizontal-line"></div>
      <div className="members-container">
        {projectData.members.map((member, index) => (
          <div  key={index}
                className="member"
                onClick={() => handleMemberClick(index)} // Pass the index or member.id if available
          >
            <h4 className='membername'>{member.name}</h4>
            <div className="member-progress-bar">
                <ProgressBar
                now={Math.round((member.completed / member.tasks) * 100)}
                label={`${Math.round((member.completed / member.tasks) * 100)}%`}
                />
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectPage;
