// ==================================================
// POWERFUL SCHOOL MANAGEMENT SYSTEM - 100 ADVANCED APIs
// ==================================================
// Ubushobozi bwa kijyambere - Advanced Capabilities
// All content in Kinyarwanda by default

const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const router = express.Router();

// Database connection
const db = require('../config/database');
const auth = require('../middleware/auth');

// ==================================================
// AI/ML & PREDICTIVE ANALYTICS APIs (1-15)
// ==================================================

// 1. API ya Gutegereza Ubushobozi bw'Abanyeshuri - Student Performance Prediction
router.get('/ai/predict-performance/:studentId', auth, async (req, res) => {
  try {
    const { studentId } = req.params;
    const { period = 'monthly' } = req.query;
    
    const [performance] = await db.execute(`
      SELECT 
        AVG(grade_value) as average_grade,
        AVG(attendance_percentage) as attendance_rate,
        COUNT(*) as total_assessments,
        (SELECT prediction_data FROM predictive_analytics 
         WHERE prediction_type = 'academic_performance' 
         ORDER BY created_at DESC LIMIT 1) as ai_prediction
      FROM fact_student_performance 
      WHERE student_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    `, [studentId]);

    const prediction = {
      umunyeshuri_id: studentId,
      gutegeza_amanota: performance[0]?.average_grade || 0,
      igice_cyo_kwitabira: performance[0]?.attendance_rate || 0,
      ubushobozi: performance[0]?.ai_prediction || null,
      icyemezo: performance[0]?.average_grade > 70 ? 'Byiza cyane' : 'Bikeneye ubufasha'
    };

    res.json({ ubwoba: false, amakuru: prediction });
  } catch (error) {
    res.status(500).json({ ubwoba: true, ubutumwa: 'Habaye ikosa mu gutegeza ubushobozi' });
  }
});

// 2. API yo Gutanga Inama za AI - AI Recommendations Engine
router.get('/ai/recommendations/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { type = 'academic' } = req.query;

    const [recommendations] = await db.execute(`
      SELECT 
        re.recommendation_type as ubwoko,
        re.recommended_items as ibintu,
        re.confidence_score as ukwizera,
        re.reasoning as impamvu,
        re.created_at as italiki
      FROM recommendation_engine re
      WHERE re.user_id = ? AND re.recommendation_type LIKE ?
      ORDER BY re.confidence_score DESC, re.created_at DESC
      LIMIT 10
    `, [userId, `%${type}%`]);

    res.json({ 
      ubwoba: false, 
      inama: recommendations.map(rec => ({
        ubwoko: rec.ubwoko,
        ibintu: JSON.parse(rec.ibintu || '[]'),
        ukwizera: rec.ukwizera,
        impamvu: rec.impamvu,
        italiki: rec.italiki
      }))
    });
  } catch (error) {
    res.status(500).json({ ubwoba: true, ubutumwa: 'Habaye ikosa mu gushaka inama' });
  }
});

// 3. API ya Ubumenyi bwa Otomatike - Automated Insights
router.get('/ai/insights', auth, async (req, res) => {
  try {
    const { severity = 'all', limit = 20 } = req.query;
    
    let whereClause = '';
    if (severity !== 'all') {
      whereClause = 'WHERE severity_level = ?';
    }

    const [insights] = await db.execute(`
      SELECT 
        ai.insight_type as ubwoko,
        ai.severity_level as urwego,
        ai.title as umutwe,
        ai.description as ibisobanuro,
        ai.insight_data as amakuru,
        ai.recommended_actions as ibikorwa,
        ai.status as uko_bimeze,
        ai.created_at as italiki
      FROM automated_insights ai
      ${whereClause}
      ORDER BY ai.severity_level DESC, ai.created_at DESC
      LIMIT ?
    `, severity !== 'all' ? [severity, parseInt(limit)] : [parseInt(limit)]);

    res.json({
      ubwoba: false,
      ubumenyi: insights.map(insight => ({
        ubwoko: insight.ubwoko,
        urwego: insight.urwego,
        umutwe: insight.umutwe,
        ibisobanuro: insight.ibisobanuro,
        amakuru: JSON.parse(insight.amakuru || '{}'),
        ibikorwa: JSON.parse(insight.ibikorwa || '[]'),
        uko_bimeze: insight.uko_bimeze,
        italiki: insight.italiki
      }))
    });
  } catch (error) {
    res.status(500).json({ ubwoba: true, ubutumwa: 'Habaye ikosa mu gushaka ubumenyi' });
  }
});

// 4. API ya Forecasting - Advanced Predictive Forecasts
router.get('/ai/forecasts/:type', auth, async (req, res) => {
  try {
    const { type } = req.params;
    const { period = 'monthly' } = req.query;

    const [forecasts] = await db.execute(`
      SELECT 
        pf.forecast_type as ubwoko,
        pf.forecast_period as igihe,
        pf.forecast_date as italiki,
        pf.forecast_data as amakuru,
        pf.accuracy_score as ukurira,
        pf.confidence_interval as urwego_rwukwizera,
        pf.influencing_factors as ibintu_bigira_uruhare
      FROM predictive_forecasts pf
      WHERE pf.forecast_type = ? AND pf.forecast_period = ?
      ORDER BY pf.forecast_date DESC
      LIMIT 12
    `, [type, period]);

    res.json({
      ubwoba: false,
      amategeko: forecasts.map(forecast => ({
        ubwoko: forecast.ubwoko,
        igihe: forecast.igihe,
        italiki: forecast.italiki,
        amakuru: JSON.parse(forecast.amakuru || '{}'),
        ukurira: forecast.ukurira,
        ukwizera: JSON.parse(forecast.urwego_rwukwizera || '{}'),
        ibintu_bigira_uruhare: JSON.parse(forecast.ibintu_bigira_uruhare || '[]')
      }))
    });
  } catch (error) {
    res.status(500).json({ ubwoba: true, ubutumwa: 'Habaye ikosa mu gushaka amategeko' });
  }
});

// 5. API ya Machine Learning Model Performance
router.get('/ai/model-performance', auth, async (req, res) => {
  try {
    const [performance] = await db.execute(`
      SELECT 
        prediction_type as ubwoko,
        AVG(accuracy_score) as ukurira_rwugereranije,
        AVG(confidence_level) as ukwizera_rwugereranije,
        COUNT(*) as umubare_wamategeko,
        MAX(created_at) as italiki_ya_nyuma,
        model_version as verisiyo
      FROM predictive_analytics
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY prediction_type, model_version
      ORDER BY ukurira_rwugereranije DESC
    `);

    res.json({
      ubwoba: false,
      imikorere: performance.map(perf => ({
        ubwoko: perf.ubwoko,
        ukurira: parseFloat(perf.ukurira_rwugereranije),
        ukwizera: parseFloat(perf.ukwizera_rwugereranije),
        amategeko: perf.umubare_wamategeko,
        italiki_ya_nyuma: perf.italiki_ya_nyuma,
        verisiyo: perf.verisiyo
      }))
    });
  } catch (error) {
    res.status(500).json({ ubwoba: true, ubutumwa: 'Habaye ikosa mu gusuzuma imikorere' });
  }
});

// ==================================================
// REAL-TIME FEATURES APIS (6-20)
// ==================================================

// 6. API ya WebSocket Connections Management
router.get('/realtime/connections', auth, async (req, res) => {
  try {
    const [connections] = await db.execute(`
      SELECT 
        wc.user_id as ukoresha_id,
        u.first_name as izina_rya_mbere,
        u.last_name as izina_rya_nyuma,
        wc.connected_at as igihe_cyunze,
        wc.last_activity as igikorwa_cya_nyuma,
        wc.is_active as ni_gikora
      FROM websocket_connections wc
      JOIN users u ON wc.user_id = u.id
      WHERE wc.is_active = true
      ORDER BY wc.connected_at DESC
    `);

    res.json({
      ubwoba: false,
      amahuriro: connections.map(conn => ({
        ukoresha: {
          id: conn.ukoresha_id,
          izina: `${conn.izina_rya_mbere} ${conn.izina_rya_nyuma}`
        },
        igihe_cyunze: conn.igihe_cyunze,
        igikorwa_cya_nyuma: conn.igikorwa_cya_nyuma,
        ni_gikora: conn.ni_gikora
      }))
    });
  } catch (error) {
    res.status(500).json({ ubwoba: true, ubutumwa: 'Habaye ikosa mu gushaka amahuriro' });
  }
});

// 7. API yo Kohereza Amakuru mu Gihe Nyacyo - Real-time Events
router.post('/realtime/broadcast', auth, async (req, res) => {
  try {
    const { 
      event_type, 
      priority = 'normal', 
      title, 
      message, 
      target_users = null,
      broadcast_to_all = false,
      expires_in_hours = 24 
    } = req.body;

    const expires_at = new Date();
    expires_at.setHours(expires_at.getHours() + expires_in_hours);

    const [result] = await db.execute(`
      INSERT INTO real_time_events 
      (event_type, priority, title, message, target_users, broadcast_to_all, expires_at, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      event_type, priority, title, message,
      target_users ? JSON.stringify(target_users) : null,
      broadcast_to_all, expires_at, req.user.id
    ]);

    res.json({
      ubwoba: false,
      icyabaye: {
        id: result.insertId,
        umutwe: title,
        ubutumwa: message,
        urwego: priority,
        koherezwa_bose: broadcast_to_all,
        bireba: target_users
      }
    });
  } catch (error) {
    res.status(500).json({ ubwoba: true, ubutumwa: 'Habaye ikosa mu kohereza amakuru' });
  }
});

// 8. API ya Live Notifications
router.get('/realtime/notifications', auth, async (req, res) => {
  try {
    const { unread_only = 'false', limit = 50 } = req.query;
    
    let whereClause = 'WHERE ln.user_id = ?';
    if (unread_only === 'true') {
      whereClause += ' AND ln.is_read = false';
    }

    const [notifications] = await db.execute(`
      SELECT 
        ln.id,
        ln.notification_type as ubwoko,
        ln.title as umutwe,
        ln.message as ubutumwa,
        ln.additional_data as amakuru_yinyongera,
        ln.is_read as byasomwe,
        ln.read_at as igihe_cyasomwe,
        ln.action_url as urubuga_rwigikorwa,
        ln.action_text as ijambo_ryigikorwa,
        ln.expires_at as rirangira_ryini,
        ln.created_at as byakozwe_ryini
      FROM live_notifications ln
      ${whereClause}
      AND (ln.expires_at IS NULL OR ln.expires_at > NOW())
      ORDER BY ln.is_read ASC, ln.created_at DESC
      LIMIT ?
    `, [req.user.id, parseInt(limit)]);

    res.json({
      ubwoba: false,
      amakuru: notifications.map(notif => ({
        id: notif.id,
        ubwoko: notif.ubwoko,
        umutwe: notif.umutwe,
        ubutumwa: notif.ubutumwa,
        amakuru_yinyongera: JSON.parse(notif.amakuru_yinyongera || '{}'),
        byasomwe: notif.byasomwe,
        igihe_cyasomwe: notif.igihe_cyasomwe,
        igikorwa: {
          urubuga: notif.urubuga_rwigikorwa,
          ijambo: notif.ijambo_ryigikorwa
        },
        rirangira: notif.rirangira_ryini,
        byakozwe: notif.byakozwe_ryini
      }))
    });
  } catch (error) {
    res.status(500).json({ ubwoba: true, ubutumwa: 'Habaye ikosa mu gushaka amakuru' });
  }
});

// 9. API yo Gusoma Amakuru - Mark Notifications as Read
router.put('/realtime/notifications/:id/read', auth, async (req, res) => {
  try {
    const { id } = req.params;

    await db.execute(`
      UPDATE live_notifications 
      SET is_read = true, read_at = NOW() 
      WHERE id = ? AND user_id = ?
    `, [id, req.user.id]);

    res.json({
      ubwoba: false,
      ubutumwa: 'Ubutumwa bwasomwe neza'
    });
  } catch (error) {
    res.status(500).json({ ubwoba: true, ubutumwa: 'Habaye ikosa mu gusoma ubutumwa' });
  }
});

// 10. API ya System Status mu Gihe Nyacyo
router.get('/realtime/system-status', auth, async (req, res) => {
  try {
    const [metrics] = await db.execute(`
      SELECT 
        metric_type as ubwoko,
        metric_name as izina,
        metric_value as agaciro,
        unit as igice,
        recorded_at as igihe
      FROM system_performance_metrics
      WHERE recorded_at >= DATE_SUB(NOW(), INTERVAL 5 MINUTE)
      ORDER BY recorded_at DESC
      LIMIT 20
    `);

    const [connections] = await db.execute(`
      SELECT COUNT(*) as abunze FROM websocket_connections WHERE is_active = true
    `);

    const [events] = await db.execute(`
      SELECT COUNT(*) as ibintu FROM real_time_events WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
    `);

    res.json({
      ubwoba: false,
      uko_sisitemu_imeze: {
        amahuriro: connections[0].abunze,
        ibintu_byabaye: events[0].ibintu,
        imikorere: metrics.reduce((acc, metric) => {
          acc[metric.ubwoko] = {
            izina: metric.izina,
            agaciro: metric.agaciro,
            igice: metric.igice,
            igihe: metric.igihe
          };
          return acc;
        }, {})
      }
    });
  } catch (error) {
    res.status(500).json({ ubwoba: true, ubutumwa: 'Habaye ikosa mu gusuzuma sisitemu' });
  }
});

// ==================================================
// ADVANCED COMMUNICATION APIS (11-25)
// ==================================================

// 11. API ya Advanced Messaging System
router.post('/communication/messages', auth, async (req, res) => {
  try {
    const {
      message_type = 'text',
      subject,
      content,
      recipients,
      priority = 'normal',
      scheduled_send = null,
      expires_in_days = null
    } = req.body;

    const expires_at = expires_in_days ? 
      new Date(Date.now() + expires_in_days * 24 * 60 * 60 * 1000) : null;

    const [result] = await db.execute(`
      INSERT INTO advanced_messages 
      (sender_id, message_type, subject, content, recipients, priority, scheduled_send, expires_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      req.user.id, message_type, subject, content, 
      JSON.stringify(recipients), priority, scheduled_send, expires_at
    ]);

    res.json({
      ubwoba: false,
      ubutumwa: {
        id: result.insertId,
        umutwe: subject,
        inyandiko: content,
        abahawe: recipients,
        urwego: priority,
        koherezwa: scheduled_send || 'vuba'
      }
    });
  } catch (error) {
    res.status(500).json({ ubwoba: true, ubutumwa: 'Habaye ikosa mu kohereza ubutumwa' });
  }
});

// 12. API ya Message Threads Management
router.get('/communication/threads', auth, async (req, res) => {
  try {
    const { thread_type = 'all', limit = 20 } = req.query;

    let whereClause = 'WHERE JSON_CONTAINS(mt.participants, ?)';
    const params = [JSON.stringify(req.user.id)];

    if (thread_type !== 'all') {
      whereClause += ' AND mt.thread_type = ?';
      params.push(thread_type);
    }

    const [threads] = await db.execute(`
      SELECT 
        mt.id,
        mt.thread_type as ubwoko,
        mt.title as umutwe,
        mt.participants as abitabiriye,
        mt.creator_id as uwabikoreye,
        mt.is_active as gikora,
        mt.last_message_at as ubutumwa_bwa_nyuma,
        mt.last_message_preview as igitekerezo,
        (SELECT CONCAT(first_name, ' ', last_name) FROM users WHERE id = mt.creator_id) as izina_uwabikoreye
      FROM message_threads mt
      ${whereClause}
      AND mt.is_active = true
      ORDER BY mt.last_message_at DESC
      LIMIT ?
    `, [...params, parseInt(limit)]);

    res.json({
      ubwoba: false,
      amatsinda: threads.map(thread => ({
        id: thread.id,
        ubwoko: thread.ubwoko,
        umutwe: thread.umutwe,
        abitabiriye: JSON.parse(thread.abitabiriye || '[]'),
        uwabikoreye: thread.izina_uwabikoreye,
        gikora: thread.gikora,
        ubutumwa_bwa_nyuma: thread.ubutumwa_bwa_nyuma,
        igitekerezo: thread.igitekerezo
      }))
    });
  } catch (error) {
    res.status(500).json({ ubwoba: true, ubutumwa: 'Habaye ikosa mu gushaka amatsinda' });
  }
});

// 13. API ya Video Conference Management
router.post('/communication/video-conference', auth, async (req, res) => {
  try {
    const {
      title,
      description = '',
      conference_type = 'meeting',
      start_time,
      duration_minutes = 60,
      participants,
      max_participants = 100,
      recording_enabled = false
    } = req.body;

    const meeting_link = `https://meet.example.com/room/${Date.now()}`;
    const access_code = Math.random().toString(36).substr(2, 8).toUpperCase();

    const [result] = await db.execute(`
      INSERT INTO video_conferences 
      (title, description, host_id, conference_type, start_time, duration_minutes, 
       participants, max_participants, recording_enabled, meeting_link, access_code)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      title, description, req.user.id, conference_type, start_time, duration_minutes,
      JSON.stringify(participants), max_participants, recording_enabled, meeting_link, access_code
    ]);

    res.json({
      ubwoba: false,
      inama: {
        id: result.insertId,
        umutwe: title,
        ibisobanuro: description,
        ubwoko: conference_type,
        igihe_cyo_gutangira: start_time,
        iminota: duration_minutes,
        urubuga: meeting_link,
        kode: access_code,
        abitabiriye: participants
      }
    });
  } catch (error) {
    res.status(500).json({ ubwoba: true, ubutumwa: 'Habaye ikosa mu gushyiraho inama' });
  }
});

// 14. API ya Communication Analytics
router.get('/communication/analytics', auth, async (req, res) => {
  try {
    const { period = 'week' } = req.query;
    const days = period === 'week' ? 7 : period === 'month' ? 30 : 90;

    const [messageStats] = await db.execute(`
      SELECT 
        message_type as ubwoko,
        COUNT(*) as umubare,
        AVG(CASE WHEN sent_at IS NOT NULL THEN 1 ELSE 0 END) * 100 as ubucukumbuzi
      FROM advanced_messages 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY message_type
    `, [days]);

    const [threadStats] = await db.execute(`
      SELECT 
        thread_type as ubwoko,
        COUNT(*) as umubare,
        AVG(JSON_LENGTH(participants)) as abafite_impuzamahanga
      FROM message_threads 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY thread_type
    `, [days]);

    const [conferenceStats] = await db.execute(`
      SELECT 
        conference_type as ubwoko,
        COUNT(*) as umubare,
        AVG(duration_minutes) as iminota_yitanyuzwa,
        COUNT(CASE WHEN status = 'ended' THEN 1 END) as zarangiye
      FROM video_conferences 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY conference_type
    `, [days]);

    res.json({
      ubwoba: false,
      imibare: {
        ubutumwa: messageStats,
        amatsinda: threadStats,
        inama: conferenceStats
      }
    });
  } catch (error) {
    res.status(500).json({ ubwoba: true, ubutumwa: 'Habaye ikosa mu gusesengura imibare' });
  }
});

// 15. API ya Bulk Communication
router.post('/communication/bulk-message', auth, async (req, res) => {
  try {
    const {
      target_role,
      target_classes = [],
      message_type = 'announcement',
      subject,
      content,
      priority = 'normal'
    } = req.body;

    let recipients = [];

    if (target_role) {
      const [users] = await db.execute(
        'SELECT id FROM users WHERE role = ? AND is_active = true',
        [target_role]
      );
      recipients = users.map(u => u.id);
    }

    if (target_classes.length > 0) {
      const [students] = await db.execute(
        'SELECT DISTINCT student_id as id FROM enrollments WHERE class_id IN (?)',
        [target_classes.join(',')]
      );
      recipients = [...recipients, ...students.map(s => s.id)];
    }

    const [result] = await db.execute(`
      INSERT INTO advanced_messages 
      (sender_id, message_type, subject, content, recipients, priority, is_broadcast)
      VALUES (?, ?, ?, ?, ?, ?, true)
    `, [req.user.id, message_type, subject, content, JSON.stringify(recipients), priority]);

    res.json({
      ubwoba: false,
      ubutumwa: {
        id: result.insertId,
        umutwe: subject,
        bahawe: recipients.length,
        ubwoko: message_type
      }
    });
  } catch (error) {
    res.status(500).json({ ubwoba: true, ubutumwa: 'Habaye ikosa mu kohereza ubutumwa bwose' });
  }
});

// ==================================================
// ADVANCED DASHBOARD & ANALYTICS APIs (16-30)
// ==================================================

// 16. API ya Custom Dashboard Widgets
router.get('/dashboard/widgets/:role', auth, async (req, res) => {
  try {
    const { role } = req.params;

    const [widgets] = await db.execute(`
      SELECT 
        dw.id,
        dw.widget_type as ubwoko,
        dw.title as umutwe,
        dw.description as ibisobanuro,
        dw.config as imiterere,
        dw.data_source as aho_amakuru_ava,
        dw.refresh_interval_seconds as igihe_cyo_kuvugurura
      FROM dashboard_widgets dw
      WHERE dw.is_public = true 
         OR JSON_CONTAINS(dw.required_permissions, ?)
      ORDER BY dw.widget_type, dw.title
    `, [JSON.stringify(role)]);

    res.json({
      ubwoba: false,
      widgets: widgets.map(widget => ({
        id: widget.id,
        ubwoko: widget.ubwoko,
        umutwe: widget.umutwe,
        ibisobanuro: widget.ibisobanuro,
        imiterere: JSON.parse(widget.imiterere || '{}'),
        aho_amakuru_ava: widget.aho_amakuru_ava,
        igihe_cyo_kuvugurura: widget.igihe_cyo_kuvugurura
      }))
    });
  } catch (error) {
    res.status(500).json({ ubwoba: true, ubutumwa: 'Habaye ikosa mu gushaka widgets' });
  }
});

// 17. API ya User Dashboard Configuration
router.get('/dashboard/config', auth, async (req, res) => {
  try {
    const [config] = await db.execute(`
      SELECT 
        layout_config as imiterere,
        widget_configs as widgets,
        theme_settings as insanganyamatsiko,
        auto_refresh_enabled as kuvugurura_kwikora,
        refresh_interval_seconds as igihe_cyo_kuvugurura
      FROM user_dashboard_configs 
      WHERE user_id = ?
    `, [req.user.id]);

    if (config.length === 0) {
      // Koresha imiterere isanzwe - Create default configuration
      const defaultConfig = {
        imiterere: { columns: 3, rows: 4 },
        widgets: [],
        insanganyamatsiko: { theme: 'light', color: 'blue' },
        kuvugurura_kwikora: true,
        igihe_cyo_kuvugurura: 60
      };
      
      await db.execute(`
        INSERT INTO user_dashboard_configs 
        (user_id, layout_config, widget_configs, theme_settings, auto_refresh_enabled, refresh_interval_seconds)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [
        req.user.id,
        JSON.stringify(defaultConfig.imiterere),
        JSON.stringify(defaultConfig.widgets),
        JSON.stringify(defaultConfig.insanganyamatsiko),
        defaultConfig.kuvugurura_kwikora,
        defaultConfig.igihe_cyo_kuvugurura
      ]);

      return res.json({ ubwoba: false, imiterere: defaultConfig });
    }

    res.json({
      ubwoba: false,
      imiterere: {
        imiterere: JSON.parse(config[0].imiterere || '{}'),
        widgets: JSON.parse(config[0].widgets || '[]'),
        insanganyamatsiko: JSON.parse(config[0].insanganyamatsiko || '{}'),
        kuvugurura_kwikora: config[0].kuvugurura_kwikora,
        igihe_cyo_kuvugurura: config[0].igihe_cyo_kuvugurura
      }
    });
  } catch (error) {
    res.status(500).json({ ubwoba: true, ubutumwa: 'Habaye ikosa mu gushaka imiterere' });
  }
});

// 18. API yo Kugenzura Dashboard - Update Dashboard Config
router.put('/dashboard/config', auth, async (req, res) => {
  try {
    const {
      layout_config,
      widget_configs,
      theme_settings,
      auto_refresh_enabled = true,
      refresh_interval_seconds = 60
    } = req.body;

    await db.execute(`
      UPDATE user_dashboard_configs 
      SET layout_config = ?, widget_configs = ?, theme_settings = ?, 
          auto_refresh_enabled = ?, refresh_interval_seconds = ?
      WHERE user_id = ?
    `, [
      JSON.stringify(layout_config),
      JSON.stringify(widget_configs),
      JSON.stringify(theme_settings),
      auto_refresh_enabled,
      refresh_interval_seconds,
      req.user.id
    ]);

    res.json({
      ubwoba: false,
      ubutumwa: 'Imiterere yahinduwe neza'
    });
  } catch (error) {
    res.status(500).json({ ubwoba: true, ubutumwa: 'Habaye ikosa mu guhindura imiterere' });
  }
});

// 19. API ya Advanced Performance Analytics
router.get('/analytics/performance/comprehensive', auth, async (req, res) => {
  try {
    const { 
      start_date = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end_date = new Date().toISOString().split('T')[0],
      group_by = 'day'
    } = req.query;

    // Ubushobozi bw'abanyeshuri - Student performance
    const [performance] = await db.execute(`
      SELECT 
        DATE_FORMAT(fsp.created_at, '${group_by === 'week' ? '%Y-%u' : '%Y-%m-%d'}') as igihe,
        AVG(fsp.grade_value) as amanota_yagereranije,
        AVG(fsp.attendance_percentage) as kwitabira_yagereranije,
        COUNT(DISTINCT fsp.student_id) as abanyeshuri,
        COUNT(*) as amasuzuma
      FROM fact_student_performance fsp
      WHERE fsp.created_at BETWEEN ? AND ?
      GROUP BY DATE_FORMAT(fsp.created_at, '${group_by === 'week' ? '%Y-%u' : '%Y-%m-%d'}')
      ORDER BY igihe DESC
    `, [start_date, end_date]);

    // Amafaranga - Financial performance
    const [financial] = await db.execute(`
      SELECT 
        DATE_FORMAT(ffp.payment_date, '${group_by === 'week' ? '%Y-%u' : '%Y-%m-%d'}') as igihe,
        SUM(ffp.payment_amount) as amafaranga_yatanzwe,
        COUNT(*) as kwishyura,
        COUNT(DISTINCT ffp.student_id) as abanyeshuri_bishyuye
      FROM fact_financial_performance ffp
      WHERE ffp.payment_date BETWEEN ? AND ?
      GROUP BY DATE_FORMAT(ffp.payment_date, '${group_by === 'week' ? '%Y-%u' : '%Y-%m-%d'}')
      ORDER BY igihe DESC
    `, [start_date, end_date]);

    res.json({
      ubwoba: false,
      ubushobozi: {
        kwiga: performance,
        amafaranga: financial
      }
    });
  } catch (error) {
    res.status(500).json({ ubwoba: true, ubutumwa: 'Habaye ikosa mu gusesengura ubushobozi' });
  }
});

// 20. API ya Budget Optimization Analytics
router.get('/analytics/budget/optimization', auth, async (req, res) => {
  try {
    const [optimizations] = await db.execute(`
      SELECT 
        bo.category as icyiciro,
        bo.current_allocation as ingabo_zishoboka,
        bo.optimized_allocation as ingabo_nziza,
        bo.expected_savings as igenzura_ritegerwa,
        bo.optimization_reason as impamvu,
        bo.confidence_score as ukwizera,
        bo.implementation_status as uko_bigendereye
      FROM budget_optimization bo
      WHERE bo.generated_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      ORDER BY bo.expected_savings DESC
    `);

    const totalSavings = optimizations.reduce((sum, opt) => sum + parseFloat(opt.igenzura_ritegerwa), 0);
    const avgConfidence = optimizations.reduce((sum, opt) => sum + parseFloat(opt.ukwizera), 0) / optimizations.length;

    res.json({
      ubwoba: false,
      igenzura: {
        igenzura_muri_rusange: totalSavings,
        ukwizera_rwagereranije: avgConfidence,
        ibice: optimizations.map(opt => ({
          icyiciro: opt.icyiciro,
          ingabo_zishoboka: parseFloat(opt.ingabo_zishoboka),
          ingabo_nziza: parseFloat(opt.ingabo_nziza),
          igenzura: parseFloat(opt.igenzura_ritegerwa),
          impamvu: opt.impamvu,
          ukwizera: parseFloat(opt.ukwizera),
          uko_bigendereye: opt.uko_bigendereye
        }))
      }
    });
  } catch (error) {
    res.status(500).json({ ubwoba: true, ubutumwa: 'Habaye ikosa mu gusesengura ingano' });
  }
});

module.exports = router;