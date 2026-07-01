import React, { useState, useEffect, useMemo } from 'react';
import './App.css';

const StudentRow = ({ student, onEdit, onDelete }) => {
  return (
    <tr className="table-row">
      <td className="table-cell">{student.rollNumber}</td>
      <td className="table-cell">{student.name}</td>
      <td className="table-cell">{student.marks}</td>
      <td className="table-cell actions-cell">
        <button onClick={() => onEdit(student)} className="action-button edit-button">
          Edit
        </button>
        <button onClick={() => onDelete(student.id)} className="action-button delete-button">
          Delete
        </button>
      </td>
    </tr>
  );
};

export default function StudentRecordApp() {
  const [students, setStudents] = useState(() => {
    const saved = localStorage.getItem('studentRecords');
    return saved ? JSON.parse(saved) : [];
  });

  const [rollNumber, setRollNumber] = useState('');
  const [name, setName] = useState('');
  const [marks, setMarks] = useState('');
  const [error, setError] = useState('');
  
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    localStorage.setItem('studentRecords', JSON.stringify(students));
  }, [students]);

  const filteredStudents = useMemo(() => {
    return students.filter(
      (s) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.rollNumber.includes(searchQuery)
    );
  }, [students, searchQuery]);

  const stats = useMemo(() => {
    if (students.length === 0) return { total: 0, average: 0, highest: 0 };
    const marksArray = students.map((s) => Number(s.marks));
    const total = marksArray.reduce((acc, curr) => acc + curr, 0);
    return {
      total: students.length,
      average: (total / students.length).toFixed(1),
      highest: Math.max(...marksArray),
    };
  }, [students]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!rollNumber.trim() || !name.trim() || !marks.trim()) {
      setError('All fields are required!');
      return;
    }

    if (isNaN(marks) || Number(marks) < 0 || Number(marks) > 100) {
      setError('Marks must be a valid number between 0 and 100.');
      return;
    }

    setError('');

    const studentData = {
      id: isEditing ? editId : Date.now(),
      rollNumber: rollNumber.trim(),
      name: name.trim(),
      marks: marks.trim(),
    };

    if (isEditing) {
      setStudents(students.map((s) => (s.id === editId ? studentData : s)));
      setIsEditing(false);
      setEditId(null);
    } else {
      if (students.some((s) => s.rollNumber === studentData.rollNumber)) {
        setError('Roll Number already exists!');
        return;
      }
      setStudents([...students, studentData]);
    }

    resetForm();
  };

  const handleEdit = (student) => {
    setRollNumber(student.rollNumber);
    setName(student.name);
    setMarks(student.marks);
    setIsEditing(true);
    setEditId(student.id);
    setError('');
  };

  const handleDelete = (id) => {
    setStudents(students.filter((student) => student.id !== id));
    if (isEditing && editId === id) resetForm();
  };

  const resetForm = () => {
    setRollNumber('');
    setName('');
    setMarks('');
    setIsEditing(false);
    setEditId(null);
    setError('');
  };

  return (
    <div className="container">
      <div className="header-flex">
        <h2>Student Dashboard</h2>
        {students.length > 0 && (
          <button onClick={() => setStudents([])} className="action-button clear-button">
            Clear All
          </button>
        )}
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Total Students</span>
          <span className="stat-value">{stats.total}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Average Marks</span>
          <span className="stat-value">{stats.average}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Highest Score</span>
          <span className="stat-value">{stats.highest}</span>
        </div>
      </div>

      {students.length > 0 && (
        <div className="graph-section">
          <h3>Marks Distribution</h3>
          <div className="graph-container">
            {students.map((student) => (
              <div key={student.id} className="graph-row">
                <span className="graph-label">{student.name}</span>
                <div className="graph-track">
                  <div 
                    className="graph-fill" 
                    style={{ width: `${Math.min(Math.max(student.marks, 0), 100)}%` }}
                  >
                    <span className="graph-value">{student.marks}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="form-container">
        <input
          type="text"
          placeholder="Roll Number"
          value={rollNumber}
          onChange={(e) => setRollNumber(e.target.value)}
          className="form-input"
          disabled={isEditing}
        />
        <input
          type="text"
          placeholder="Student Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="form-input"
        />
        <input
          type="number"
          placeholder="Marks (0-100)"
          value={marks}
          onChange={(e) => setMarks(e.target.value)}
          className="form-input"
        />
        <button type="submit" className={`add-button ${isEditing ? 'update-mode' : ''}`}>
          {isEditing ? 'Update Student' : 'Add Student'}
        </button>
        {isEditing && (
          <button type="button" onClick={resetForm} className="cancel-button">
            Cancel
          </button>
        )}
      </form>

      {error && <p className="error-text">{error}</p>}

      <hr className="divider" />

      <div className="section-header">
        <h3>Student Records</h3>
        <input
          type="text"
          placeholder="Search by name or roll no..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>

      {filteredStudents.length === 0 ? (
        <p className="no-records">
          {students.length === 0 
            ? "No records found. Add a student above." 
            : "No students match your search."}
        </p>
      ) : (
        <table className="records-table">
          <thead>
            <tr className="table-header">
              <th className="table-cell">Roll</th>
              <th className="table-cell">Name</th>
              <th className="table-cell">Marks</th>
              <th className="table-cell">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((student) => (
              <StudentRow 
                key={student.id} 
                student={student} 
                onEdit={handleEdit}
                onDelete={handleDelete} 
              />
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}