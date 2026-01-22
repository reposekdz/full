const express = require('express');
const http = require('http');
const cors = require('cors');
const setupWebSocket = require('./websocket');

const assignmentsRouter = require('./routes/assignments');
const quizzesRouter = require('./routes/quizzes');
const homeworkRouter = require('./routes/homework');
const holidayPackagesRouter = require('./routes/holidayPackages');
const peerReviewRouter = require('./routes/peerReview');
const liveStudyRouter = require('./routes/liveStudy');

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

app.use('/api/assignments', assignmentsRouter);
app.use('/api/quizzes', quizzesRouter);
app.use('/api/homework', homeworkRouter);
app.use('/api/holiday-packages', holidayPackagesRouter);
app.use('/api/peer-review', peerReviewRouter);
app.use('/api/live-study', liveStudyRouter);

setupWebSocket(server);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
