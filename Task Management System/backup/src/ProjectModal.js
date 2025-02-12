// ProjectModal.js
import React from 'react';
import { Modal, Button, ProgressBar } from 'react-bootstrap';

const ProjectModal = ({ project, handleClose }) => {
  return (
    <Modal show={true} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>{project.name}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="d-flex justify-content-between">
          <div><strong>Project Progress:</strong></div>
          <ProgressBar now={project.progress} label={`${project.progress}%`} style={{ width: '50%' }} />
          <Button variant="secondary" className="ml-2">Edit</Button>
        </div>
        <hr />
        {project.users.map((user, index) => (
          <div key={index} className="mb-3">
            <div className="d-flex justify-content-between">
              <span>{user.name}</span>
              <ProgressBar now={(user.completed / user.tasks) * 100} label={`${user.completed}/${user.tasks}`} style={{ width: '50%' }} />
            </div>
          </div>
        ))}
        <hr />
        <div>
          <Button variant="link">Documents</Button>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ProjectModal;
