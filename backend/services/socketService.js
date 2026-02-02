const http = require('http');
const socketIO = require('socket.io');

let io = null;

function initializeSocket(server) {
  if (!io) {
    io = socketIO(server, {
      cors: { origin: '*', methods: ['GET', 'POST'] }
    });

    io.on('connection', (socket) => {
      console.log(`✅ Socket connected: ${socket.id}`);

      socket.on('join_parent_room', (parentPhone) => {
        socket.join(`parent_${parentPhone}`);
        console.log(`Parent ${parentPhone} joined their room`);
      });

      socket.on('join_student_room', (studentId) => {
        socket.join(`student_${studentId}`);
        console.log(`Student ${studentId} joined their room`);
      });

      socket.on('join_staff_room', (staffId) => {
        socket.join(`staff_${staffId}`);
        console.log(`Staff ${staffId} joined their room`);
      });

      socket.on('disconnect', () => {
        console.log(`❌ Socket disconnected: ${socket.id}`);
      });
    });
  }
  return io;
}

function getIO() {
  if (!io) {
    throw new Error('Socket.IO not initialized. Call initializeSocket first.');
  }
  return io;
}

function emitToParent(parentPhone, event, data) {
  if (io) {
    io.to(`parent_${parentPhone}`).emit(event, data);
  }
}

function emitToStudent(studentId, event, data) {
  if (io) {
    io.to(`student_${studentId}`).emit(event, data);
  }
}

function emitToStaff(staffId, event, data) {
  if (io) {
    io.to(`staff_${staffId}`).emit(event, data);
  }
}

function emitToAll(event, data) {
  if (io) {
    io.emit(event, data);
  }
}

module.exports = {
  initializeSocket,
  getIO,
  emitToParent,
  emitToStudent,
  emitToStaff,
  emitToAll
};
