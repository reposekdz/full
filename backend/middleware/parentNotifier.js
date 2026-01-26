// Middleware to emit real-time updates to parents
const notifyParentUpdate = (io) => {
  return async (req, res, next) => {
    const originalJson = res.json;
    
    res.json = function(data) {
      // If operation was successful and involves student data
      if (data.success && req.studentId) {
        // Emit update to parent
        io.emit('student:update', {
          studentId: req.studentId,
          type: req.updateType || 'general',
          timestamp: new Date()
        });
      }
      
      originalJson.call(this, data);
    };
    
    next();
  };
};

module.exports = { notifyParentUpdate };
