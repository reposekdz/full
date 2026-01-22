const express = require('express');
const router = express.Router();
const pool = require('../config/database').pool;
const { authenticateToken, requireRole } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// ================================
// ADVANCED OPERATIONS APIS (26-50)
// ================================

// 26. Intelligent Resource Allocation and Optimization
router.get('/operations/resource-optimization/analysis', [authenticateToken, requireRole('admin')], async (req, res) => {
  try {
    // Analyze classroom utilization
    const [classroomUtilization] = await pool.execute(`
      SELECT 
        r.id,
        r.name as room_name,
        r.capacity,
        r.room_type,
        COUNT(DISTINCT te.id) as scheduled_periods,
        (COUNT(DISTINCT te.id) / 40.0 * 100) as utilization_percentage,
        AVG(CASE WHEN att.status = 'present' THEN 1 ELSE 0 END * c.enrolled_students) as average_occupancy,
        (AVG(CASE WHEN att.status = 'present' THEN 1 ELSE 0 END * c.enrolled_students) / r.capacity * 100) as occupancy_rate,
        r.maintenance_status,
        r.equipment_condition_score
      FROM rooms r
      LEFT JOIN timetable_entries te ON r.id = te.room_id
      LEFT JOIN courses c ON te.course_id = c.id
      LEFT JOIN attendance att ON c.id = att.course_id AND DATE(att.check_in_time) = CURDATE()
      GROUP BY r.id
      ORDER BY utilization_percentage DESC
    `);

    // Teacher workload analysis
    const [teacherWorkload] = await pool.execute(`
      SELECT 
        t.id,
        u.name as teacher_name,
        COUNT(DISTINCT c.id) as courses_assigned,
        SUM(c.weekly_hours) as total_weekly_hours,
        COUNT(DISTINCT s.id) as total_students,
        AVG(cr.rating) as average_course_rating,
        COUNT(DISTINCT a.id) as assignments_created_month,
        COUNT(DISTINCT g.id) as grades_given_month,
        CASE 
          WHEN SUM(c.weekly_hours) > 40 THEN 'Akazi karengeye'
          WHEN SUM(c.weekly_hours) > 30 THEN 'Akazi k\'ibisanzwe'
          WHEN SUM(c.weekly_hours) > 20 THEN 'Akazi gato'
          ELSE 'Akazi gake cyane'
        END as workload_status,
        t.efficiency_score,
        t.stress_level_reported
      FROM teachers t
      JOIN users u ON t.user_id = u.id
      LEFT JOIN courses c ON t.id = c.teacher_id
      LEFT JOIN enrollments e ON c.id = e.course_id
      LEFT JOIN students s ON e.student_id = s.id
      LEFT JOIN course_ratings cr ON c.id = cr.course_id
      LEFT JOIN assignments a ON c.id = a.course_id AND a.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      LEFT JOIN grades g ON c.id = g.course_id AND g.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      WHERE t.status = 'active'
      GROUP BY t.id
      ORDER BY total_weekly_hours DESC
    `);

    // Equipment and technology utilization
    const [equipmentUtilization] = await pool.execute(`
      SELECT 
        e.id,
        e.equipment_name,
        e.category,
        e.location,
        e.status,
        COUNT(DISTINCT eu.id) as usage_sessions_week,
        SUM(eu.duration_minutes) as total_usage_minutes_week,
        AVG(eu.user_rating) as average_user_rating,
        e.maintenance_due_date,
        DATEDIFF(e.maintenance_due_date, CURDATE()) as days_until_maintenance,
        e.condition_score,
        e.utilization_target_hours_week,
        (SUM(eu.duration_minutes) / 60.0) as actual_hours_week,
        ((SUM(eu.duration_minutes) / 60.0) / e.utilization_target_hours_week * 100) as target_achievement_percentage
      FROM equipment e
      LEFT JOIN equipment_usage eu ON e.id = eu.equipment_id 
        AND eu.usage_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      GROUP BY e.id
      ORDER BY target_achievement_percentage ASC
    `);

    // Generate optimization recommendations
    const optimizationRecommendations = generateResourceOptimizationRecommendations(
      classroomUtilization, 
      teacherWorkload, 
      equipmentUtilization
    );

    res.json({
      success: true,
      message: 'Isesengura ry\'ikoreshwa ry\'ibikoresho ryashyizweho',
      classroom_utilization: classroomUtilization,
      teacher_workload: teacherWorkload,
      equipment_utilization: equipmentUtilization,
      optimization_recommendations: optimizationRecommendations
    });
  } catch (error) {
    console.error('Resource optimization error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ikosa mu gusesengura ikoreshwa ry\'ibikoresho' 
    });
  }
});

// 27. Advanced Disciplinary Management with Intervention Tracking
router.post('/operations/discipline/intervention-plan', [authenticateToken, requireRole('admin', 'counselor')], async (req, res) => {
  try {
    const { student_id, incident_details, severity_level, intervention_strategy } = req.body;

    // Get student's disciplinary history for pattern analysis
    const [disciplinaryHistory] = await pool.execute(`
      SELECT 
        da.id,
        da.incident_type,
        da.severity_level,
        da.action_date,
        da.description,
        da.action_taken,
        da.follow_up_required,
        da.resolution_status,
        DATEDIFF(CURDATE(), da.action_date) as days_ago
      FROM disciplinary_actions da
      WHERE da.student_id = ?
      ORDER BY da.action_date DESC
      LIMIT 10
    `, [student_id]);

    // Analyze behavior patterns
    const behaviorPattern = analyzeBehaviorPattern(disciplinaryHistory);
    
    // Create new disciplinary record with AI-enhanced intervention plan
    const interventionPlan = generateInterventionPlan(incident_details, severity_level, behaviorPattern);
    
    const [result] = await pool.execute(`
      INSERT INTO disciplinary_actions (
        student_id, incident_type, severity_level, description, 
        action_taken, intervention_plan, behavior_pattern_analysis,
        follow_up_required, assigned_counselor_id, action_date,
        expected_resolution_date, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), DATE_ADD(NOW(), INTERVAL ? DAY), 'active')
    `, [
      student_id, 
      incident_details.incident_type, 
      severity_level, 
      incident_details.description,
      interventionPlan.immediate_actions.join('; '),
      JSON.stringify(interventionPlan),
      JSON.stringify(behaviorPattern),
      interventionPlan.follow_up_required,
      req.user.id,
      interventionPlan.expected_resolution_days
    ]);

    // Schedule follow-up actions
    for (const followUp of interventionPlan.follow_up_schedule) {
      await pool.execute(`
        INSERT INTO intervention_followups (
          disciplinary_action_id, followup_type, scheduled_date, 
          assigned_staff_id, description, status
        ) VALUES (?, ?, ?, ?, ?, 'pending')
      `, [
        result.insertId, 
        followUp.type, 
        followUp.scheduled_date, 
        followUp.assigned_staff_id || req.user.id, 
        followUp.description
      ]);
    }

    // Notify relevant stakeholders
    await notifyStakeholders(student_id, result.insertId, interventionPlan);

    res.json({
      success: true,
      message: 'Gahunda yo gukemura ikibazo yarakozwe neza',
      action_id: result.insertId,
      intervention_plan: interventionPlan,
      behavior_analysis: behaviorPattern,
      followup_count: interventionPlan.follow_up_schedule.length
    });
  } catch (error) {
    console.error('Disciplinary intervention error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ikosa mu gukora gahunda yo gukemura ikibazo' 
    });
  }
});

// 28. Intelligent Inventory and Stock Management
router.get('/operations/inventory/smart-analytics', [authenticateToken, requireRole('admin', 'stock_manager')], async (req, res) => {
  try {
    // Current inventory status with predictive analytics
    const [inventoryAnalytics] = await pool.execute(`
      SELECT 
        si.id,
        si.item_name,
        si.category,
        si.current_quantity,
        si.minimum_threshold,
        si.maximum_capacity,
        si.unit_cost,
        (si.current_quantity * si.unit_cost) as current_value,
        si.supplier_id,
        s.name as supplier_name,
        AVG(iu.quantity_used) as avg_daily_usage,
        CASE 
          WHEN si.current_quantity <= si.minimum_threshold THEN 'Bikenewe byihuse'
          WHEN si.current_quantity <= (si.minimum_threshold * 1.5) THEN 'Bigomba gukurikiranwa'
          ELSE 'Byiza'
        END as stock_status,
        COALESCE((si.current_quantity / NULLIF(AVG(iu.quantity_used), 0)), 999) as days_remaining,
        COUNT(DISTINCT iu.id) as usage_frequency_week
      FROM stock_items si
      LEFT JOIN suppliers s ON si.supplier_id = s.id
      LEFT JOIN item_usage iu ON si.id = iu.item_id 
        AND iu.usage_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      GROUP BY si.id
      ORDER BY 
        CASE 
          WHEN si.current_quantity <= si.minimum_threshold THEN 1
          WHEN si.current_quantity <= (si.minimum_threshold * 1.5) THEN 2
          ELSE 3
        END,
        days_remaining ASC
    `);

    // Purchase recommendations based on usage patterns
    const [purchaseRecommendations] = await pool.execute(`
      SELECT 
        si.id,
        si.item_name,
        si.category,
        si.current_quantity,
        si.minimum_threshold,
        AVG(iu.quantity_used) * 30 as monthly_usage_projection,
        GREATEST(
          (AVG(iu.quantity_used) * 60) - si.current_quantity, 
          si.minimum_threshold * 2 - si.current_quantity
        ) as recommended_purchase_quantity,
        si.unit_cost,
        (GREATEST(
          (AVG(iu.quantity_used) * 60) - si.current_quantity, 
          si.minimum_threshold * 2 - si.current_quantity
        ) * si.unit_cost) as estimated_cost,
        s.name as preferred_supplier,
        s.lead_time_days,
        s.reliability_score
      FROM stock_items si
      LEFT JOIN suppliers s ON si.supplier_id = s.id
      LEFT JOIN item_usage iu ON si.id = iu.item_id 
        AND iu.usage_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      WHERE si.current_quantity <= (si.minimum_threshold * 2)
        OR (si.current_quantity / NULLIF(AVG(iu.quantity_used), 0)) <= 30
      GROUP BY si.id
      HAVING recommended_purchase_quantity > 0
      ORDER BY 
        CASE 
          WHEN si.current_quantity <= si.minimum_threshold THEN 1
          ELSE 2
        END,
        estimated_cost DESC
    `);

    // Waste and efficiency analysis
    const [wasteAnalysis] = await pool.execute(`
      SELECT 
        si.category,
        SUM(w.quantity_wasted) as total_waste_quantity,
        SUM(w.quantity_wasted * si.unit_cost) as total_waste_value,
        AVG(w.waste_percentage) as average_waste_percentage,
        COUNT(DISTINCT w.id) as waste_incidents,
        w.primary_cause,
        COUNT(*) as cause_frequency
      FROM waste_records w
      JOIN stock_items si ON w.item_id = si.id
      WHERE w.waste_date >= DATE_SUB(CURDATE(), INTERVAL 90 DAY)
      GROUP BY si.category, w.primary_cause
      ORDER BY total_waste_value DESC
    `);

    // Supplier performance metrics
    const [supplierPerformance] = await pool.execute(`
      SELECT 
        s.id,
        s.name as supplier_name,
        s.contact_info,
        COUNT(DISTINCT po.id) as orders_count_90days,
        AVG(DATEDIFF(po.delivered_date, po.order_date)) as avg_delivery_time,
        AVG(po.quality_rating) as avg_quality_rating,
        SUM(po.total_amount) as total_purchase_value_90days,
        COUNT(CASE WHEN po.delivered_date <= po.expected_delivery_date THEN 1 END) / COUNT(po.id) * 100 as on_time_delivery_rate,
        s.reliability_score,
        s.cost_competitiveness_score
      FROM suppliers s
      LEFT JOIN purchase_orders po ON s.id = po.supplier_id
        AND po.order_date >= DATE_SUB(CURDATE(), INTERVAL 90 DAY)
      GROUP BY s.id
      ORDER BY 
        (s.reliability_score + s.cost_competitiveness_score + 
         COALESCE(AVG(po.quality_rating), 0) * 20) / 3 DESC
    `);

    res.json({
      success: true,
      message: 'Isesengura ry\'ibikoresho n\'ibicuruzwa ryashyizweho',
      inventory_analytics: inventoryAnalytics,
      purchase_recommendations: purchaseRecommendations,
      waste_analysis: wasteAnalysis,
      supplier_performance: supplierPerformance,
      total_inventory_value: inventoryAnalytics.reduce((sum, item) => sum + item.current_value, 0),
      critical_items_count: inventoryAnalytics.filter(item => item.stock_status === 'Bikenewe byihuse').length
    });
  } catch (error) {
    console.error('Inventory analytics error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ikosa mu gusesengura ibikoresho n\'ibicuruzwa' 
    });
  }
});

// 29. Advanced Event Management and Coordination
router.post('/operations/events/comprehensive-planning', [authenticateToken, requireRole('admin', 'event_coordinator')], async (req, res) => {
  try {
    const { 
      event_details, 
      resource_requirements, 
      participant_criteria, 
      budget_allocation,
      timeline_preferences 
    } = req.body;

    // Check resource availability
    const resourceAvailability = await checkResourceAvailability(event_details.date, resource_requirements);
    
    // Generate comprehensive event plan
    const eventPlan = await generateEventPlan(event_details, resource_requirements, budget_allocation);
    
    // Create main event record
    const [eventResult] = await pool.execute(`
      INSERT INTO events (
        title, description, event_type, event_date, start_time, end_time,
        location, expected_participants, budget_allocated, status,
        created_by, planning_details, resource_requirements
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'planning', ?, ?, ?)
    `, [
      event_details.title,
      event_details.description,
      event_details.type,
      event_details.date,
      event_details.start_time,
      event_details.end_time,
      event_details.location,
      event_details.expected_participants,
      budget_allocation.total_budget,
      req.user.id,
      JSON.stringify(eventPlan),
      JSON.stringify(resource_requirements)
    ]);

    const eventId = eventResult.insertId;

    // Create event tasks and timeline
    for (const task of eventPlan.tasks) {
      await pool.execute(`
        INSERT INTO event_tasks (
          event_id, task_name, description, assigned_to, 
          due_date, priority, estimated_hours, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
      `, [
        eventId, task.name, task.description, task.assigned_to,
        task.due_date, task.priority, task.estimated_hours
      ]);
    }

    // Reserve resources
    for (const resource of eventPlan.resource_reservations) {
      await pool.execute(`
        INSERT INTO resource_reservations (
          event_id, resource_type, resource_id, reserved_date,
          start_time, end_time, quantity_reserved, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        eventId, resource.type, resource.id, event_details.date,
        resource.start_time, resource.end_time, resource.quantity, resource.notes
      ]);
    }

    // Create budget breakdown
    for (const [category, amount] of Object.entries(budget_allocation.breakdown)) {
      await pool.execute(`
        INSERT INTO event_budget_items (
          event_id, category, allocated_amount, spent_amount, description
        ) VALUES (?, ?, ?, 0, ?)
      `, [
        eventId, category, amount, `Amafaranga y'${category} mu mukino`
      ]);
    }

    // Generate participant invitations based on criteria
    const eligibleParticipants = await findEligibleParticipants(participant_criteria);
    
    for (const participant of eligibleParticipants) {
      await pool.execute(`
        INSERT INTO event_invitations (
          event_id, participant_id, invitation_type, sent_date, status
        ) VALUES (?, ?, ?, NOW(), 'sent')
      `, [eventId, participant.id, participant.type]);
    }

    res.json({
      success: true,
      message: 'Gahunda y\'umukino yarakozwe neza',
      event_id: eventId,
      event_plan: eventPlan,
      resource_availability: resourceAvailability,
      invited_participants: eligibleParticipants.length,
      estimated_cost: eventPlan.total_estimated_cost
    });
  } catch (error) {
    console.error('Event planning error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ikosa mu gutegura umukino' 
    });
  }
});

// 30. Comprehensive Facility Management
router.get('/operations/facilities/maintenance-intelligence', [authenticateToken, requireRole('admin', 'facility_manager')], async (req, res) => {
  try {
    // Predictive maintenance analysis
    const [maintenanceAnalytics] = await pool.execute(`
      SELECT 
        f.id,
        f.facility_name,
        f.facility_type,
        f.location,
        f.installation_date,
        DATEDIFF(CURDATE(), f.installation_date) as age_days,
        f.condition_score,
        f.last_maintenance_date,
        DATEDIFF(CURDATE(), f.last_maintenance_date) as days_since_maintenance,
        f.maintenance_interval_days,
        (f.maintenance_interval_days - DATEDIFF(CURDATE(), f.last_maintenance_date)) as days_until_maintenance,
        COUNT(DISTINCT mr.id) as maintenance_requests_month,
        AVG(mr.urgency_level) as avg_urgency_level,
        SUM(mr.estimated_cost) as maintenance_cost_month,
        f.expected_lifespan_years,
        ((DATEDIFF(CURDATE(), f.installation_date) / 365.0) / f.expected_lifespan_years * 100) as lifecycle_percentage,
        CASE 
          WHEN DATEDIFF(CURDATE(), f.last_maintenance_date) > f.maintenance_interval_days THEN 'Bikenewe byihuse'
          WHEN DATEDIFF(CURDATE(), f.last_maintenance_date) > (f.maintenance_interval_days * 0.8) THEN 'Bigomba guteguwa'
          ELSE 'Byiza'
        END as maintenance_status
      FROM facilities f
      LEFT JOIN maintenance_requests mr ON f.id = mr.facility_id 
        AND mr.request_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      GROUP BY f.id
      ORDER BY days_until_maintenance ASC
    `);

    // Energy efficiency analysis
    const [energyAnalysis] = await pool.execute(`
      SELECT 
        f.facility_name,
        f.facility_type,
        eu.month_year,
        SUM(eu.electricity_kwh) as total_electricity_kwh,
        SUM(eu.water_cubic_meters) as total_water_m3,
        SUM(eu.electricity_cost + eu.water_cost + eu.other_utilities_cost) as total_utility_cost,
        (SUM(eu.electricity_kwh) / f.floor_area_sqm) as energy_intensity_per_sqm,
        LAG(SUM(eu.electricity_kwh)) OVER (PARTITION BY f.id ORDER BY eu.month_year) as prev_month_electricity,
        ((SUM(eu.electricity_kwh) - LAG(SUM(eu.electricity_kwh)) OVER (PARTITION BY f.id ORDER BY eu.month_year)) / 
         LAG(SUM(eu.electricity_kwh)) OVER (PARTITION BY f.id ORDER BY eu.month_year) * 100) as energy_change_percentage
      FROM facilities f
      JOIN energy_usage eu ON f.id = eu.facility_id
      WHERE eu.month_year >= DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 12 MONTH), '%Y-%m')
      GROUP BY f.id, eu.month_year
      ORDER BY f.id, eu.month_year DESC
    `);

    // Safety and compliance tracking
    const [safetyCompliance] = await pool.execute(`
      SELECT 
        f.id,
        f.facility_name,
        sc.compliance_area,
        sc.last_inspection_date,
        sc.next_inspection_due,
        DATEDIFF(sc.next_inspection_due, CURDATE()) as days_until_inspection,
        sc.compliance_score,
        sc.violations_count,
        sc.critical_issues_count,
        CASE 
          WHEN sc.next_inspection_due < CURDATE() THEN 'Ararenze igihe'
          WHEN DATEDIFF(sc.next_inspection_due, CURDATE()) <= 7 THEN 'Bigomba gukozwa byihuse'
          WHEN DATEDIFF(sc.next_inspection_due, CURDATE()) <= 30 THEN 'Bigomba guteguwa'
          ELSE 'Byiza'
        END as inspection_status,
        si.incident_count_month,
        si.severity_avg
      FROM facilities f
      JOIN safety_compliance sc ON f.id = sc.facility_id
      LEFT JOIN (
        SELECT 
          facility_id, 
          COUNT(*) as incident_count_month,
          AVG(severity_level) as severity_avg
        FROM safety_incidents 
        WHERE incident_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        GROUP BY facility_id
      ) si ON f.id = si.facility_id
      ORDER BY days_until_inspection ASC, sc.critical_issues_count DESC
    `);

    // Space utilization optimization
    const [spaceUtilization] = await pool.execute(`
      SELECT 
        r.facility_id,
        f.facility_name,
        r.id as room_id,
        r.name as room_name,
        r.capacity,
        r.room_type,
        COUNT(DISTINCT rb.id) as bookings_week,
        SUM(rb.duration_hours) as total_hours_booked_week,
        (SUM(rb.duration_hours) / (7 * 12)) * 100 as utilization_percentage,
        AVG(rb.actual_attendees) as avg_attendees,
        (AVG(rb.actual_attendees) / r.capacity * 100) as capacity_utilization,
        COUNT(DISTINCT CASE WHEN rb.booking_status = 'cancelled' THEN rb.id END) as cancellations_week
      FROM rooms r
      JOIN facilities f ON r.facility_id = f.id
      LEFT JOIN room_bookings rb ON r.id = rb.room_id 
        AND rb.booking_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      GROUP BY r.id
      ORDER BY utilization_percentage DESC
    `);

    res.json({
      success: true,
      message: 'Isesengura ry\'ibyubatswe n\'ibikoresho ryashyizweho',
      maintenance_analytics: maintenanceAnalytics,
      energy_analysis: energyAnalysis,
      safety_compliance: safetyCompliance,
      space_utilization: spaceUtilization,
      summary: {
        facilities_needing_maintenance: maintenanceAnalytics.filter(f => f.maintenance_status === 'Bikenewe byihuse').length,
        overdue_inspections: safetyCompliance.filter(s => s.inspection_status === 'Ararenze igihe').length,
        underutilized_spaces: spaceUtilization.filter(s => s.utilization_percentage < 30).length,
        total_monthly_utility_cost: energyAnalysis.reduce((sum, e) => sum + (e.total_utility_cost || 0), 0)
      }
    });
  } catch (error) {
    console.error('Facility management error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ikosa mu gucunga ibyubatswe n\'ibikoresho' 
    });
  }
});

// Helper functions for advanced operations

function generateResourceOptimizationRecommendations(classrooms, teachers, equipment) {
  const recommendations = [];

  // Classroom optimization
  const underutilizedRooms = classrooms.filter(room => room.utilization_percentage < 60);
  if (underutilizedRooms.length > 0) {
    recommendations.push({
      category: 'Ikoreshwa ry\'amacumbi',
      priority: 'Biringaniye',
      description: `${underutilizedRooms.length} y\'amacumbi akoresha munsi ya 60%`,
      actions: ['Guhindura gahunda y\'amasomo', 'Kwimura amasomo ajya hamwe']
    });
  }

  // Teacher workload balancing
  const overworkedTeachers = teachers.filter(teacher => teacher.workload_status === 'Akazi karengeye');
  if (overworkedTeachers.length > 0) {
    recommendations.push({
      category: 'Umubare w\'akazi k\'abarimu',
      priority: 'Byihuse',
      description: `${overworkedTeachers.length} babarimu bafite akazi karengeye`,
      actions: ['Gusabana akazi', 'Kongera abarimu', 'Guhindura gahunda y\'amasomo']
    });
  }

  // Equipment utilization
  const underutilizedEquipment = equipment.filter(eq => eq.target_achievement_percentage < 50);
  if (underutilizedEquipment.length > 0) {
    recommendations.push({
      category: 'Ikoreshwa ry\'ibikoresho',
      priority: 'Biringaniye',
      description: `${underutilizedEquipment.length} by\'ibikoresho bikoreshwa munsi ya 50%`,
      actions: ['Kongera amahugurwa', 'Guhindura aho bikoreshwa', 'Gusaba abakozi gukoresha']
    });
  }

  return recommendations;
}

function analyzeBehaviorPattern(history) {
  if (!history || history.length === 0) {
    return {
      pattern_type: 'Nta mateka',
      frequency: 0,
      escalation_trend: 'none',
      risk_level: 'low'
    };
  }

  const recentIncidents = history.filter(incident => incident.days_ago <= 30);
  const frequency = recentIncidents.length;
  
  let escalationTrend = 'stable';
  if (history.length >= 3) {
    const recent = history.slice(0, 3);
    const severityLevels = { 'low': 1, 'medium': 2, 'high': 3, 'critical': 4 };
    const severityScores = recent.map(inc => severityLevels[inc.severity_level] || 1);
    
    if (severityScores[0] > severityScores[2]) {
      escalationTrend = 'increasing';
    } else if (severityScores[0] < severityScores[2]) {
      escalationTrend = 'decreasing';
    }
  }

  let riskLevel = 'low';
  if (frequency > 5) riskLevel = 'high';
  else if (frequency > 2) riskLevel = 'medium';

  return {
    pattern_type: frequency > 3 ? 'Ibisubiramo' : 'Bya gisirikare',
    frequency: frequency,
    escalation_trend: escalationTrend,
    risk_level: riskLevel,
    most_common_type: getMostCommonIncidentType(history)
  };
}

function getMostCommonIncidentType(history) {
  const typeCounts = {};
  history.forEach(incident => {
    typeCounts[incident.incident_type] = (typeCounts[incident.incident_type] || 0) + 1;
  });
  
  return Object.keys(typeCounts).reduce((a, b) => 
    typeCounts[a] > typeCounts[b] ? a : b, 
    'Bitazwi'
  );
}

function generateInterventionPlan(incidentDetails, severityLevel, behaviorPattern) {
  const plan = {
    immediate_actions: [],
    long_term_strategies: [],
    follow_up_schedule: [],
    expected_resolution_days: 30,
    follow_up_required: true,
    stakeholders_to_notify: []
  };

  // Immediate actions based on severity
  switch (severityLevel) {
    case 'critical':
      plan.immediate_actions = [
        'Kubahiriza mu kigo',
        'Guhamagara ababyeyi',
        'Gusaba ubufasha bw\'umuganga w\'ubwoba'
      ];
      plan.expected_resolution_days = 60;
      plan.stakeholders_to_notify = ['ababyeyi', 'umuyobozi', 'umuganga w\'ubwoba'];
      break;
    case 'high':
      plan.immediate_actions = [
        'Gushyira ku ruhagaruru',
        'Guhamagara ababyeyi',
        'Gukora ikiganiro n\'umujyanama'
      ];
      plan.expected_resolution_days = 45;
      plan.stakeholders_to_notify = ['ababyeyi', 'umuyobozi'];
      break;
    case 'medium':
      plan.immediate_actions = [
        'Kwicuza mu gufata ibyemezo',
        'Gukora ikiganiro',
        'Gusaba ibibazo ku myitwarire'
      ];
      plan.expected_resolution_days = 30;
      plan.stakeholders_to_notify = ['ababyeyi'];
      break;
    default:
      plan.immediate_actions = [
        'Kwibwira ku myitwarire',
        'Gukora ikiganiro'
      ];
      plan.expected_resolution_days = 15;
  }

  // Long-term strategies based on behavior pattern
  if (behaviorPattern.risk_level === 'high') {
    plan.long_term_strategies = [
      'Gukora gahunda yo guhindura imyitwarire',
      'Gushyiraho ubufasha bw\'umuganga w\'ubwoba',
      'Gukurikirana buri gihe'
    ];
  }

  // Follow-up schedule
  plan.follow_up_schedule = [
    {
      type: 'Gukurikirana kwambere',
      scheduled_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      description: 'Kureba niba ikibazo gifite igisubizo'
    },
    {
      type: 'Gukurikirana kwa kabiri',
      scheduled_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      description: 'Gusuzuma iterambere'
    }
  ];

  return plan;
}

async function notifyStakeholders(studentId, actionId, interventionPlan) {
  // Send notifications to relevant stakeholders
  for (const stakeholder of interventionPlan.stakeholders_to_notify) {
    // Implementation for notification sending
    console.log(`Sending notification to ${stakeholder} about disciplinary action ${actionId}`);
  }
}

async function checkResourceAvailability(eventDate, requirements) {
  const availability = {
    rooms: [],
    equipment: [],
    staff: [],
    conflicts: []
  };

  // Check room availability
  for (const room of requirements.rooms || []) {
    const [conflicts] = await pool.execute(`
      SELECT COUNT(*) as conflict_count FROM room_bookings 
      WHERE room_id = ? AND booking_date = ? 
      AND ((start_time <= ? AND end_time > ?) OR (start_time < ? AND end_time >= ?))
      AND booking_status != 'cancelled'
    `, [room.id, eventDate, room.start_time, room.start_time, room.end_time, room.end_time]);
    
    availability.rooms.push({
      room_id: room.id,
      available: conflicts[0].conflict_count === 0,
      conflicts: conflicts[0].conflict_count
    });
  }

  return availability;
}

async function generateEventPlan(eventDetails, requirements, budget) {
  const plan = {
    tasks: [],
    resource_reservations: [],
    timeline: [],
    total_estimated_cost: 0,
    risk_assessment: []
  };

  // Generate tasks based on event type
  const taskTemplates = await getEventTaskTemplates(eventDetails.type);
  
  plan.tasks = taskTemplates.map(template => ({
    name: template.task_name,
    description: template.description,
    assigned_to: template.default_assignee,
    due_date: calculateTaskDueDate(eventDetails.date, template.days_before_event),
    priority: template.priority,
    estimated_hours: template.estimated_hours
  }));

  // Calculate total cost
  plan.total_estimated_cost = Object.values(budget.breakdown || {}).reduce((sum, amount) => sum + amount, 0);

  return plan;
}

async function getEventTaskTemplates(eventType) {
  const [templates] = await pool.execute(`
    SELECT * FROM event_task_templates WHERE event_type = ? OR event_type = 'general'
    ORDER BY days_before_event DESC
  `, [eventType]);
  
  return templates;
}

function calculateTaskDueDate(eventDate, daysBefore) {
  const dueDate = new Date(eventDate);
  dueDate.setDate(dueDate.getDate() - daysBefore);
  return dueDate.toISOString().split('T')[0];
}

async function findEligibleParticipants(criteria) {
  let query = 'SELECT id, name, email, role as type FROM users WHERE status = "active"';
  const params = [];

  if (criteria.roles && criteria.roles.length > 0) {
    query += ' AND role IN (' + criteria.roles.map(() => '?').join(',') + ')';
    params.push(...criteria.roles);
  }

  if (criteria.grades && criteria.grades.length > 0) {
    query += ` AND id IN (
      SELECT student_id FROM students s 
      JOIN classes c ON s.class_id = c.id 
      WHERE c.grade_level IN (${criteria.grades.map(() => '?').join(',')})
    )`;
    params.push(...criteria.grades);
  }

  const [participants] = await pool.execute(query, params);
  return participants;
}

module.exports = router;