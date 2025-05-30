import React from 'react';
import { useNavigate } from 'react-router-dom';

// Add a `showLink` prop to optionally hide the "View Details" link
function CourseCard({ course, showLink = true }) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (showLink) {
      navigate(`/course/${course.courseId}`);
    }
  };

  return (
    <div style={styles.card} onClick={handleClick}>
      <h3 style={styles.title}>{course.title}</h3>
      <p style={styles.description}>
        <strong>Description:</strong> {course.description}
      </p>
      {course.mediaUrl && (
        <p>
          <strong>Media:</strong>{' '}
          <a href={course.mediaUrl} target="_blank" rel="noreferrer">
            View Media
          </a>
        </p>
      )}
      {showLink && <p style={styles.link}>View Details →</p>}
    </div>
  );
}

const styles = {
  card: {
    backgroundColor: '#f9f9f9',
    padding: '1.25rem',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
    cursor: 'pointer',
    transition: '0.2s ease-in-out',
  },
  title: {
    margin: '0 0 0.5rem',
    color: '#007bff',
  },
  description: {
    color: '#444',
    fontSize: '0.95rem'
  },
  link: {
    marginTop: '1rem',
    color: '#007bff',
    fontWeight: 'bold'
  }
};

export default CourseCard;
