// ==================================================
// ADVANCED SECURITY & AUDIT APIs (21-40)
// ==================================================
// Umutekano wa kijyambere - Advanced Security
// Ibyo kureba - Audit Features

const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
const router = express.Router();

// Database connection
const db = require('../config/database');
const auth = require('../middleware/auth');

// ==================================================
// SECURITY MONITORING APIS (21-30)
// ==================================================

// 21. API ya Advanced Authentication Monitoring
router.get('/security/auth-logs', auth, async (req, res) => {
  try {
    const { 
      start_date = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end_date = new Date().toISOString().split('T')[0],
      suspicious_only = 'false',
      limit = 100 
    } = req.query;

    let whereClause = 'WHERE aal.attempted_at BETWEEN ? AND ?';
    const params = [start_date, end_date];

    if (suspicious_only === 'true') {
      whereClause += ' AND (aal.suspicious_activity = true OR aal.risk_score > 70)';
    }

    const [authLogs] = await db.execute(`
      SELECT 
        aal.id,
        aal.user_id as ukoresha_id,
        u.first_name as izina_rya_mbere,
        u.last_name as izina_rya_nyuma,
        aal.login_attempt as kugerageza_kwinjira,
        aal.success as byakunze,
        aal.failure_reason as impamvu_yo_kunanirwa,
        aal.ip_address as aderesi_ya_IP,
        aal.location_data as amakuru_yaho_biva,
        aal.risk_score as ubwoba_bw_akaga,
        aal.suspicious_activity as ibikorwa_bikekwaho,
        aal.blocked as byahagaritswe,
        aal.attempted_at as igihe_cyageragejwe
      FROM advanced_auth_logs aal
      LEFT JOIN users u ON aal.user_id = u.id
      ${whereClause}
      ORDER BY aal.attempted_at DESC, aal.risk_score DESC
      LIMIT ?
    `, [...params, parseInt(limit)]);

    res.json({
      ubwoba: false,
      amakuru_yumutekano: authLogs.map(log => ({
        id: log.id,
        ukoresha: log.ukoresha_id ? {
          id: log.ukoresha_id,
          izina: `${log.izina_rya_mbere || ''} ${log.izina_rya_nyuma || ''}`.trim()
        } : null,
        kugerageza_kwinjira: log.kugerageza_kwinjira,
        byakunze: log.byakunze,
        impamvu_yo_kunanirwa: log.impamvu_yo_kunanirwa,
        aderesi_ya_IP: log.aderesi_ya_IP,
        amakuru_yaho_biva: JSON.parse(log.amakuru_yaho_biva || '{}'),
        ubwoba_bw_akaga: parseFloat(log.ubwoba_bw_akaga),
        ibikorwa_bikekwaho: log.ibikorwa_bikekwaho,
        byahagaritswe: log.byahagaritswe,
        igihe: log.igihe_cyageragejwe
      }))
    });
  } catch (error) {
    res.status(500).json({ ubwoba: true, ubutumwa: 'Habaye ikosa mu gusuzuma umutekano' });
  }
});

// 22. API ya Security Risk Assessment
router.get('/security/risk-assessment/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;

    // Gusuzuma ubwoba bw'akaga - Risk assessment
    const [riskData] = await db.execute(`
      SELECT 
        COUNT(CASE WHEN success = false THEN 1 END) as kunanirwa,
        COUNT(CASE WHEN suspicious_activity = true THEN 1 END) as ibikorwa_bikekwaho,
        AVG(risk_score) as ubwoba_bwagereranije,
        COUNT(DISTINCT ip_address) as IP_zitandukanye,
        MAX(attempted_at) as kugerageza_kwa_nyuma
      FROM advanced_auth_logs 
      WHERE user_id = ? AND attempted_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    `, [userId]);

    // Ibikorwa bikekwaho - Suspicious activities
    const [suspiciousActivities] = await db.execute(`
      SELECT 
        at.action_type as igikorwa,
        at.resource_type as igikoresho,
        at.risk_level as urwego_rwubwoba,
        at.timestamp as igihe
      FROM audit_trails at
      WHERE at.user_id = ? AND at.risk_level IN ('high', 'critical')
        AND at.timestamp >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      ORDER BY at.timestamp DESC
      LIMIT 10
    `, [userId]);

    const riskScore = calculateRiskScore(riskData[0]);

    res.json({
      ubwoba: false,
      isuzuma_ryakaga: {
        ukoresha_id: parseInt(userId),
        ubwoba_bwagereranije: riskScore,
        urwego: getRiskLevel(riskScore),
        imibare: {
          kunanirwa: riskData[0].kunanirwa,
          ibikorwa_bikekwaho: riskData[0].ibikorwa_bikekwaho,
          IP_zitandukanye: riskData[0].IP_zitandukanye,
          kugerageza_kwa_nyuma: riskData[0].kugerageza_kwa_nyuma
        },
        ibikorwa_bikekwaho: suspiciousActivities
      }
    });
  } catch (error) {
    res.status(500).json({ ubwoba: true, ubutumwa: 'Habaye ikosa mu gusuzuma akaga' });
  }
});

// 23. API ya Security Incidents Management
router.get('/security/incidents', auth, async (req, res) => {
  try {
    const { 
      status = 'all',
      severity = 'all',
      limit = 50 
    } = req.query;

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (status !== 'all') {
      whereClause += ' AND si.status = ?';
      params.push(status);
    }

    if (severity !== 'all') {
      whereClause += ' AND si.severity = ?';
      params.push(severity);
    }

    const [incidents] = await db.execute(`
      SELECT 
        si.id,
        si.incident_type as ubwoko,
        si.severity as ukomeye,
        si.title as umutwe,
        si.description as ibisobanuro,
        si.affected_users as abakorewaho,
        si.affected_resources as ibikoresho_byakorewaho,
        si.detection_method as uburyo_bwaboneyeho,
        si.status as uko_bimeze,
        si.assigned_to as wahawe,
        si.detected_at as byaboneyeho,
        si.resolved_at as byakemutwe,
        u.first_name as izina_wahawe,
        u.last_name as irindi_zina_wahawe
      FROM security_incidents si
      LEFT JOIN users u ON si.assigned_to = u.id
      ${whereClause}
      ORDER BY si.severity DESC, si.detected_at DESC
      LIMIT ?
    `, [...params, parseInt(limit)]);

    res.json({
      ubwoba: false,
      amakuru_yakaga: incidents.map(incident => ({
        id: incident.id,
        ubwoko: incident.ubwoko,
        ukomeye: incident.ukomeye,
        umutwe: incident.umutwe,
        ibisobanuro: incident.ibisobanuro,
        abakorewaho: JSON.parse(incident.abakorewaho || '[]'),
        ibikoresho_byakorewaho: JSON.parse(incident.ibikoresho_byakorewaho || '[]'),
        uburyo_bwaboneyeho: incident.uburyo_bwaboneyeho,
        uko_bimeze: incident.uko_bimeze,
        wahawe: incident.wahawe ? {
          id: incident.wahawe,
          izina: `${incident.izina_wahawe} ${incident.irindi_zina_wahawe}`
        } : null,
        byaboneyeho: incident.byaboneyeho,
        byakemutwe: incident.byakemutwe
      }))
    });
  } catch (error) {
    res.status(500).json({ ubwoba: true, ubutumwa: 'Habaye ikosa mu gushaka amakuru y\'akaga' });
  }
});

// 24. API yo Gukemura Amakuru y'Akaga - Resolve Security Incident
router.put('/security/incidents/:id/resolve', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { resolution_notes } = req.body;

    await db.execute(`
      UPDATE security_incidents 
      SET status = 'resolved', resolution_notes = ?, resolved_at = NOW()
      WHERE id = ?
    `, [resolution_notes, id]);

    res.json({
      ubwoba: false,
      ubutumwa: 'Ikibazo cyakemutwe neza'
    });
  } catch (error) {
    res.status(500).json({ ubwoba: true, ubutumwa: 'Habaye ikosa mu gukemura ikibazo' });
  }
});

// 25. API ya System Security Health Check
router.get('/security/health-check', auth, async (req, res) => {
  try {
    // Gusuzuma ubwoba bwa sisitemu - System security assessment
    const [recentThreats] = await db.execute(`
      SELECT COUNT(*) as threats FROM security_incidents 
      WHERE detected_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR) AND severity IN ('high', 'critical')
    `);

    const [failedLogins] = await db.execute(`
      SELECT COUNT(*) as failed FROM advanced_auth_logs 
      WHERE attempted_at >= DATE_SUB(NOW(), INTERVAL 1 HOUR) AND success = false
    `);

    const [suspiciousActivities] = await db.execute(`
      SELECT COUNT(*) as suspicious FROM audit_trails 
      WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 6 HOUR) AND risk_level IN ('high', 'critical')
    `);

    const [activeConnections] = await db.execute(`
      SELECT COUNT(*) as active FROM websocket_connections WHERE is_active = true
    `);

    const securityScore = calculateSecurityScore({
      threats: recentThreats[0].threats,
      failedLogins: failedLogins[0].failed,
      suspiciousActivities: suspiciousActivities[0].suspicious
    });

    res.json({
      ubwoba: false,
      ubuzima_bwumutekano: {
        amanota: securityScore,
        urwego: getSecurityLevel(securityScore),
        imiterere: {
          iterabwoba_ryakaga: recentThreats[0].threats,
          kunanirwa_kwinjira: failedLogins[0].failed,
          ibikorwa_bikekwaho: suspiciousActivities[0].suspicious,
          abunze_ubu: activeConnections[0].active
        },
        amakuru: getSecurityRecommendations(securityScore)
      }
    });
  } catch (error) {
    res.status(500).json({ ubwoba: true, ubutumwa: 'Habaye ikosa mu gusuzuma ubuzima bw\'umutekano' });
  }
});

// ==================================================
// AUDIT TRAIL APIS (26-35)
// ==================================================

// 26. API ya Comprehensive Audit Trail
router.get('/audit/trail', auth, async (req, res) => {
  try {
    const { 
      user_id = null,
      action_type = null,
      resource_type = null,
      risk_level = 'all',
      start_date = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end_date = new Date().toISOString().split('T')[0],
      limit = 100 
    } = req.query;

    let whereClause = 'WHERE at.timestamp BETWEEN ? AND ?';
    const params = [start_date, end_date];

    if (user_id) {
      whereClause += ' AND at.user_id = ?';
      params.push(user_id);
    }

    if (action_type) {
      whereClause += ' AND at.action_type = ?';
      params.push(action_type);
    }

    if (resource_type) {
      whereClause += ' AND at.resource_type = ?';
      params.push(resource_type);
    }

    if (risk_level !== 'all') {
      whereClause += ' AND at.risk_level = ?';
      params.push(risk_level);
    }

    const [auditTrail] = await db.execute(`
      SELECT 
        at.id,
        at.user_id as ukoresha_id,
        u.first_name as izina_rya_mbere,
        u.last_name as izina_rya_nyuma,
        at.action_type as igikorwa,
        at.resource_type as igikoresho,
        at.resource_id as igikoresho_id,
        at.action_description as ibisobanuro,
        at.old_values as agaciro_kashize,
        at.new_values as agaciro_gashya,
        at.ip_address as aderesi_ya_IP,
        at.risk_level as urwego_rwubwoba,
        at.timestamp as igihe
      FROM audit_trails at
      LEFT JOIN users u ON at.user_id = u.id
      ${whereClause}
      ORDER BY at.timestamp DESC
      LIMIT ?
    `, [...params, parseInt(limit)]);

    res.json({
      ubwoba: false,
      amakuru_yo_gukurikirana: auditTrail.map(trail => ({
        id: trail.id,
        ukoresha: trail.ukoresha_id ? {
          id: trail.ukoresha_id,
          izina: `${trail.izina_rya_mbere || ''} ${trail.izina_rya_nyuma || ''}`.trim()
        } : null,
        igikorwa: trail.igikorwa,
        igikoresho: trail.igikoresho,
        igikoresho_id: trail.igikoresho_id,
        ibisobanuro: trail.ibisobanuro,
        agaciro_kashize: JSON.parse(trail.agaciro_kashize || '{}'),
        agaciro_gashya: JSON.parse(trail.agaciro_gashya || '{}'),
        aderesi_ya_IP: trail.aderesi_ya_IP,
        urwego_rwubwoba: trail.urwego_rwubwoba,
        igihe: trail.igihe
      }))
    });
  } catch (error) {
    res.status(500).json({ ubwoba: true, ubutumwa: 'Habaye ikosa mu gushaka amakuru yo gukurikirana' });
  }
});

// 27. API ya User Activity Analytics
router.get('/audit/user-activity/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { days = 30 } = req.query;

    const [activitySummary] = await db.execute(`
      SELECT 
        at.action_type as igikorwa,
        COUNT(*) as umubare,
        at.risk_level as urwego_rwubwoba,
        DATE(at.timestamp) as italiki
      FROM audit_trails at
      WHERE at.user_id = ? AND at.timestamp >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY at.action_type, at.risk_level, DATE(at.timestamp)
      ORDER BY italiki DESC, umubare DESC
    `, [userId, parseInt(days)]);

    const [recentActions] = await db.execute(`
      SELECT 
        at.action_type as igikorwa,
        at.resource_type as igikoresho,
        at.action_description as ibisobanuro,
        at.risk_level as urwego_rwubwoba,
        at.timestamp as igihe
      FROM audit_trails at
      WHERE at.user_id = ?
      ORDER BY at.timestamp DESC
      LIMIT 20
    `, [userId]);

    res.json({
      ubwoba: false,
      ibikorwa_byukoresha: {
        incamake: activitySummary,
        ibikorwa_bya_vuba: recentActions,
        imibare: {
          ibikorwa_byose: activitySummary.reduce((sum, activity) => sum + activity.umubare, 0),
          ubwoba_bukomeyebure: activitySummary.filter(a => a.urwego_rwubwoba === 'high').length,
          amatsinda: [...new Set(activitySummary.map(a => a.igikorwa))].length
        }
      }
    });
  } catch (error) {
    res.status(500).json({ ubwoba: true, ubutumwa: 'Habaye ikosa mu gusesengura ibikorwa by\'ukoresha' });
  }
});

// 28. API ya Compliance Reporting
router.get('/audit/compliance-report', auth, async (req, res) => {
  try {
    const { 
      start_date = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end_date = new Date().toISOString().split('T')[0] 
    } = req.query;

    // Gukurikirana amategeko - Compliance tracking
    const [complianceData] = await db.execute(`
      SELECT 
        at.compliance_flags as amategeko,
        COUNT(*) as umubare,
        at.risk_level as urwego_rwubwoba
      FROM audit_trails at
      WHERE at.timestamp BETWEEN ? AND ? 
        AND at.compliance_flags IS NOT NULL
      GROUP BY at.compliance_flags, at.risk_level
    `, [start_date, end_date]);

    // Ibintu bibujije amategeko - Policy violations
    const [violations] = await db.execute(`
      SELECT 
        at.action_type as igikorwa,
        at.resource_type as igikoresho,
        at.user_id as ukoresha_id,
        u.first_name as izina_rya_mbere,
        u.last_name as izina_rya_nyuma,
        at.compliance_flags as amategeko_yarangwa,
        at.timestamp as igihe
      FROM audit_trails at
      LEFT JOIN users u ON at.user_id = u.id
      WHERE at.timestamp BETWEEN ? AND ?
        AND JSON_CONTAINS(at.compliance_flags, '"violation"')
      ORDER BY at.timestamp DESC
    `, [start_date, end_date]);

    res.json({
      ubwoba: false,
      raporo_yamategeko: {
        intangiriro: start_date,
        iherezo: end_date,
        incamake: complianceData.map(data => ({
          amategeko: JSON.parse(data.amategeko || '[]'),
          umubare: data.umubare,
          urwego_rwubwoba: data.urwego_rwubwoba
        })),
        ibiyobora: violations.map(violation => ({
          igikorwa: violation.igikorwa,
          igikoresho: violation.igikoresho,
          ukoresha: {
            id: violation.ukoresha_id,
            izina: `${violation.izina_rya_mbere || ''} ${violation.izina_rya_nyuma || ''}`.trim()
          },
          amategeko_yarangwa: JSON.parse(violation.amategeko_yarangwa || '[]'),
          igihe: violation.igihe
        }))
      }
    });
  } catch (error) {
    res.status(500).json({ ubwoba: true, ubutumwa: 'Habaye ikosa mu gukora raporo y\'amategeko' });
  }
});

// Helper functions
function calculateRiskScore(riskData) {
  let score = 0;
  score += riskData.kunanirwa * 10; // Failed attempts
  score += riskData.ibikorwa_bikekwaho * 20; // Suspicious activities
  score += riskData.IP_zitandukanye * 5; // Different IPs
  
  return Math.min(score, 100);
}

function getRiskLevel(score) {
  if (score >= 80) return 'Akaga gakomeye';
  if (score >= 60) return 'Akaga';
  if (score >= 30) return 'Akaga gake';
  return 'Nta kaga';
}

function calculateSecurityScore(data) {
  let score = 100;
  score -= data.threats * 15;
  score -= Math.min(data.failedLogins / 10, 20);
  score -= data.suspiciousActivities * 10;
  
  return Math.max(score, 0);
}

function getSecurityLevel(score) {
  if (score >= 90) return 'Umutekano mwiza cyane';
  if (score >= 70) return 'Umutekano mwiza';
  if (score >= 50) return 'Umutekano uri hagati';
  return 'Umutekano mubi';
}

function getSecurityRecommendations(score) {
  const recommendations = [];
  
  if (score < 70) {
    recommendations.push('Kugenzura amabanga y\'abakoresha');
    recommendations.push('Kongera ubushobozi bwo kureba ibikorwa bikekwaho');
  }
  
  if (score < 50) {
    recommendations.push('Gushyiraho uburyo bushya bw\'umutekano');
    recommendations.push('Gutoza abakozi ku bijyanye n\'umutekano');
  }
  
  if (score < 30) {
    recommendations.push('Guhagarika sisitemu kugeza ibibazo bikemuka');
    recommendations.push('Gushaka ubufasha bw\'inzobere z\'umutekano');
  }
  
  return recommendations;
}

module.exports = router;