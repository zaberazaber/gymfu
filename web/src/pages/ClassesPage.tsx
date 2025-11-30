import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ClassesPage.css';

interface Class {
  id: number;
  gymId: number;
  instructorId: number;
  name: string;
  type: 'yoga' | 'zumba' | 'dance' | 'pilates' | 'spinning' | 'crossfit' | 'boxing';
  schedule: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }[];
  capacity: number;
  price: number | string;
  description?: string;
  gymName: string;
  instructorName: string;
  instructorRating: number | string;
  instructorSpecialization: string;
}

const ClassesPage: React.FC = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [filteredClasses, setFilteredClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string>('all');
  const navigate = useNavigate();

  const classTypes = [
    { value: 'all', label: 'All Classes', icon: '🏃' },
    { value: 'yoga', label: 'Yoga', icon: '🧘' },
    { value: 'zumba', label: 'Zumba', icon: '💃' },
    { value: 'dance', label: 'Dance', icon: '🕺' },
    { value: 'pilates', label: 'Pilates', icon: '🤸' },
    { value: 'spinning', label: 'Spinning', icon: '🚴' },
    { value: 'crossfit', label: 'CrossFit', icon: '🏋️' },
    { value: 'boxing', label: 'Boxing', icon: '🥊' },
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedType === 'all') {
      setFilteredClasses(classes);
    } else {
      setFilteredClasses(classes.filter(cls => cls.type === selectedType));
    }
  }, [classes, selectedType]);

  const fetchClasses = async () => {
    try {
      const response = await fetch('/api/v1/classes');
      const data = await response.json();
      if (data.success) {
        setClasses(data.data);
      } else {
        setError(data.message || 'Failed to fetch classes');
      }
    } catch (err: any) {
      setError('Failed to fetch classes');
      console.error('Error fetching classes:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatSchedule = (schedule: Class['schedule']) => {
    return schedule.map(s => 
      `${dayNames[s.dayOfWeek]} ${s.startTime}-${s.endTime}`
    ).join(', ');
  };

  const getTypeIcon = (type: string) => {
    const typeData = classTypes.find(t => t.value === type);
    return typeData?.icon || '🏃';
  };

  const handleClassClick = (classId: number) => {
    navigate(`/classes/${classId}`);
  };

  if (loading) {
    return (
      <div className="classes-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading classes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="classes-page">
        <div className="error-container">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={fetchClasses} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="classes-page">
      <div className="classes-header">
        <h1>🧘 Fitness Classes</h1>
        <p>Discover and book fitness classes at your favorite gyms</p>
      </div>

      <div className="classes-filters">
        {classTypes.map(type => (
          <button
            key={type.value}
            className={`filter-button ${selectedType === type.value ? 'active' : ''}`}
            onClick={() => setSelectedType(type.value)}
          >
            <span className="filter-icon">{type.icon}</span>
            <span className="filter-label">{type.label}</span>
          </button>
        ))}
      </div>

      <div className="classes-grid">
        {filteredClasses.length === 0 ? (
          <div className="no-classes">
            <h3>No classes found</h3>
            <p>
              {selectedType === 'all' 
                ? 'No classes are currently available.' 
                : `No ${selectedType} classes are currently available.`
              }
            </p>
          </div>
        ) : (
          filteredClasses.map(cls => (
            <div 
              key={cls.id} 
              className="class-card"
              onClick={() => handleClassClick(cls.id)}
            >
              <div className="class-header">
                <div className="class-type-badge">
                  <span className="type-icon">{getTypeIcon(cls.type)}</span>
                  <span className="type-name">{cls.type}</span>
                </div>
                <div className="class-price">₹{typeof cls.price === 'string' ? parseFloat(cls.price) : cls.price}</div>
              </div>

              <div className="class-content">
                <h3 className="class-name">{cls.name}</h3>
                <p className="class-gym">📍 {cls.gymName}</p>

                <div className="instructor-info">
                  <div className="instructor-name">👨‍🏫 {cls.instructorName}</div>
                  <div className="instructor-rating">
                    ⭐ {typeof cls.instructorRating === 'string' ? parseFloat(cls.instructorRating).toFixed(1) : cls.instructorRating.toFixed(1)}
                  </div>
                </div>

                <div className="class-schedule">
                  <strong>Schedule:</strong>
                  <div className="schedule-times">
                    {formatSchedule(cls.schedule)}
                  </div>
                </div>

                <div className="class-capacity">
                  👥 Capacity: {cls.capacity} people
                </div>

                {cls.description && (
                  <p className="class-description">{cls.description}</p>
                )}
              </div>

              <div className="class-footer">
                <button className="book-class-button">
                  Book Class
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ClassesPage;
