const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// GET all services
router.get('/services', async (req, res) => {
  try {
    const { category } = req.query;
    let query = 'SELECT * FROM school_services WHERE is_active = true';
    const params = [];
    
    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }
    
    query += ' ORDER BY name_rw ASC';
    
    const [services] = await pool.query(query, params);
    
    const parsedServices = services.map(service => ({
      ...service,
      schedule: typeof service.schedule === 'string' ? JSON.parse(service.schedule) : service.schedule,
      features: typeof service.features === 'string' ? JSON.parse(service.features) : service.features,
      requirements: typeof service.requirements === 'string' ? JSON.parse(service.requirements) : service.requirements,
      benefits: typeof service.benefits === 'string' ? JSON.parse(service.benefits) : service.benefits
    }));
    
    res.json({
      success: true,
      services: parsedServices
    });
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching services'
    });
  }
});

// GET single service
router.get('/services/:id', async (req, res) => {
  try {
    const [services] = await pool.query(
      'SELECT * FROM school_services WHERE id = ? AND is_active = true',
      [req.params.id]
    );
    
    if (services.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }
    
    const service = {
      ...services[0],
      schedule: typeof services[0].schedule === 'string' ? JSON.parse(services[0].schedule) : services[0].schedule,
      features: typeof services[0].features === 'string' ? JSON.parse(services[0].features) : services[0].features,
      requirements: typeof services[0].requirements === 'string' ? JSON.parse(services[0].requirements) : services[0].requirements,
      benefits: typeof services[0].benefits === 'string' ? JSON.parse(services[0].benefits) : services[0].benefits
    };
    
    res.json({
      success: true,
      service
    });
  } catch (error) {
    console.error('Error fetching service:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching service'
    });
  }
});

// POST service request
router.post('/requests', async (req, res) => {
  try {
    const { service_id, user_id, student_name, student_email, student_phone, parent_name, parent_phone, request_type, message } = req.body;
    
    const [result] = await pool.query(
      `INSERT INTO service_requests 
       (service_id, user_id, student_name, student_email, student_phone, parent_name, parent_phone, request_type, message) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [service_id, user_id, student_name, student_email, student_phone, parent_name, parent_phone, request_type, message]
    );
    
    res.json({
      success: true,
      message: 'Request submitted successfully',
      requestId: result.insertId
    });
  } catch (error) {
    console.error('Error submitting request:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting request'
    });
  }
});

// GET service requests (admin/headmaster/advisor)
router.get('/admin/requests', async (req, res) => {
  try {
    const { status } = req.query;
    let query = `
      SELECT sr.*, ss.name_rw as service_name 
      FROM service_requests sr
      JOIN school_services ss ON sr.service_id = ss.id
    `;
    const params = [];
    
    if (status) {
      query += ' WHERE sr.status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY sr.created_at DESC';
    
    const [requests] = await pool.query(query, params);
    
    res.json({
      success: true,
      requests
    });
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching requests'
    });
  }
});

// PUT update request status (admin/headmaster/advisor)
router.put('/admin/requests/:id', async (req, res) => {
  try {
    const { status, notes, approved_by } = req.body;
    
    await pool.query(
      `UPDATE service_requests 
       SET status = ?, notes = ?, approved_by = ?, approved_at = NOW() 
       WHERE id = ?`,
      [status, notes, approved_by, req.params.id]
    );
    
    res.json({
      success: true,
      message: 'Request updated successfully'
    });
  } catch (error) {
    console.error('Error updating request:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating request'
    });
  }
});

// POST create service (admin/headmaster/advisor)
router.post('/admin/services', async (req, res) => {
  try {
    const { name, name_rw, category, description, description_rw, full_details_rw, icon, price, duration, availability, contact_person, contact_email, contact_phone, location, schedule, features, requirements, benefits, created_by } = req.body;
    
    const [result] = await pool.query(
      `INSERT INTO school_services 
       (name, name_rw, category, description, description_rw, full_details_rw, icon, price, duration, availability, 
        contact_person, contact_email, contact_phone, location, schedule, features, requirements, benefits, created_by) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, name_rw, category, description, description_rw, full_details_rw, icon, price, duration, availability, contact_person, contact_email, contact_phone, location, JSON.stringify(schedule), JSON.stringify(features), JSON.stringify(requirements), JSON.stringify(benefits), created_by]
    );
    
    res.json({
      success: true,
      message: 'Service created successfully',
      serviceId: result.insertId
    });
  } catch (error) {
    console.error('Error creating service:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating service'
    });
  }
});

// PUT update service (admin/headmaster/advisor)
router.put('/admin/services/:id', async (req, res) => {
  try {
    const { name, name_rw, category, description, description_rw, full_details_rw, icon, price, duration, availability, contact_person, contact_email, contact_phone, location, schedule, features, requirements, benefits } = req.body;
    
    await pool.query(
      `UPDATE school_services 
       SET name = ?, name_rw = ?, category = ?, description = ?, description_rw = ?, full_details_rw = ?, 
           icon = ?, price = ?, duration = ?, availability = ?, contact_person = ?, contact_email = ?, 
           contact_phone = ?, location = ?, schedule = ?, features = ?, requirements = ?, benefits = ? 
       WHERE id = ?`,
      [name, name_rw, category, description, description_rw, full_details_rw, icon, price, duration, availability, contact_person, contact_email, contact_phone, location, JSON.stringify(schedule), JSON.stringify(features), JSON.stringify(requirements), JSON.stringify(benefits), req.params.id]
    );
    
    res.json({
      success: true,
      message: 'Service updated successfully'
    });
  } catch (error) {
    console.error('Error updating service:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating service'
    });
  }
});

// DELETE service (admin/headmaster/advisor)
router.delete('/admin/services/:id', async (req, res) => {
  try {
    await pool.query(
      'UPDATE school_services SET is_active = false WHERE id = ?',
      [req.params.id]
    );
    
    res.json({
      success: true,
      message: 'Service deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting service'
    });
  }
});

module.exports = router;
