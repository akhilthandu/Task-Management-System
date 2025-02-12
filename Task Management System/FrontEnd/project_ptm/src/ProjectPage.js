// ProjectPage.js
import React, { useState, useEffect, useCallback } from 'react';
import './ProjectPage.css';
import { useLocation } from 'react-router-dom';
import { ProgressBar } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Modal, Button } from 'react-bootstrap';
import MessageGroup from './MessageGroup';

const backendUrl = process.env.REACT_APP_BACKEND_URL;
/*
/api/fsharing/upload
input: file
refresh browser
*/

const ProjectPage = () => {
  // Retrieve the project ID from the UR
  
  const navigate = useNavigate();
  const [projectData, setProjectData] = useState([]);
  const [projectProgress, setProjectProgress] = useState([]);
  const [devs, setDevs] = useState([]);
  const userId = localStorage.getItem('userId'); // Assume userId is stored in local storage

  const [showModal, setShowModal] = useState(false);  // Controls visibility of the modal
  const [files, setFiles] = useState([]);    // Holds the list of files

  const [showEditPopup, setShowEditPopup] = useState(false); // Show/Hide edit popup
  const [newProjectName, setNewProjectName] = useState(''); // For new project name input
  const [newDeadline, setNewDeadline] = useState(''); // For new deadline input

  const [users, setUsers] = useState([]); // All users fetched from the backend
  const [selectedUsers, setSelectedUsers] = useState([]); // Users added to project
  const [searchQuery, setSearchQuery] = useState(''); // For search box
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const [showManageMembersPopup, setShowManageMembersPopup] = useState(false);

  const [deletionStatus, setDeletionStatus] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false); // State to show confirmation popup

  const query = new URLSearchParams(useLocation().search);
  const projectId = query.get('id');


  const fetchProjectData = useCallback(async () => {
    try {
      const encodedData = new URLSearchParams();
      encodedData.append('id', projectId);
      const response = await fetch(`${backendUrl}/api/projects/fetchById`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: encodedData.toString(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch project data');
      }

      const data = await response.json();
      console.log(data);
      setProjectData(data);
      

      // Fetch project progress
      const encdta = new URLSearchParams();
      encdta.append('id', projectId);
      const rspns = await fetch(`${backendUrl}/api/projects/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: encdta.toString(),
      });

      if (!rspns.ok) {
        throw new Error('Failed to fetch project progress');
      }

      const prgrs = await rspns.json();
      if (prgrs.progress == null) {
        prgrs.progress = 0;
      }

      const updatedprgrs = Math.round(prgrs.progress);
      setProjectProgress(updatedprgrs);

      fetchDeveloperNames_Progress(data.members);

    } catch (error) {
      console.error("Error fetching project data:", error);
    }
  }, [projectId]);  // Only re-run when projectId changes

  useEffect(() => {
    fetchProjectData();
  }, [fetchProjectData]);  // Depend on fetchProjectData

  useEffect(() => {
    if (showManageMembersPopup) {
      const fetchUsers = async () => {
        try {
          const response = await fetch(`${backendUrl}/api/projects/get_users`, {method: 'POST'});
          const data = await response.json();
          setUsers(data); // Store the fetched usersf
        } catch (error) {
          console.error("Error fetching users:", error);
        }
      };
      fetchUsers();
    }
  }, [showManageMembersPopup]);


  const fetchDeveloperNames_Progress = async (members) => {
    try {
      const devDetails = await Promise.all(members.map(async (memberId) => {
        //console.log(memberId);
        const encodedData = new URLSearchParams();
        encodedData.append('id', memberId); // Send member _id to fetch their name
        const response = await fetch(`${backendUrl}/api/projects/fetchUserName`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: encodedData.toString(),
        });

        if (!response.ok) {
          console.error(`Failed to fetch name for member ${memberId}`);
          return null; // Return null if there's an error
          //throw new Error(`Failed to fetch name for member ${memberId}`);
        }

        const data = await response.json();

        const progressData = new URLSearchParams();
          progressData.append('uid', memberId);
          progressData.append('pid', projectId);

          const progressResponse = await fetch(`${backendUrl}/api/tasks/progress`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: progressData.toString(),
          });

          if (!progressResponse.ok) {
            throw new Error(`Failed to fetch progress for member ${memberId}`);
          }

          const userProgress = await progressResponse.json();

          if (userProgress.progress == null){
            userProgress.progress = 0;
          }

          const updatedUserProgress = Math.round(userProgress.progress)

        /**/
        const progressData2 = new URLSearchParams();
        progressData2.append('uid', memberId);
        progressData2.append('pid', projectId);

        const progressResponse2 = await fetch(`${backendUrl}/api/tasks/task_count`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: progressData2.toString(),
        });

        if (!progressResponse2.ok) {
          throw new Error(`Failed to fetch progress for member ${memberId}`);
        }

        const userProgress2 = await progressResponse2.json();
        //console.log(userProgress2);

        /**/ 

          return { id: memberId, name: data.name, progress: updatedUserProgress, all_tasks: userProgress2.all_tasks, completed: userProgress2.completed};

        //return { [memberId]: data.name }; // Extract the developer's name
      }));

      // Filter out any null values (in case of errors) and combine into a single object
      setDevs(devDetails.filter((dev) => dev !== null)); // Update the devs state with the list of names
      //console.log(devDetails);
      setSelectedUsers(devDetails); // Set selected users from the project data
      //console.log(devMap);
    } catch (error) {
      console.error("Error fetching developer names and progress:", error);
    }
  };

  const handleDelete = async () => {
    try {
      const encodedData = new URLSearchParams();
      encodedData.append('pid', projectId);
      encodedData.append('uid', userId);

      const response = await fetch(`${backendUrl}/api/projects/delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: encodedData.toString(),
      });

      const responseData = await response.json();

      if (responseData.deleted.acknowledged) {
        //alert('Project deleted successfully.');
        setDeletionStatus('success');
        navigate('/dashboard'); // Redirect to the dashboard or desired page after deletion
      } else {
        //alert('Project deletion failed.');
        setDeletionStatus('failed');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      //alert('An error occurred while deleting the project.');
      setDeletionStatus('error');
    }
  };

  const handleSubmitChanges = async () => {
    try {
      const encodedData = new URLSearchParams();
      encodedData.append('pid', projectId);
      encodedData.append('name', projectData.pname);
      encodedData.append('deadline', projectData.datetime);

      // Append selected members to the request
      selectedUsers.forEach(user => {
        encodedData.append('members', user.id);
      });

      const response = await fetch(`${backendUrl}/api/projects/edit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: encodedData.toString(),
      });

      const data = await response.json();
      if (data.msg === 'successful') {
        await fetchProjectData();
        setShowManageMembersPopup(false); // Close the modal after success
      } else {
        console.error('Failed to update project members');
      }
    } catch (error) {
      console.error("Error submitting changes:", error);
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleUserSelect = (userId, userName) => {
    if (!selectedUsers.some((user) => user.id === userId)) {
      setSelectedUsers([...selectedUsers, { id: userId, name: userName }]);
    }
  };

  const handleUserRemove = (userId) => {
    setSelectedUsers(selectedUsers.filter(user => user.id !== userId));
  };

  const handleManageMembersClick = () => {
    setShowManageMembersPopup(true); // Open the modal
  };

  const handleClosePopup = () => {
    setShowManageMembersPopup(false); // Close the modal without saving
  };

  const handleInputFocus = () => {
    setDropdownVisible(true);
  };

  const handleInputBlur = () => {
    // Delay hiding the dropdown to allow click on the button
    setTimeout(() => setDropdownVisible(false), 200);
  };

  const handleEditButtonClick = () => {
    setShowEditPopup(true); // Show edit popup
    setNewProjectName(projectData.pname); // Pre-fill with current project name
    setNewDeadline(projectData.datetime); // Pre-fill with current deadline
  };

  // Handle Cancel for Edit
  const handleCancelEdit = () => {
    setShowEditPopup(false); // Close popup without submitting
  };

  const handleSubmitEdit = async () => {
    try {
      const encodedData = new URLSearchParams();
      encodedData.append('pid', projectId);
      encodedData.append('name', newProjectName);
      encodedData.append('deadline', newDeadline);
      
      projectData.members.map((memberbro) => {
        encodedData.append('members',memberbro);
      });

      //encodedData.append('members', JSON.stringify(projectData.members)); // Send members list

      const response = await fetch(`${backendUrl}/api/projects/edit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: encodedData.toString(),
      });

      const data = await response.json();

      if (data.msg === 'successful') {
        // Successfully updated, now refetch the project data
      await fetchProjectData();  // Refetch the project data from the server
      setShowEditPopup(false); // Close popup after submit
      } else {
        console.error('Failed to update project');
      }
    } catch (error) {
      console.error("Error updating project:", error);
    }
  };

   // Handle file upload
   const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return; // If no file is selected, exit

    // Prepare the data to send to the server
    const formData = new FormData();
    formData.append('uid', userId); // Add user ID
    formData.append('pid', projectId); // Add project ID
    formData.append('file', file); // Add the file

    try {
      const response = await fetch(`${backendUrl}/api/file/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('3:Failed to upload file');
      }
      alert('File uploaded successfully!');
      // File uploaded successfully, now refetch the files list
      await fetchFiles(); // This will refetch the files list
      
    } catch (error) {
      console.error("1:Error uploading file:", error);
      alert('2:Failed to upload file');
    }
  };
  /*
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const encodedData = new URLSearchParams();
        encodedData.append('id', projectId);
        const response = await fetch(`${backendUrl}/api/file/fetch_files`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: encodedData.toString(),
        });

        if (!response.ok) throw new Error('Failed to fetch files');
        const data = await response.json();
        setFiles(data); // Store the fetched files in the files state
      } catch (error) {
        console.error("Error fetching files:", error);
      }
    };

    fetchFiles();
  }, [projectId]);*/

  const fetchFiles = useCallback(async () => {
    try {
      const encodedData = new URLSearchParams();
      encodedData.append('id', projectId);
      const response = await fetch(`${backendUrl}/api/file/fetch_files`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: encodedData.toString(),
      });

      if (!response.ok) throw new Error('Failed to fetch files');
      const data = await response.json();
      setFiles(data); // Store the fetched files in the files state
    } catch (error) {
      console.error("Error fetching files:", error);
    }
  }, [projectId]);

  useEffect(() => {
    fetchProjectData();
    fetchFiles();
  }, [fetchProjectData, fetchFiles]);

   // Function to handle file download
   const handleFileDownload = async (fileId) => {
    console.log(fileId);
    try {
      const response = await fetch(`${backendUrl}/api/file/download?id=${fileId}`, {
        method: 'GET',
        //headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      console.log(response.msg);

      if (!response.ok) throw new Error('Failed to download file');

      // Extract the filename from headers if available
      const filename = response.headers.get('Content-Disposition')?.split('filename=')[1] || 'downloaded_file';

      // Convert the response to a blob
      const blob = await response.blob();

      // Create a temporary URL for the blob and trigger the download
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();

      // Release the temporary URL
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };
  

    // Dummy data for demonstration purposes
    /*
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
    };*/

  const handleMemberClick = (memberId) => {
    navigate(`/member?projectId=${projectId}&memberId=${memberId}`);
  };

  // Handle file deletion
  const handleFileDelete = async (fileId) => {
    try {
      const encodedData = new URLSearchParams();
      encodedData.append('id', fileId);

      const response = await fetch(`${backendUrl}/api/file/delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: encodedData.toString(),
      });

      const data = await response.json();
      console.log(data);

      if (data.msg === "deleted") {
        // File deleted successfully, refetch the file list
        fetchFiles();
      } else {
        console.error('Failed to delete file');
      }
    } catch (error) {
      console.error("Error deleting file:", error);
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


  // Function to toggle modal visibility
  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  // Use the project ID to fetch or display project details (dummy content for now)
  return (
    <div className="project-page">
      <div className="horizontal-line"></div>
      <div className = "title-and-progress">
        <h1 className= "project-title">{projectData.pname}</h1>
        {userId === projectData.uid && (
          <>
            <button className="edit-button" onClick={handleEditButtonClick}>Edit</button>
            <button onClick={() => setShowDeleteConfirm(true)} className="edit-button">Delete Project</button>
          </>
        )}
        {
          <div className="custom-progress-bar">
            <ProgressBar
              now={projectProgress}
              label={`${projectProgress}%`}
            />
          </div>
        }
      </div>
      <div className="horizontal-line"></div>
        <h6 className="duedateclass">
          Due Date: {formatDate(projectData.datetime)}
        </h6>
        <div></div>
        <button className="button-style" onClick={handleShowModal}>Documents</button>

        {userId === projectData.uid && (
          <>
            <button className="edit-button" onClick={handleManageMembersClick}>Manage Members</button>
          </>
        )}

        <h2>Members</h2>
      <div className="horizontal-line"></div>
      <div className="members-container">
      {devs.map((dev) => (
          <div key={dev.id} 
            className="member" 
            onClick={() => handleMemberClick(dev.id)}>
              <h4 className="membername">{dev.name}</h4>
              {/*
              <div className="member-progress-bar">
                
                <ProgressBar 
                  now={dev.progress} 
                  label={`${dev.progress}%`}
                />
                
              </div>
              */}
          </div>
        ))}
      </div>
      <div className="horizontal-line"></div>
      <MessageGroup projectId={projectId} userId={userId} />

      {/* Modal for Document Management */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Documents</h3>
            {files.length > 0 ? (
              <ul>
                {files.map(file => (
                  <li key={file._id}>
                    <Button variant="link" onClick={() => handleFileDownload(file._id)}>
                      {file.filename}
                    </Button>
                    { (file.uid === userId || projectData.uid === userId) &&  
                    <button className="delete-button" onClick={() => handleFileDelete(file._id)}>Delete</button>
                    }
                  </li>
                ))}
              </ul>
            ) : (
              <p>There are no documents available.</p>
            )}
            <div className='action-buttons'>
                <label htmlFor="file-upload" className="main-upload-button">
                  Upload File
                </label>
                <input
                  id="file-upload"
                  type="file"
                  style={{ display: 'none' }}
                  onChange={handleFileUpload} // Trigger file upload on file selection
                />
              <button className="close-button" onClick={handleCloseModal}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {showEditPopup && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Edit Project</h3>
            <div>
              <label>Project Name: </label>
              <input
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="Enter new project name"
              />
            </div>
            <div>
              <label>Deadline: </label>
              <input
                type="datetime-local"
                value={newDeadline}
                onChange={(e) => setNewDeadline(e.target.value)}
              />
            </div>
            <div className='action-buttons'>
              <Button className='upload-button' onClick={handleSubmitEdit}>Submit</Button>
              <Button className='close-button' onClick={handleCancelEdit}>Cancel</Button>
            </div>
          </div>
        </div>
      )}

      {/* Manage Members Modal */}
      {showManageMembersPopup && (
        <div className="modal-overlay">
          <div className="modal-content">

            {/* List of selected users with remove button */}
            <div className="selected-users">
              <h4>Current Users</h4>
              <ul className='user-items'>
                {selectedUsers.map((user) => (
                  <li key={user.id}>
                    {user.name}
                    {user.id !== userId &&
                    <button className='delete-button' onClick={() => handleUserRemove(user.id)}>Remove</button>
                    }
                  </li>
                ))}
              </ul>
            </div>

            <div className='search-box-class'>    
              <h4>Manage Members</h4>

              {/* Search Box */}
              <input
                type="text"
                placeholder="Search for users"
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
              />

              {/* Dropdown list of users */}
              {isDropdownVisible && searchQuery && (
                <ul className='dropdown-list'>
                  {filteredUsers.map((user) => (
                    <li key={user._id} className='dropdown-item'>
                      {user.name}
                      <button
                        onClick={() => handleUserSelect(user._id, user.name)}
                        disabled={selectedUsers.some((selected) => selected.id === user._id)}
                        className={`user-button ${selectedUsers.some((selected) => selected.id === user._id) ? 'selected' : ''}`}
                      >
                        {selectedUsers.some((selected) => selected.id === user._id) ? 'Selected' : 'Add'}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Action Buttons */}
            <div className="action-buttons">
              <Button className='upload-button' onClick={handleSubmitChanges}>Submit</Button>
              <Button className='close-button' onClick={handleClosePopup}>Close</Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation popup */}
      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className='modal-content'>
            <p>Are you sure you want to delete this project?</p>
            <div className='action-buttons'>
              <button onClick={handleDelete} className="upload-button">Confirm</button>
              <button onClick={() => setShowDeleteConfirm(false)} className="close-button">Cancel</button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
};

export default ProjectPage;
