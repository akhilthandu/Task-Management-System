// src/MemberPage.js
import React from 'react';
import './MemberPage.css'
import { ProgressBar } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';

/*
${backendUrl}/api/tasks/fetchbyPU
input: projectID, memberID( from members string )
output: msg(task name), datetime(deadline), checked(boolean 0 or 1), tid
*/

/*
${backendUrl}/api/tasks/edit
input: tid, boolean
output: status200
*/

/*
${backendUrl}/api/tasks/create
input: msg, memberID, projectID, datetime(deadline), checked(0), priority(0)
add code to refresh the page
*/

/*
${backendUrl}/api/tasks/delete
input: taskID
add code to refresh the page
*/

const MemberPage = () => {
  const query = new URLSearchParams(useLocation().search);
  //const projectId = query.get('projectId');
  //const memberId = query.get('memberId');
  
  // Dummy data for tasks, replace this with actual data fetch logic
  const memberData = {
    name: 'Alice',
    progress: 60, // Progress percentage for the specific member
    tasks: [
      { title: 'Task 1 : Implement algorithm to make forward movement for the character', status: 'Completed' },
      { title: 'Task 2 : Modify the settings of the project adopting to IOS requirements', status: 'In Progress' },
      { title: 'Task 3 : Animate the character\'s jump animation', status: 'Pending' },
    ],
  };

  return (
    <div className="member-page">
        <div className='member-and-progress'>
            <h1 className='member-name'>{memberData.name}</h1>
            <div className="memberpage-progress-bar">
            <ProgressBar
                now={memberData.progress}
                label={`${memberData.progress}%`}
            />
            </div>
        </div>
        <h4>Project Alpha</h4>
        <div className="horizontal-line"></div>
        <h3>Tasks:</h3>
        <ul className='taskslist'>
            {memberData.tasks.map((task, index) => (
                <li key={index}>{task.title} - {task.status}</li>
            ))}
        </ul>
        <input
            type="text"
            placeholder="Add a task"
            className='addtextclass'
        />
        <div></div>
        <button className='addtaskbutton'>Add</button>
    </div>
  );
};

export default MemberPage;
