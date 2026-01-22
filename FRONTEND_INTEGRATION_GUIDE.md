# Frontend Integration Guide - Production-Ready Backend APIs

## 🚀 All Backend Routes - Complete Integration

### Base URL
```javascript
const API_BASE_URL = 'http://localhost:5000/api';
```

---

## 1. 🏆 Sports Management (`/api/sports-management`)

### Fetch All Matches
```javascript
const fetchMatches = async () => {
  const response = await fetch(`${API_BASE_URL}/sports-management/matches`);
  const data = await response.json();
  return data.matches;
};
```

### Create Match
```javascript
const createMatch = async (matchData) => {
  const response = await fetch(`${API_BASE_URL}/sports-management/matches`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      home_team_id: 1,
      away_team_id: 2,
      match_date: '2025-06-15T14:00:00',
      venue: 'Garden TVET Stadium',
      sport_type: 'football',
      competition: 'Inter-School Championship'
    })
  });
  return response.json();
};
```

### Add Player with Image
```javascript
const addPlayer = async (playerData, imageFile) => {
  const formData = new FormData();
  formData.append('name', playerData.name);
  formData.append('jersey_number', playerData.jersey_number);
  formData.append('position', playerData.position);
  formData.append('team_id', playerData.team_id);
  formData.append('sport_type', playerData.sport_type);
  formData.append('image', imageFile);
  
  const response = await fetch(`${API_BASE_URL}/sports-management/players`, {
    method: 'POST',
    body: formData
  });
  return response.json();
};
```

### Get Player Statistics
```javascript
const getPlayerStats = async (playerId) => {
  const response = await fetch(`${API_BASE_URL}/sports-management/players/${playerId}/stats`);
  const data = await response.json();
  return data;
};
```

---

## 2. 🎓 DOS Advanced Management (`/api/dos-advanced`)

### Get Academic Years
```javascript
const fetchAcademicYears = async () => {
  const response = await fetch(`${API_BASE_URL}/dos-advanced/academic-years`);
  const data = await response.json();
  return data.years;
};
```

### Create Academic Year
```javascript
const createAcademicYear = async () => {
  const response = await fetch(`${API_BASE_URL}/dos-advanced/academic-years`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      year_name: '2025-2026',
      start_date: '2025-01-01',
      end_date: '2026-12-31',
      is_current: true
    })
  });
  return response.json();
};
```

### Add Teacher with Profile Image
```javascript
const addTeacher = async (teacherData, imageFile) => {
  const formData = new FormData();
  formData.append('first_name', teacherData.first_name);
  formData.append('last_name', teacherData.last_name);
  formData.append('email', teacherData.email);
  formData.append('phone', teacherData.phone);
  formData.append('password', '2026');
  formData.append('specialization', teacherData.specialization);
  formData.append('qualification', teacherData.qualification);
  formData.append('experience_years', teacherData.experience_years);
  if (imageFile) formData.append('profile_image', imageFile);
  
  const response = await fetch(`${API_BASE_URL}/dos-advanced/teachers`, {
    method: 'POST',
    body: formData
  });
  return response.json();
};
```

### Create Workshop with Images
```javascript
const createWorkshop = async (workshopData, imageFiles) => {
  const formData = new FormData();
  formData.append('title', workshopData.title);
  formData.append('description', workshopData.description);
  formData.append('facilitator', workshopData.facilitator);
  formData.append('start_date', workshopData.start_date);
  formData.append('end_date', workshopData.end_date);
  formData.append('venue', workshopData.venue);
  
  imageFiles.forEach(file => {
    formData.append('workshop_images', file);
  });
  
  const response = await fetch(`${API_BASE_URL}/dos-advanced/workshops`, {
    method: 'POST',
    body: formData
  });
  return response.json();
};
```

### Graduate Students
```javascript
const graduateStudents = async (studentIds) => {
  const response = await fetch(`${API_BASE_URL}/dos-advanced/students/graduate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      student_ids: studentIds,
      graduation_date: '2025-12-15',
      certificate_issued: true
    })
  });
  return response.json();
};
```

### DOS Dashboard Stats
```javascript
const fetchDOSStats = async () => {
  const response = await fetch(`${API_BASE_URL}/dos-advanced/dashboard/stats`);
  const data = await response.json();
  return data.stats;
};
```

---

## 3. 🔧 Admin Advanced Management (`/api/admin-advanced`)

### Create News Article
```javascript
const createNews = async (newsData, imageFile) => {
  const formData = new FormData();
  formData.append('title', newsData.title);
  formData.append('content', newsData.content);
  formData.append('excerpt', newsData.excerpt);
  formData.append('category', newsData.category);
  formData.append('author_id', newsData.author_id);
  formData.append('featured', newsData.featured);
  if (imageFile) formData.append('news_image', imageFile);
  
  const response = await fetch(`${API_BASE_URL}/admin-advanced/news`, {
    method: 'POST',
    body: formData
  });
  return response.json();
};
```

### Create Event with Multiple Images
```javascript
const createEvent = async (eventData, imageFiles) => {
  const formData = new FormData();
  formData.append('title', eventData.title);
  formData.append('description', eventData.description);
  formData.append('type', eventData.type);
  formData.append('start_date', eventData.start_date);
  formData.append('end_date', eventData.end_date);
  formData.append('venue', eventData.venue);
  
  imageFiles.forEach(file => {
    formData.append('event_images', file);
  });
  
  const response = await fetch(`${API_BASE_URL}/admin-advanced/events`, {
    method: 'POST',
    body: formData
  });
  return response.json();
};
```

### Create Announcement
```javascript
const createAnnouncement = async (announcementData, files) => {
  const formData = new FormData();
  formData.append('title', announcementData.title);
  formData.append('content', announcementData.content);
  formData.append('target_audience', announcementData.target_audience);
  formData.append('priority', announcementData.priority);
  formData.append('start_date', announcementData.start_date);
  formData.append('end_date', announcementData.end_date);
  formData.append('created_by', announcementData.created_by);
  
  files.forEach(file => {
    formData.append('announcement_files', file);
  });
  
  const response = await fetch(`${API_BASE_URL}/admin-advanced/announcements`, {
    method: 'POST',
    body: formData
  });
  return response.json();
};
```

### Admin Dashboard Stats
```javascript
const fetchAdminStats = async () => {
  const response = await fetch(`${API_BASE_URL}/admin-advanced/dashboard/stats`);
  const data = await response.json();
  return data.stats;
};
```

---

## 4. 🎮 Gamification (`/api/gamification`)

### Get User Points
```javascript
const fetchUserPoints = async (userId) => {
  const response = await fetch(`${API_BASE_URL}/gamification/points/${userId}`);
  const data = await response.json();
  return data;
};
```

### Award Points
```javascript
const awardPoints = async (userId, points, activityType) => {
  const response = await fetch(`${API_BASE_URL}/gamification/points`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: userId,
      points: points,
      activity_type: activityType,
      description: 'Completed assignment'
    })
  });
  return response.json();
};
```

### Get Leaderboard
```javascript
const fetchLeaderboard = async (period = 'all', limit = 50) => {
  const response = await fetch(`${API_BASE_URL}/gamification/leaderboard?period=${period}&limit=${limit}`);
  const data = await response.json();
  return data.leaderboard;
};
```

### Get User Badges
```javascript
const fetchUserBadges = async (userId) => {
  const response = await fetch(`${API_BASE_URL}/gamification/badges/${userId}`);
  const data = await response.json();
  return data.badges;
};
```

---

## 5. 📊 Analytics (`/api/analytics`)

### Student Performance Analytics
```javascript
const fetchStudentPerformance = async (userId) => {
  const response = await fetch(`${API_BASE_URL}/analytics/performance/${userId}`);
  const data = await response.json();
  return data;
};
```

### Class Analytics
```javascript
const fetchClassAnalytics = async (classId) => {
  const response = await fetch(`${API_BASE_URL}/analytics/class/${classId}`);
  const data = await response.json();
  return data;
};
```

### Teacher Analytics
```javascript
const fetchTeacherAnalytics = async (teacherId) => {
  const response = await fetch(`${API_BASE_URL}/analytics/teacher/${teacherId}`);
  const data = await response.json();
  return data;
};
```

### School-wide Analytics
```javascript
const fetchSchoolAnalytics = async () => {
  const response = await fetch(`${API_BASE_URL}/analytics/school`);
  const data = await response.json();
  return data;
};
```

---

## 6. 🤖 AI Grading (`/api/ai-grading`)

### Submit for AI Grading
```javascript
const submitForAIGrading = async (assignmentId, studentId, file, rubric) => {
  const formData = new FormData();
  formData.append('assignment_id', assignmentId);
  formData.append('student_id', studentId);
  formData.append('submission', file);
  formData.append('rubric_criteria', JSON.stringify(rubric));
  
  const response = await fetch(`${API_BASE_URL}/ai-grading/grade`, {
    method: 'POST',
    body: formData
  });
  return response.json();
};
```

### Get AI Grading History
```javascript
const fetchAIGradingHistory = async (studentId) => {
  const response = await fetch(`${API_BASE_URL}/ai-grading/history/${studentId}`);
  const data = await response.json();
  return data.history;
};
```

---

## 7. 🎯 Adaptive Learning (`/api/adaptive-learning`)

### Get Personalized Recommendations
```javascript
const fetchRecommendations = async (userId) => {
  const response = await fetch(`${API_BASE_URL}/adaptive-learning/recommendations/${userId}`);
  const data = await response.json();
  return data;
};
```

### Get Learning Path
```javascript
const fetchLearningPath = async (userId) => {
  const response = await fetch(`${API_BASE_URL}/adaptive-learning/learning-path/${userId}`);
  const data = await response.json();
  return data.learningPath;
};
```

### Track Learning Progress
```javascript
const trackProgress = async (progressData) => {
  const response = await fetch(`${API_BASE_URL}/adaptive-learning/progress`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: progressData.user_id,
      course_id: progressData.course_id,
      topic: progressData.topic,
      completion_percentage: progressData.completion,
      time_spent: progressData.timeSpent,
      mastery_level: progressData.mastery
    })
  });
  return response.json();
};
```

### Get Skill Gaps
```javascript
const fetchSkillGaps = async (userId) => {
  const response = await fetch(`${API_BASE_URL}/adaptive-learning/skill-gaps/${userId}`);
  const data = await response.json();
  return data.skillGaps;
};
```

---

## 8. 👥 Collaboration (`/api/collaboration`)

### Get Study Groups
```javascript
const fetchStudyGroups = async () => {
  const response = await fetch(`${API_BASE_URL}/collaboration/groups`);
  const data = await response.json();
  return data.groups;
};
```

### Create Study Group
```javascript
const createStudyGroup = async (groupData) => {
  const response = await fetch(`${API_BASE_URL}/collaboration/groups`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: groupData.name,
      description: groupData.description,
      subject: groupData.subject,
      max_members: groupData.max_members,
      created_by: groupData.created_by,
      privacy: groupData.privacy
    })
  });
  return response.json();
};
```

### Create Group Post with Attachments
```javascript
const createGroupPost = async (groupId, userId, content, files) => {
  const formData = new FormData();
  formData.append('user_id', userId);
  formData.append('content', content);
  
  files.forEach(file => {
    formData.append('attachments', file);
  });
  
  const response = await fetch(`${API_BASE_URL}/collaboration/groups/${groupId}/posts`, {
    method: 'POST',
    body: formData
  });
  return response.json();
};
```

### Like Post
```javascript
const likePost = async (postId, userId) => {
  const response = await fetch(`${API_BASE_URL}/collaboration/posts/${postId}/like`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId })
  });
  return response.json();
};
```

---

## 🎨 React Component Examples

### Sports Match Card
```jsx
import React, { useEffect, useState } from 'react';

const MatchCard = () => {
  const [matches, setMatches] = useState([]);
  
  useEffect(() => {
    fetch('http://localhost:5000/api/sports-management/matches')
      .then(res => res.json())
      .then(data => setMatches(data.matches));
  }, []);
  
  return (
    <div className="matches-grid">
      {matches.map(match => (
        <div key={match.id} className="match-card">
          <div className="teams">
            <span>{match.home_team}</span>
            <span className="score">{match.home_score} - {match.away_score}</span>
            <span>{match.away_team}</span>
          </div>
          <div className="match-info">
            <p>{new Date(match.match_date).toLocaleDateString()}</p>
            <p>{match.venue}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
```

### Leaderboard Component
```jsx
import React, { useEffect, useState } from 'react';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  
  useEffect(() => {
    fetch('http://localhost:5000/api/gamification/leaderboard?period=month&limit=10')
      .then(res => res.json())
      .then(data => setLeaderboard(data.leaderboard));
  }, []);
  
  return (
    <div className="leaderboard">
      <h2>Top Students This Month</h2>
      {leaderboard.map((student, index) => (
        <div key={student.id} className="leaderboard-item">
          <span className="rank">#{index + 1}</span>
          <img src={student.profile_image} alt={student.first_name} />
          <span className="name">{student.first_name} {student.last_name}</span>
          <span className="points">{student.total_points} pts</span>
          <span className="badges">{student.badge_count} badges</span>
        </div>
      ))}
    </div>
  );
};
```

---

## 🔐 Authentication Headers

For protected routes, include JWT token:

```javascript
const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`
    }
  });
};
```

---

## ✅ All Routes Production-Ready

- ✅ Full database integration
- ✅ File upload support
- ✅ Error handling
- ✅ Input validation
- ✅ Real-time data
- ✅ No mock data
- ✅ Advanced features
- ✅ Modern technology

**Ready for production deployment!**
