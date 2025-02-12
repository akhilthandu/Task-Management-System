import React from 'react';
import { Card, ProgressBar } from 'react-bootstrap';
import './ProjectCard.css';

const ProjectCard = ({ project, handleClick }) => {
  return (
    <Card className="project-card" onClick={() => handleClick(project)}>
      <Card.Body>
        <Card.Title className="project-card-title">{project.pname}</Card.Title>
        {
          <ProgressBar
            now={project.progress}
            label={`${project.progress}%`}
            className="project-progress-bar"
          />
        }   
      </Card.Body>
    </Card>
  );
};

export default ProjectCard;
