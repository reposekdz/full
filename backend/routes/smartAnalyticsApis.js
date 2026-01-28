// ==================================================
// SMART ANALYTICS & DATA SCIENCE APIs (41-60)
// ==================================================
// Ubushakashatsi bw'amakuru - Data Analytics
// Ubwenge bwa sisitemu - System Intelligence

const express = require('express');
const mysql = require('mysql2/promise');
const { body, validationResult } = require('express-validator');
const router = express.Router();

// Database connection
const db = require('../config/database');
const auth = require('../middleware/auth');

// ==================================================
// STUDENT ANALYTICS APIS (41-50)
// ==================================================

// 41. API ya Student Performance Deep Analytics
router.get('/analytics/students/performance-deep', auth.authenticate, async (req, res) => {
  try {
    const { 
      student_id = null,
      class_id = null,
      subject_id = null,
      timeframe = 'semester',
      include_predictions = 'true'
    } = req.query;

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (student_id) {
      whereClause += ' AND fsp.student_id = ?';
      params.push(student_id);
    }

    if (class_id) {
      whereClause += ' AND fsp.course_id IN (SELECT id FROM courses WHERE class_id = ?)';
      params.push(class_id);
    }

    const [performance] = await db.execute(`
      SELECT 
        fsp.student_id as umunyeshuri_id,
        u.first_name as izina_rya_mbere,
        u.last_name as izina_rya_nyuma,
        c.name as isomo,
        AVG(fsp.grade_value) as amanota_yagereranije,
        AVG(fsp.attendance_percentage) as kwitabira,
        AVG(fsp.assignment_completion_rate) as gutondeka_amahugurwa,
        AVG(fsp.participation_score) as kugira_uruhare,
        AVG(fsp.behavioral_score) as imyitwarire,
        COUNT(*) as amasuzuma,
        STDDEV(fsp.grade_value) as ukwirakwiza_amanota,
        MIN(fsp.grade_value) as amanota_make,
        MAX(fsp.grade_value) as amanota_menshi
      FROM fact_student_performance fsp
      JOIN users u ON fsp.student_id = u.id
      JOIN courses c ON fsp.course_id = c.id
      ${whereClause}
      GROUP BY fsp.student_id, u.first_name, u.last_name, c.name
      ORDER BY amanota_yagereranije DESC
    `, params);

    // Gutegeza ubushobozi bw'ejo - Future performance prediction
    let predictions = [];
    if (include_predictions === 'true' && student_id) {
      const [predData] = await db.execute(`
        SELECT prediction_data FROM predictive_analytics 
        WHERE prediction_type = 'academic_performance' 
        ORDER BY created_at DESC LIMIT 1
      `);
      
      if (predData.length > 0) {
        predictions = JSON.parse(predData[0].prediction_data || '{}');
      }
    }

    res.json({
      ubwoba: false,
      ubushobozi_bwabanyeshuri: {
        imibare_rusange: performance.map(perf => ({
          umunyeshuri: {
            id: perf.umunyeshuri_id,
            izina: `${perf.izina_rya_mbere} ${perf.izina_rya_nyuma}`
          },
          isomo: perf.isomo,
          ubushobozi: {
            amanota_yagereranije: parseFloat(perf.amanota_yagereranije),
            kwitabira: parseFloat(perf.kwitabira),
            gutondeka_amahugurwa: parseFloat(perf.gutondeka_amahugurwa),
            kugira_uruhare: parseFloat(perf.kugira_uruhare),
            imyitwarire: parseFloat(perf.imyitwarire)
          },
          imibare: {
            amasuzuma: perf.amasuzuma,
            ukwirakwiza: parseFloat(perf.ukwirakwiza_amanota),
            amanota_make: parseFloat(perf.amanota_make),
            amanota_menshi: parseFloat(perf.amanota_menshi)
          }
        })),
        amategeko: include_predictions === 'true' ? predictions : null
      }
    });
  } catch (error) {
    res.status(500).json({ ubwoba: true, ubutumwa: 'Habaye ikosa mu gusesengura ubushobozi bw\'abanyeshuri' });
  }
});

// 42. API ya Learning Pattern Analysis
router.get('/analytics/learning/patterns', auth.authenticate, async (req, res) => {
  try {
    const { 
      timeframe = 'month',
      group_by = 'subject' 
    } = req.query;

    const days = timeframe === 'week' ? 7 : timeframe === 'month' ? 30 : 90;

    // Imiterere y'ubushakashatsi - Learning patterns
    const [patterns] = await db.execute(`
      SELECT 
        c.name as isomo,
        AVG(fsp.grade_value) as amanota_yagereranije,
        COUNT(DISTINCT fsp.student_id) as abanyeshuri,
        AVG(fsp.assignment_completion_rate) as gutondeka_amahugurwa,
        HOUR(fsp.created_at) as isaha,
        DAYOFWEEK(fsp.created_at) as umunsi_wicyumweru,
        COUNT(*) as ibikorwa
      FROM fact_student_performance fsp
      JOIN courses c ON fsp.course_id = c.id
      WHERE fsp.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY ${group_by === 'subject' ? 'c.name' : 'HOUR(fsp.created_at)'}, 
               ${group_by === 'subject' ? 'HOUR(fsp.created_at)' : 'c.name'},
               DAYOFWEEK(fsp.created_at)
      ORDER BY amanota_yagereranije DESC
    `, [days]);

    // Ibihe byiza byo kwiga - Optimal learning times
    const [optimalTimes] = await db.execute(`
      SELECT 
        HOUR(created_at) as isaha,
        AVG(grade_value) as ubushobozi_bugereranije,
        COUNT(*) as ibikorwa
      FROM fact_student_performance
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY HOUR(created_at)
      HAVING COUNT(*) > 5
      ORDER BY ubushobozi_bugereranije DESC
      LIMIT 5
    `, [days]);

    res.json({
      ubwoba: false,
      imiterere_yubushakashatsi: {
        imiterere_rusange: patterns.map(pattern => ({
          isomo: pattern.isomo,
          amanota_yagereranije: parseFloat(pattern.amanota_yagereranije),
          abanyeshuri: pattern.abanyeshuri,
          gutondeka_amahugurwa: parseFloat(pattern.gutondeka_amahugurwa),
          isaha: pattern.isaha,
          umunsi_wicyumweru: pattern.umunsi_wicyumweru,
          ibikorwa: pattern.ibikorwa
        })),
        ibihe_byiza: optimalTimes.map(time => ({
          isaha: time.isaha,
          ubushobozi: parseFloat(time.ubushobozi_bugereranije),
          ibikorwa: time.ibikorwa
        }))
      }
    });
  } catch (error) {
    res.status(500).json({ ubwoba: true, ubutumwa: 'Habaye ikosa mu gusesengura imiterere y\'ubushakashatsi' });
  }
});

// 43. API ya Academic Progress Tracking
router.get('/analytics/academic/progress/:studentId', auth.authenticate, async (req, res) => {
  try {
    const { studentId } = req.params;
    const { period = 'semester' } = req.query;

    const days = period === 'month' ? 30 : period === 'semester' ? 120 : 365;

    // Iterambere ry'amanota - Grade progression
    const [progression] = await db.execute(`
      SELECT 
        DATE(fsp.created_at) as italiki,
        c.name as isomo,
        fsp.grade_value as amanota,
        fsp.attendance_percentage as kwitabira,
        fsp.assignment_completion_rate as amahugurwa,
        LAG(fsp.grade_value) OVER (PARTITION BY fsp.course_id ORDER BY fsp.created_at) as amanota_yabanzirije
      FROM fact_student_performance fsp
      JOIN courses c ON fsp.course_id = c.id
      WHERE fsp.student_id = ? AND fsp.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      ORDER BY fsp.created_at DESC
    `, [studentId, days]);

    // Imibare y'iterambere - Progress statistics
    const [stats] = await db.execute(`
      SELECT 
        AVG(grade_value) as amanota_yagereranije,
        STDDEV(grade_value) as ukwirakwiza,
        COUNT(*) as amasuzuma,
        AVG(attendance_percentage) as kwitabira_yagereranije,
        (SELECT AVG(grade_value) FROM fact_student_performance 
         WHERE student_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)) -
        (SELECT AVG(grade_value) FROM fact_student_performance 
         WHERE student_id = ? AND created_at BETWEEN DATE_SUB(NOW(), INTERVAL ? DAY) AND DATE_SUB(NOW(), INTERVAL ? DAY)) as impinduka
      FROM fact_student_performance
      WHERE student_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
    `, [studentId, days, studentId, days * 2, days, studentId, days]);

    res.json({
      ubwoba: false,
      iterambere_ryamanota: {
        umunyeshuri_id: parseInt(studentId),
        iterambere: progression.map(prog => ({
          italiki: prog.italiki,
          isomo: prog.isomo,
          amanota: parseFloat(prog.amanota),
          kwitabira: parseFloat(prog.kwitabira),
          amahugurwa: parseFloat(prog.amahugurwa),
          impinduka: prog.amanota_yabanzirije ? 
            parseFloat(prog.amanota) - parseFloat(prog.amanota_yabanzirije) : 0
        })),
        imibare: stats.length > 0 ? {
          amanota_yagereranije: parseFloat(stats[0].amanota_yagereranije || 0),
          ukwirakwiza: parseFloat(stats[0].ukwirakwiza || 0),
          amasuzuma: stats[0].amasuzuma || 0,
          kwitabira_yagereranije: parseFloat(stats[0].kwitabira_yagereranije || 0),
          impinduka_rusange: parseFloat(stats[0].impinduka || 0)
        } : {}
      }
    });
  } catch (error) {
    res.status(500).json({ ubwoba: true, ubutumwa: 'Habaye ikosa mu gukurikirana iterambere' });
  }
});

// 44. API ya Comparative Analysis Between Students
router.get('/analytics/students/comparison', auth.authenticate, async (req, res) => {
  try {
    const { 
      student_ids,
      metrics = 'grades,attendance,participation',
      period = 'semester'
    } = req.query;

    if (!student_ids) {
      return res.status(400).json({ 
        ubwoba: true, 
        ubutumwa: 'Hitamo abanyeshuri ugomba kugereranya' 
      });
    }

    const studentIdList = student_ids.split(',').map(id => parseInt(id));
    const metricsList = metrics.split(',');
    const days = period === 'month' ? 30 : period === 'semester' ? 120 : 365;

    // Kugereranya abanyeshuri - Student comparison
    const [comparison] = await db.execute(`
      SELECT 
        fsp.student_id as umunyeshuri_id,
        u.first_name as izina_rya_mbere,
        u.last_name as izina_rya_nyuma,
        AVG(fsp.grade_value) as amanota_yagereranije,
        AVG(fsp.attendance_percentage) as kwitabira_yagereranije,
        AVG(fsp.participation_score) as uruhare_rwagereranije,
        AVG(fsp.assignment_completion_rate) as amahugurwa_yagereranije,
        COUNT(*) as amasuzuma,
        RANK() OVER (ORDER BY AVG(fsp.grade_value) DESC) as icyiciro_cyamanota
      FROM fact_student_performance fsp
      JOIN users u ON fsp.student_id = u.id
      WHERE fsp.student_id IN (${studentIdList.map(() => '?').join(',')})
        AND fsp.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY fsp.student_id, u.first_name, u.last_name
      ORDER BY amanota_yagereranije DESC
    `, [...studentIdList, days]);

    // Imibare y'ukugereranya - Comparison statistics
    const avgGrade = comparison.reduce((sum, student) => 
      sum + parseFloat(student.amanota_yagereranije), 0) / comparison.length;
    
    const avgAttendance = comparison.reduce((sum, student) => 
      sum + parseFloat(student.kwitabira_yagereranije), 0) / comparison.length;

    res.json({
      ubwoba: false,
      ikigereranyo: {
        abanyeshuri: comparison.map(student => ({
          umunyeshuri: {
            id: student.umunyeshuri_id,
            izina: `${student.izina_rya_mbere} ${student.izina_rya_nyuma}`
          },
          ubushobozi: {
            amanota_yagereranije: parseFloat(student.amanota_yagereranije),
            kwitabira_yagereranije: parseFloat(student.kwitabira_yagereranije),
            uruhare_rwagereranije: parseFloat(student.uruhare_rwagereranije),
            amahugurwa_yagereranije: parseFloat(student.amahugurwa_yagereranije)
          },
          icyiciro: student.icyiciro_cyamanota,
          amasuzuma: student.amasuzuma
        })),
        imibare_rusange: {
          amanota_yagereranije_bose: avgGrade,
          kwitabira_yagereranije_bose: avgAttendance,
          umubare_wabanyeshuri: comparison.length
        }
      }
    });
  } catch (error) {
    res.status(500).json({ ubwoba: true, ubutumwa: 'Habaye ikosa mu kugereranya abanyeshuri' });
  }
});

// 45. API ya Predictive Student Risk Assessment
router.get('/analytics/students/risk-assessment', auth.authenticate, async (req, res) => {
  try {
    const { 
      threshold = 60,
      include_recommendations = 'true'
    } = req.query;

    // Gusuzuma akaga k'abanyeshuri - Student risk assessment
    const [riskAssessment] = await db.execute(`
      SELECT 
        fsp.student_id as umunyeshuri_id,
        u.first_name as izina_rya_mbere,
        u.last_name as izina_rya_nyuma,
        AVG(fsp.grade_value) as amanota_yagereranije,
        AVG(fsp.attendance_percentage) as kwitabira_yagereranije,
        AVG(fsp.assignment_completion_rate) as amahugurwa_yagereranije,
        COUNT(CASE WHEN fsp.grade_value < ? THEN 1 END) as amanota_make,
        COUNT(CASE WHEN fsp.attendance_percentage < 75 THEN 1 END) as kutitabira_kenshi,
        COUNT(*) as amasuzuma_yose,
        CASE 
          WHEN AVG(fsp.grade_value) < 50 OR AVG(fsp.attendance_percentage) < 70 THEN 'high'
          WHEN AVG(fsp.grade_value) < 65 OR AVG(fsp.attendance_percentage) < 80 THEN 'medium'
          ELSE 'low'
        END as urwego_rwakaga
      FROM fact_student_performance fsp
      JOIN users u ON fsp.student_id = u.id
      WHERE fsp.created_at >= DATE_SUB(NOW(), INTERVAL 60 DAY)
      GROUP BY fsp.student_id, u.first_name, u.last_name
      HAVING AVG(fsp.grade_value) < ? OR AVG(fsp.attendance_percentage) < 75
      ORDER BY amanota_yagereranije ASC, kwitabira_yagereranije ASC
    `, [threshold, threshold]);

    // Inama zo gufasha - Recommendations for at-risk students
    let recommendations = {};
    if (include_recommendations === 'true') {
      const [recData] = await db.execute(`
        SELECT 
          user_id,
          recommended_items,
          reasoning
        FROM recommendation_engine
        WHERE recommendation_type = 'intervention'
          AND user_id IN (${riskAssessment.map(() => '?').join(',')})
        ORDER BY confidence_score DESC
      `, riskAssessment.map(student => student.umunyeshuri_id));

      recData.forEach(rec => {
        recommendations[rec.user_id] = {
          ibintu: JSON.parse(rec.recommended_items || '[]'),
          impamvu: rec.reasoning
        };
      });
    }

    res.json({
      ubwoba: false,
      akaga_kabanyeshuri: {
        abanyeshuri_bafite_akaga: riskAssessment.map(student => ({
          umunyeshuri: {
            id: student.umunyeshuri_id,
            izina: `${student.izina_rya_mbere} ${student.izina_rya_nyuma}`
          },
          ubushobozi: {
            amanota_yagereranije: parseFloat(student.amanota_yagereranije),
            kwitabira_yagereranije: parseFloat(student.kwitabira_yagereranije),
            amahugurwa_yagereranije: parseFloat(student.amahugurwa_yagereranije)
          },
          akaga: {
            urwego: student.urwego_rwakaga,
            amanota_make: student.amanota_make,
            kutitabira_kenshi: student.kutitabira_kenshi,
            amasuzuma_yose: student.amasuzuma_yose
          },
          inama: recommendations[student.umunyeshuri_id] || null
        })),
        imibare: {
          umubare_muri_rusange: riskAssessment.length,
          akaga_gakomeye: riskAssessment.filter(s => s.urwego_rwakaga === 'high').length,
          akaga_gari_hagati: riskAssessment.filter(s => s.urwego_rwakaga === 'medium').length,
          akaga_gake: riskAssessment.filter(s => s.urwego_rwakaga === 'low').length
        }
      }
    });
  } catch (error) {
    res.status(500).json({ ubwoba: true, ubutumwa: 'Habaye ikosa mu gusuzuma akaga k\'abanyeshuri' });
  }
});

// ==================================================
// FINANCIAL ANALYTICS APIS (46-55)
// ==================================================

// 46. API ya Revenue Analytics & Forecasting
router.get('/analytics/finance/revenue', auth.authenticate, async (req, res) => {
  try {
    const { 
      period = 'year',
      breakdown = 'monthly',
      include_forecast = 'true'
    } = req.query;

    const days = period === 'month' ? 30 : period === 'semester' ? 120 : 365;

    // Amafaranga yinjije - Revenue analysis
    const [revenue] = await db.execute(`
      SELECT 
        DATE_FORMAT(ffp.payment_date, '${breakdown === 'daily' ? '%Y-%m-%d' : '%Y-%m'}') as igihe,
        ffp.fee_category as icyiciro,
        SUM(ffp.payment_amount) as amafaranga_yinjije,
        COUNT(*) as kwishyura,
        COUNT(DISTINCT ffp.student_id) as abanyeshuri,
        AVG(ffp.payment_amount) as kwishyura_rwagereranije
      FROM fact_financial_performance ffp
      WHERE ffp.payment_date >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY DATE_FORMAT(ffp.payment_date, '${breakdown === 'daily' ? '%Y-%m-%d' : '%Y-%m'}'), ffp.fee_category
      ORDER BY igihe DESC, amafaranga_yinjije DESC
    `, [days]);

    // Gutegeza amafaranga azinja - Revenue forecasting
    let forecast = null;
    if (include_forecast === 'true') {
      const [forecastData] = await db.execute(`
        SELECT forecast_data FROM predictive_forecasts 
        WHERE forecast_type = 'revenue' 
        ORDER BY forecast_date DESC LIMIT 1
      `);
      
      if (forecastData.length > 0) {
        forecast = JSON.parse(forecastData[0].forecast_data || '{}');
      }
    }

    // Gusesengura icyiciro - Category analysis
    const categoryTotals = revenue.reduce((acc, row) => {
      if (!acc[row.icyiciro]) {
        acc[row.icyiciro] = { total: 0, payments: 0, students: new Set() };
      }
      acc[row.icyiciro].total += parseFloat(row.amafaranga_yinjije);
      acc[row.icyiciro].payments += row.kwishyura;
      acc[row.icyiciro].students.add(row.abanyeshuri);
      return acc;
    }, {});

    res.json({
      ubwoba: false,
      amafaranga_yinjije: {
        amakuru_yigihe: revenue.map(row => ({
          igihe: row.igihe,
          icyiciro: row.icyiciro,
          amafaranga: parseFloat(row.amafaranga_yinjije),
          kwishyura: row.kwishyura,
          abanyeshuri: row.abanyeshuri,
          kwishyura_rwagereranije: parseFloat(row.kwishyura_rwagereranije)
        })),
        ibice: Object.keys(categoryTotals).map(category => ({
          icyiciro: category,
          amafaranga_yose: categoryTotals[category].total,
          kwishyura_kwose: categoryTotals[category].payments,
          abanyeshuri_bose: categoryTotals[category].students.size
        })),
        amategeko: include_forecast === 'true' ? forecast : null
      }
    });
  } catch (error) {
    res.status(500).json({ ubwoba: true, ubutumwa: 'Habaye ikosa mu gusesengura amafaranga yinjije' });
  }
});

// 47. API ya Payment Behavior Analysis
router.get('/analytics/finance/payment-behavior', auth.authenticate, async (req, res) => {
  try {
    const { student_id = null, timeframe = 'semester' } = req.query;
    const days = timeframe === 'month' ? 30 : timeframe === 'semester' ? 120 : 365;

    let whereClause = 'WHERE ffp.payment_date >= DATE_SUB(NOW(), INTERVAL ? DAY)';
    const params = [days];

    if (student_id) {
      whereClause += ' AND ffp.student_id = ?';
      params.push(student_id);
    }

    // Imiterere y'kwishyura - Payment patterns
    const [patterns] = await db.execute(`
      SELECT 
        ffp.student_id as umunyeshuri_id,
        u.first_name as izina_rya_mbere,
        u.last_name as izina_rya_nyuma,
        ffp.payment_method as uburyo_bwishyura,
        COUNT(*) as kwishyura_kwose,
        SUM(ffp.payment_amount) as amafaranga_yose,
        AVG(ffp.payment_amount) as kwishyura_rwagereranije,
        AVG(DATEDIFF(ffp.payment_date, 
          LAG(ffp.payment_date) OVER (PARTITION BY ffp.student_id ORDER BY ffp.payment_date)
        )) as iminsi_hagati_yo_kwishyura,
        COUNT(CASE WHEN ffp.payment_status = 'overdue' THEN 1 END) as kwishyura_kwarangiye,
        MAX(ffp.payment_date) as kwishyura_kwa_nyuma
      FROM fact_financial_performance ffp
      JOIN users u ON ffp.student_id = u.id
      ${whereClause}
      GROUP BY ffp.student_id, u.first_name, u.last_name, ffp.payment_method
      ORDER BY amafaranga_yose DESC
    `, params);

    // Gusuzuma akaga k'amafaranga - Financial risk assessment
    const [riskAssessment] = await db.execute(`
      SELECT 
        pa.student_id,
        pa.risk_score as akaga_kamafaranga,
        pa.anomaly_detected as habayeho_ikidukikije,
        pa.recommendation as icyifuzo
      FROM payment_analytics pa
      WHERE pa.analyzed_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      ORDER BY pa.risk_score DESC
    `);

    const riskMap = riskAssessment.reduce((acc, risk) => {
      acc[risk.student_id] = risk;
      return acc;
    }, {});

    res.json({
      ubwoba: false,
      imiterere_yishyura: {
        imiterere: patterns.map(pattern => ({
          umunyeshuri: {
            id: pattern.umunyeshuri_id,
            izina: `${pattern.izina_rya_mbere} ${pattern.izina_rya_nyuma}`
          },
          uburyo_bwishyura: pattern.uburyo_bwishyura,
          imibare: {
            kwishyura_kwose: pattern.kwishyura_kwose,
            amafaranga_yose: parseFloat(pattern.amafaranga_yose),
            kwishyura_rwagereranije: parseFloat(pattern.kwishyura_rwagereranije),
            iminsi_hagati: parseFloat(pattern.iminsi_hagati_yo_kwishyura) || 0,
            kwishyura_kwarangiye: pattern.kwishyura_kwarangiye,
            kwishyura_kwa_nyuma: pattern.kwishyura_kwa_nyuma
          },
          akaga: riskMap[pattern.umunyeshuri_id] || null
        })),
        imibare_rusange: {
          abanyeshuri_bose: patterns.length,
          amafaranga_yose: patterns.reduce((sum, p) => sum + parseFloat(p.amafaranga_yose), 0),
          kwishyura_kwose: patterns.reduce((sum, p) => sum + p.kwishyura_kwose, 0)
        }
      }
    });
  } catch (error) {
    res.status(500).json({ ubwoba: true, ubutumwa: 'Habaye ikosa mu gusesengura imiterere y\'ishyura' });
  }
});

// Continue with more APIs...

module.exports = router;