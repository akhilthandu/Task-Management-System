// src/MemberPage.js
import React, { useState, useEffect, useCallback } from 'react';
import './MemberPage.css'
import { ProgressBar } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';


const backendUrl = process.env.REACT_APP_BACKEND_URL;

const MemberPage = () => {

  const getNextDayMidnight = () => {
    const date = new Date();
    date.setDate(date.getDate() + 1); // Move to next day
    date.setHours(0, 0, 0, 0); // Set time to "00:00:00"
    
    // Format the date to "YYYY-MM-DDTHH:MM" for the datetime-local input
    return date.toISOString().slice(0, 16);
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const userId = localStorage.getItem('userId'); // Assume userId is stored in local storage
  

  const [projectData, setProjectData] = useState([]);
  const [memberName, setMemberName] = useState({name: "", progress:0,});

  const [progress, setProgress] = useState(0);
  const [tasks, setTasks] = useState([]); // Assuming tasks is an array

  const [selectedDateTime, setSelectedDateTime] = useState(getNextDayMidnight());
  const [memberTasks, setMemberTasks] = useState([]); // State for tasks
  const [typedTaskMsg, setTypedTaskMsg] = useState("");
  const [addTaskResponse, setAddTaskResponse] = useState("");


  const query = new URLSearchParams(useLocation().search);
  const projectId = query.get('projectId');
  const memberId = query.get('memberId');
  
  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        const encodedData = new URLSearchParams();
        encodedData.append('id', projectId);
        const response = await fetch(`${backendUrl}/api/projects/fetchById`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: encodedData.toString(), // Send userId in request body
        });

        if (!response.ok) {
          throw new Error('Failed to fetch project data');
        }

        const data = await response.json();
        
        // Update the projects state with the fetched data
        setProjectData(data);
        // Fetch developer names after project data is retrieved
        //fetchDeveloperNames(data.members);

      } catch (error) {
        console.error("Error fetching project data:", error);
      }
    };

    fetchProjectData();
  }, [projectId]);

  const fetchMemberName = useCallback(async () => {
      try {
        const encodedData = new URLSearchParams();
        encodedData.append('uid', memberId);
        encodedData.append('pid', projectId);
        const response = await fetch(`${backendUrl}/api/projects/user_info`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: encodedData.toString(), // Send userId in request body
        });

        if (!response.ok) {
          throw new Error('Failed to fetch member name');
        }

        const data = await response.json();

        if (data.progress ===null){
          data.progress = 0.1;
        }

        data.name = data.name.toUpperCase();
        data.progress = Math.round(data.progress)
        
        // Update the projects state with the fetched data
        setMemberName(data);
        // Fetch developer names after project data is retrieved
        //fetchDeveloperNames(data.members);

      } catch (error) {
        console.error("Error fetching member name:", error);
      }
    }, [memberId]);

    useEffect(() => {
      fetchMemberName();
    }, [fetchMemberName]);

  // Define `fetchMemberTasks` using `useCallback` to avoid the `no-undef` error
  const fetchMemberTasks = useCallback(async () => {
    try {
      const encodedData = new URLSearchParams();
      encodedData.append('project', projectId);
      encodedData.append('user', memberId);

      const response = await fetch(`${backendUrl}/api/tasks/fetchByPU`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: encodedData.toString(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch member tasks');
      }

      const data = await response.json();
      setMemberTasks(data);
    } catch (error) {
      console.error("Error fetching member tasks:", error);
    }
  }, [projectId, memberId]);

  useEffect(() => {
    fetchMemberTasks();
  }, [fetchMemberTasks]);
  
  const handleAddTask = async () => {
    try {
      const encodedData = new URLSearchParams();
      encodedData.append('creator', memberId);
      encodedData.append('message', typedTaskMsg);
      encodedData.append('project', projectId);
      encodedData.append('deadline', selectedDateTime);
      console.log(selectedDateTime);
      encodedData.append('checked', false);
      encodedData.append('priority', 0);

      const response = await fetch(`${backendUrl}/api/tasks/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: encodedData.toString(),
      });

      if (!response.ok) {
        throw new Error('Failed to add task');
      }

      const data = await response.json();
      if (data.msg === "task created") {
        setAddTaskResponse("Task added successfully!");
        setTypedTaskMsg("");
        setSelectedDateTime(getNextDayMidnight());
        
        // Re-fetch tasks to immediately display the new task
        fetchMemberTasks();
        fetchMemberName();
      }
    } catch (error) {
      console.error("Error adding task:", error);
      setAddTaskResponse("Error adding task.");
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      const encodedData = new URLSearchParams();
      encodedData.append('id', taskId);

      const response = await fetch(`${backendUrl}/api/tasks/delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: encodedData.toString(),
      });

      const data = await response.json();
      console.log(data);
      if (data.deleted.acknowledged) {
        console.log("Task deleted successfully");
        fetchMemberTasks(); // Re-fetch tasks to show updated list
        fetchMemberName();
      } else {
        console.error("Error: Task not deleted");
      }
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const formatDate = (datetime) => {
    const date = new Date(datetime); // Make sure the datetime passed is a valid ISO string
    if (isNaN(date.getTime())) {
        // If the date is invalid, return a fallback or empty string
        return "Invalid date";
    }
    
    const formattedDate = date.toLocaleDateString("en-US", {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
    
    // Extract the time portion as it is, without any local conversion
    const formattedTime = date.toISOString().slice(11, 16); // This gets the HH:MM part
    
    return `${formattedDate} at ${formattedTime}`;
};

  const handleTaskStatusChange = async (taskId, checkedStatus) => {
    try {
      const encodedData = new URLSearchParams();
      encodedData.append('id', taskId);
      encodedData.append('checked', checkedStatus);

      const response = await fetch(`${backendUrl}/api/tasks/edit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: encodedData.toString(),
      });

      const data = await response.json();
      if (data.msg === "Changed Sucessfully") {
        fetchMemberTasks();
        fetchMemberName();
      }
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };

  return (
    <div className="member-page">
        <div className='member-and-progress'>
            <h1 className='member-name'>{memberName.name}</h1>
            
            <div className="custom-progress-bar">
            <ProgressBar
                now={memberName.progress}
                label={`${memberName.progress}%`}
            />
            </div>
            
        </div>
        <h4 className='project-title'>{projectData.pname}</h4>
        <div className="horizontal-line"></div>
        <h3>Tasks:</h3>
        <ul className='taskslist'>
          {memberTasks.length > 0 ? (
            memberTasks.map((task) => (
              <li key={task._id} className="task-item">
                <input
                  type="checkbox"
                  checked={task.checked}
                  className='checkbox-style'
                  onChange={(e) => handleTaskStatusChange(task._id, e.target.checked)}
                  disabled={(userId !== projectData.uid && memberTasks[0].uid !== userId)}
                />
                {task.msg}
                <h6 className="duedate">
                  Due Date: {formatDate(task.datetime)}
                </h6>
                {userId === projectData.uid && (
                <button 
                  onClick={() => handleDeleteTask(task._id)} 
                  className="delete-button">Delete</button>
                )}
              </li>
            ))
          ) : (
            <p>There are no tasks available.</p>
          )}
        </ul>
        {userId === projectData.uid && (
          <>
            <input
            type="text"
            placeholder="Add a task"
            className='addtextclass'
            value={typedTaskMsg}
            onChange={(e) => setTypedTaskMsg(e.target.value)} /><div></div><input
              type="datetime-local"
              className="datetime-input"
              defaultValue={getNextDayMidnight()}
              onChange={(e) => setSelectedDateTime(e.target.value)} /><div></div><button
                className='addtaskbutton'
                onClick={() => handleAddTask()}
                disabled={!typedTaskMsg}
              >Add</button>
          </>
      )}
    </div>
  );
};

export default MemberPage;
