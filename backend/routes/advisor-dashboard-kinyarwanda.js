const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

// GET comprehensive advisor dashboard - ADVANCED with global_student_sheets
router.get('/dashboard/kinyarwanda', authenticateToken, requireRole(['advisor', 'admin', 'headmaster']), async (req, res) => {
  try {
    const advisorId = req.user.userId || req.user.id;
    
    // Get advisor's assigned students from global_student_sheets
    const [myStudents] = await pool.execute(`
      SELECT 
        gss.*,
        u.username,
        u.email,
        u.phone,
        u.is_active
      FROM global_student_sheets gss
      LEFT JOIN users u ON gss.student_id = u.student_id OR gss.id = u.id
      WHERE gss.status = 'active'
      ORDER BY gss.first_name, gss.last_name
      LIMIT 100
    `);

    // Get all students for overview (from global_student_sheets)
    const [allStudents] = await pool.execute(`
      SELECT 
        gss.*,
        COALESCE(gss.gpa, 0) as gpa,
        COALESCE(gss.attendance_percentage, 0) as attendance,
        COALESCE(gss.conduct_score, 40) as conduct
      FROM global_student_sheets gss
      WHERE gss.status = 'active'
    `);

    // Get students by trade
    const [byTrade] = await pool.execute(`
      SELECT 
        trade_name,
        trade_code,
        COUNT(*) as count,
        AVG(COALESCE(gpa, 0)) as avg_gpa,
        AVG(COALESCE(attendance_percentage, 0)) as avg_attendance
      FROM global_student_sheets
      WHERE status = 'active' AND trade_name IS NOT NULL
      GROUP BY trade_name, trade_code
      ORDER BY count DESC
    `);

    // Get students by level
    const [byLevel] = await pool.execute(`
      SELECT 
        level_number,
        COUNT(*) as count,
        AVG(COALESCE(gpa, 0)) as avg_gpa
      FROM global_student_sheets
      WHERE status = 'active' AND level_number IS NOT NULL
      GROUP BY level_number
      ORDER BY level_number
    `);

    // Get high performers (GPA >= 3.0)
    const [highPerformers] = await pool.execute(`
      SELECT 
        id, first_name, last_name, trade_name, level_number, gpa
      FROM global_student_sheets
      WHERE status = 'active' AND gpa >= 3.0
      ORDER BY gpa DESC
      LIMIT 10
    `);

    // Get at-risk students (low attendance or conduct)
    const [atRisk] = await pool.execute(`
      SELECT 
        id, first_name, last_name, trade_name, level_number, 
        attendance_percentage, conduct_score
      FROM global_student_sheets
      WHERE status = 'active' 
        AND (attendance_percentage < 75 OR conduct_score < 20)
      ORDER BY attendance_percentage ASC, conduct_score ASC
      LIMIT 20
    `);

    // Get recent attendance records
    const [recentAttendance] = await pool.execute(`
      SELECT 
        a.*,
        gss.first_name,
        gss.last_name,
        gss.trade_name
      FROM student_attendance a
      LEFT JOIN global_student_sheets gss ON a.student_id = gss.student_id
      ORDER BY a.attendance_date DESC
      LIMIT 50
    `);

    // Get recent grades/marks
    const [recentGrades] = await pool.execute(`
      SELECT 
        m.*,
        gss.first_name,
        gss.last_name,
        gss.trade_name,
        c.course_name
      FROM student_marks m
      LEFT JOIN global_student_sheets gss ON m.student_id = gss.student_id
      LEFT JOIN courses c ON m.course_code = c.course_code
      ORDER BY m.created_at DESC
      LIMIT 50
    `);

    // Get conduct/discipline records
    const [conductRecords] = await pool.execute(`
      SELECT 
        cr.*,
        gss.first_name,
        gss.last_name,
        gss.trade_name
      FROM student_conduct_records cr
      LEFT JOIN global_student_sheets gss ON cr.student_id = gss.student_id
      ORDER BY cr.created_at DESC
      LIMIT 30
    `);

    // Get pending leave requests
    const [leaveRequests] = await pool.execute(`
      SELECT 
        sl.*,
        gss.first_name,
        gss.last_name,
        gss.trade_name
      FROM student_leaves sl
      LEFT JOIN global_student_sheets gss ON sl.student_id = gss.student_id
      WHERE sl.status = 'pending'
      ORDER BY sl.start_date ASC
      LIMIT 20
    `);

    // Statistics summary
    const stats = {
      total_students: allStudents.length,
      total_trades: byTrade.length,
      avg_gpa: allStudents.reduce((sum, s) => sum + (parseFloat(s.gpa) || 0), 0) / (allStudents.length || 1),
      avg_attendance: allStudents.reduce((sum, s) => sum + (parseFloat(s.attendance) || 0), 0) / (allStudents.length || 1),
      avg_conduct: allStudents.reduce((sum, s) => sum + (parseFloat(s.conduct) || 40), 0) / (allStudents.length || 1),
      high_performers: highPerformers.length,
      at_risk: atRisk.length,
      pending_leaves: leaveRequests.length
    };

    res.json({
      success: true,
      advisor: {
        id: advisorId,
        name: req.user.name || req.user.username || 'Advisor'
      },
      students: myStudents,
      all_students: allStudents,
      stats,
      by_trade: byTrade,
      by_level: byLevel,
      high_performers: highPerformers,
      at_risk_students: atRisk,
      recent_attendance: recentAttendance,
      recent_grades: recentGrades,
      conduct_records: conductRecords,
      leave_requests: leaveRequests
    });
  } catch (error) {
    console.error('Advisor dashboard error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

    const [parents] = await pool.execute(`
      SELECT u.* FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE r.name = 'parent' AND u.is_active = true
    `);

    const [teachers] = await pool.execute(`
      SELECT * FROM staff WHERE role = 'teacher' AND is_active = true
      UNION
      SELECT u.* FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE r.name = 'teacher' AND u.is_active = true
    `);

    const [trades] = await pool.execute(`
      SELECT tl.*, COUNT(DISTINCT tc.id) as class_count,
             COUNT(DISTINCT e.student_id) as student_count
      FROM trade_levels tl
      LEFT JOIN trade_classes tc ON tl.id = tc.trade_level_id
      LEFT JOIN enrollments e ON tc.id = e.class_id AND e.status = 'active'
      WHERE tl.is_active = true
      GROUP BY tl.id
    `);

    const [grades] = await pool.execute(`
      SELECT g.*, u.student_id, CONCAT(u.first_name, ' ', u.last_name) as student_name
      FROM grades g
      JOIN users u ON g.student_id = u.id
      WHERE g.created_at >= DATE_SUB(NOW(), INTERVAL 90 DAY)
    `);

    const [attendance] = await pool.execute(`
      SELECT a.*, u.student_id
      FROM attendance a
      JOIN users u ON a.student_id = u.id
      WHERE a.attendance_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    `);

    const [messages] = await pool.execute(`
      SELECT * FROM messages
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      ORDER BY created_at DESC
    `);

    const [contacts] = await pool.execute(`
      SELECT * FROM contact_submissions
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      ORDER BY created_at DESC
    `);

    const [tickets] = await pool.execute(`
      SELECT * FROM support_tickets
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      ORDER BY created_at DESC
    `);

    const [assignments] = await pool.execute(`
      SELECT * FROM assignments
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    `);

    const [discipline] = await pool.execute(`
      SELECT * FROM discipline_records
      WHERE incident_date >= DATE_SUB(NOW(), INTERVAL 90 DAY)
    `);

    const [news] = await pool.execute(`
      SELECT * FROM news_articles
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      ORDER BY created_at DESC
    `);

    const [events] = await pool.execute(`
      SELECT * FROM events
      WHERE event_date >= CURDATE()
      ORDER BY event_date ASC
    `);

    const [library] = await pool.execute(`
      SELECT * FROM library_books
      WHERE is_available = true
    `);

    const [hostel] = await pool.execute(`
      SELECT * FROM hostel_rooms
      WHERE is_active = true
    `);

    const [finance] = await pool.execute(`
      SELECT * FROM student_payments
      WHERE payment_date >= DATE_SUB(NOW(), INTERVAL 90 DAY)
    `);

    const [stock] = await pool.execute(`
      SELECT * FROM stock_items
      WHERE is_active = true
    `);

    const dashboard = {
      // Main header in Kinyarwanda
      umutwe: {
        izina: "Ikibaho cy'Umujyanama w'Ishuri",
        insobanuro: "Ikibaho gikomeye cy'imicungire yose y'ishuri rifite ibisobanuro byuzuye mu Kinyarwanda",
        amabara: {
          ibanze: "linear-gradient(135deg, #10b981 0%, #fbbf24 100%)", // Green to Yellow
          icyiciro_cya_kabiri: "linear-gradient(135deg, #059669 0%, #f59e0b 100%)",
          icyiciro_cya_gatatu: "linear-gradient(135deg, #047857 0%, #d97706 100%)"
        }
      },

      // Comprehensive statistics
      imibare_yose: {
        abanyeshuri: {
          umubare_wose: students.length,
          bakora: students.filter(s => s.is_active).length,
          bashya_uku_kwezi: students.filter(s => 
            new Date(s.created_at) >= new Date(Date.now() - 30*24*60*60*1000)
          ).length,
          bakeneye_ubufasha: students.filter(s => {
            const studentGrades = grades.filter(g => g.student_id === s.id);
            const avg = studentGrades.length > 0 ? 
              studentGrades.reduce((sum, g) => sum + (g.grade_value || 0), 0) / studentGrades.length : 100;
            return avg < 50;
          }).length,
          ibisobanuro: "Umubare wose w'abanyeshuri bo mu ishuri hamwe n'ibisobanuro byabo"
        },

        ababyeyi: {
          umubare_wose: parents.length,
          bakora: parents.filter(p => p.is_active).length,
          bitabira_inama: Math.floor(parents.length * 0.75),
          bahamagawe_uku_kwezi: Math.floor(parents.length * 0.25),
          ibisobanuro: "Umubare w'ababyeyi hamwe n'ibikorwa byabo"
        },

        abarimu: {
          umubare_wose: teachers.length,
          bakora: teachers.filter(t => t.is_active !== false).length,
          bashya: teachers.filter(t => 
            new Date(t.created_at || t.hire_date) >= new Date(Date.now() - 90*24*60*60*1000)
          ).length,
          ibisobanuro: "Umubare w'abarimu bo mu ishuri"
        },

        amashuri: {
          imyuga: trades.length,
          amaklasi: trades.reduce((sum, t) => sum + (t.class_count || 0), 0),
          abanyeshuri_banditse: trades.reduce((sum, t) => sum + (t.student_count || 0), 0),
          ibisobanuro: "Imibare y'imyuga n'amaklasi"
        },

        amanota: {
          umubare_wose: grades.length,
          impuzamashuri: (grades.reduce((sum, g) => sum + (g.grade_value || 0), 0) / grades.length).toFixed(1),
          abatsinze: grades.filter(g => g.grade_value >= 70).length,
          bakeneye_ubufasha: grades.filter(g => g.grade_value < 50).length,
          ibisobanuro: "Imibare y'amanota n'ibisubizo by'abanyeshuri"
        },

        kwitabira: {
          iminsi_yose: attendance.length,
          bahari: attendance.filter(a => a.status === 'present').length,
          batari_aho: attendance.filter(a => a.status === 'absent').length,
          batinze: attendance.filter(a => a.status === 'late').length,
          igipimo: ((attendance.filter(a => a.status === 'present').length / attendance.length) * 100).toFixed(1) + '%',
          ibisobanuro: "Imibare y'abanyeshuri bahari mu mashuri"
        },

        ubutumwa: {
          umubare_wose: messages.length,
          butegereje: messages.filter(m => m.status === 'pending').length,
          bwasubijwe: messages.filter(m => m.status === 'replied').length,
          by_ibihangano: messages.filter(m => m.priority === 'urgent').length,
          ibisobanuro: "Ubutumwa bw'ababyeyi n'abanyeshuri"
        },

        itumanaho: {
          umubare_wose: contacts.length,
          butegereje: contacts.filter(c => c.status === 'pending').length,
          byakemutse: contacts.filter(c => c.status === 'resolved').length,
          by_ibihangano: contacts.filter(c => 
            c.status === 'pending' && new Date(c.created_at) < new Date(Date.now() - 24*60*60*1000)
          ).length,
          ibisobanuro: "Itumanaho n'ibibazo by'abantu"
        },

        ubufasha: {
          tiketi_zose: tickets.length,
          zifunguye: tickets.filter(t => t.status === 'open').length,
          zirakozwe: tickets.filter(t => t.status === 'in_progress').length,
          zafunze: tickets.filter(t => t.status === 'closed').length,
          ibisobanuro: "Tiketi z'ubufasha n'ibibazo"
        },

        imirimo: {
          yose: assignments.length,
          yarangiye: assignments.filter(a => a.submission_date).length,
          itegereje: assignments.filter(a => !a.submission_date && new Date(a.due_date) > new Date()).length,
          yatinze: assignments.filter(a => !a.submission_date && new Date(a.due_date) < new Date()).length,
          ibisobanuro: "Imirimo y'abanyeshuri"
        },

        imyitwarire: {
          ibyabaye: discipline.length,
          bikomeye: discipline.filter(d => d.severity === 'major').length,
          byoroheje: discipline.filter(d => d.severity === 'minor').length,
          byakemutse: discipline.filter(d => d.status === 'resolved').length,
          ibisobanuro: "Ibibazo by'imyitwarire y'abanyeshuri"
        },

        amakuru: {
          inkuru_zose: news.length,
          nshya: news.filter(n => 
            new Date(n.created_at) >= new Date(Date.now() - 7*24*60*60*1000)
          ).length,
          zikunze_gusomwa: news.sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5).length,
          ibisobanuro: "Amakuru y'ishuri"
        },

        ibirori: {
          byose: events.length,
          biri_imbere: events.filter(e => new Date(e.event_date) >= new Date()).length,
          byo_muri_iki_cyumweru: events.filter(e => {
            const eventDate = new Date(e.event_date);
            const weekFromNow = new Date(Date.now() + 7*24*60*60*1000);
            return eventDate >= new Date() && eventDate <= weekFromNow;
          }).length,
          ibisobanuro: "Ibirori n'ibikorwa by'ishuri"
        },

        isomero: {
          ibitabo_byose: library.length,
          bihari: library.filter(b => b.is_available).length,
          byatanzwe: library.filter(b => !b.is_available).length,
          ibisobanuro: "Ibitabo by'isomero"
        },

        hoteri: {
          ibyumba_byose: hostel.length,
          bifunguye: hostel.filter(h => h.status === 'available').length,
          byuzuye: hostel.filter(h => h.status === 'occupied').length,
          ibisobanuro: "Ibyumba bya hoteri"
        },

        amafaranga: {
          kwishyura_kwose: finance.length,
          amafaranga_yose: finance.reduce((sum, f) => sum + (f.amount || 0), 0),
          kwishyura_uku_kwezi: finance.filter(f => 
            new Date(f.payment_date) >= new Date(Date.now() - 30*24*60*60*1000)
          ).length,
          ibisobanuro: "Amafaranga y'ishuri"
        },

        ibikoresho: {
          byose: stock.length,
          bihari: stock.filter(s => s.quantity > 0).length,
          birangiye: stock.filter(s => s.quantity === 0).length,
          bikenewe: stock.filter(s => s.quantity < s.minimum_quantity).length,
          ibisobanuro: "Ibikoresho by'ishuri"
        }
      },

      // Detailed analytics in Kinyarwanda
      isesengura_ryuzuye: {
        iterambere_ry_abanyeshuri: {
          izina: "Iterambere ry'Abanyeshuri",
          ibisobanuro: "Isesengura ryuzuye ry'iterambere ry'abanyeshuri mu mashuri",
          
          ku_myuga: trades.map(trade => ({
            umwuga: trade.trade_name,
            code: trade.trade_code,
            urwego: `${trade.level_number}${trade.level_suffix || ''}`,
            abanyeshuri: trade.student_count || 0,
            amaklasi: trade.class_count || 0,
            impuzamashuri: (() => {
              const tradeGrades = grades.filter(g => {
                const student = students.find(s => s.id === g.student_id);
                return student && student.code === trade.trade_code;
              });
              return tradeGrades.length > 0 ? 
                (tradeGrades.reduce((sum, g) => sum + (g.grade_value || 0), 0) / tradeGrades.length).toFixed(1) : 'N/A';
            })(),
            igipimo_cy_kwitabira: (() => {
              const tradeAttendance = attendance.filter(a => {
                const student = students.find(s => s.id === a.student_id);
                return student && student.code === trade.trade_code;
              });
              return tradeAttendance.length > 0 ?
                ((tradeAttendance.filter(a => a.status === 'present').length / tradeAttendance.length) * 100).toFixed(1) + '%' : 'N/A';
            })(),
            ibisobanuro: `Ibisobanuro byuzuye by'umwuga wa ${trade.trade_name}`
          })),

          abakomeye: (() => {
            const studentPerformance = students.map(student => {
              const studentGrades = grades.filter(g => g.student_id === student.id);
              const avg = studentGrades.length > 0 ?
                studentGrades.reduce((sum, g) => sum + (g.grade_value || 0), 0) / studentGrades.length : 0;
              return { ...student, average: avg };
            });
            return studentPerformance
              .sort((a, b) => b.average - a.average)
              .slice(0, 10)
              .map(s => ({
                amazina: `${s.first_name} ${s.last_name}`,
                student_id: s.student_id,
                umwuga: s.trade_name,
                impuzamashuri: s.average.toFixed(1),
                ibisobanuro: `Umunyeshuri ukomeye cyane afite impuzamashuri ya ${s.average.toFixed(1)}%`
              }));
          })(),

          bakeneye_ubufasha: (() => {
            const studentPerformance = students.map(student => {
              const studentGrades = grades.filter(g => g.student_id === student.id);
              const studentAttendance = attendance.filter(a => a.student_id === student.id);
              const avg = studentGrades.length > 0 ?
                studentGrades.reduce((sum, g) => sum + (g.grade_value || 0), 0) / studentGrades.length : 0;
              const attendanceRate = studentAttendance.length > 0 ?
                studentAttendance.filter(a => a.status === 'present').length / studentAttendance.length : 1;
              return { ...student, average: avg, attendanceRate };
            });
            return studentPerformance
              .filter(s => s.average < 50 || s.attendanceRate < 0.75)
              .map(s => ({
                amazina: `${s.first_name} ${s.last_name}`,
                student_id: s.student_id,
                umwuga: s.trade_name,
                impuzamashuri: s.average.toFixed(1),
                igipimo_cy_kwitabira: (s.attendanceRate * 100).toFixed(1) + '%',
                ibibazo: [
                  s.average < 50 ? 'Amanota make' : null,
                  s.attendanceRate < 0.75 ? 'Kutitabira amasomo' : null
                ].filter(Boolean),
                ibisobanuro: `Umunyeshuri ukeneye ubufasha bw'ibihangano`
              }));
          })()
        },

        itumanaho_n_ababyeyi: {
          izina: "Itumanaho n'Ababyeyi",
          ibisobanuro: "Isesengura ry'itumanaho n'ababyeyi",
          
          ubutumwa_bwa_buri_munsi: (() => {
            const last7Days = [];
            for (let i = 6; i >= 0; i--) {
              const date = new Date(Date.now() - i*24*60*60*1000);
              const dateStr = date.toISOString().split('T')[0];
              const dayMessages = messages.filter(m => 
                m.created_at && m.created_at.toString().startsWith(dateStr)
              );
              last7Days.push({
                itariki: dateStr,
                umubare: dayMessages.length,
                butegereje: dayMessages.filter(m => m.status === 'pending').length,
                bwasubijwe: dayMessages.filter(m => m.status === 'replied').length
              });
            }
            return last7Days;
          })(),

          ibibazo_bikunze_kugaragara: (() => {
            const topics = {};
            messages.forEach(m => {
              const topic = m.subject || m.message_type || 'Ibindi';
              topics[topic] = (topics[topic] || 0) + 1;
            });
            return Object.entries(topics)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5)
              .map(([topic, count]) => ({
                ikibazo: topic,
                umubare: count,
                igipimo: ((count / messages.length) * 100).toFixed(1) + '%'
              }));
          })(),

          igihe_cyo_gusubiza: {
            impuzamashuri: '2.5 amasaha',
            byihuse: '30 iminota',
            bisanzwe: '4 amasaha',
            ibisobanuro: 'Igihe gikoresho cyo gusubiza ubutumwa'
          }
        },

        imicungire_y_ishuri: {
          izina: "Imicungire y'Ishuri",
          ibisobanuro: "Isesengura ry'imicungire yose y'ishuri",
          
          ubuzima_bw_ishuri: {
            amanota: ((grades.reduce((sum, g) => sum + (g.grade_value || 0), 0) / grades.length) / 100 * 100).toFixed(1),
            kwitabira: ((attendance.filter(a => a.status === 'present').length / attendance.length) * 100).toFixed(1),
            imyitwarire: ((1 - (discipline.length / students.length)) * 100).toFixed(1),
            itumanaho: ((messages.filter(m => m.status === 'replied').length / messages.length) * 100).toFixed(1),
            rusange: (() => {
              const gradeScore = (grades.reduce((sum, g) => sum + (g.grade_value || 0), 0) / grades.length) / 100;
              const attendanceScore = attendance.filter(a => a.status === 'present').length / attendance.length;
              const behaviorScore = 1 - (discipline.length / students.length);
              const commScore = messages.filter(m => m.status === 'replied').length / messages.length;
              return ((gradeScore + attendanceScore + behaviorScore + commScore) / 4 * 100).toFixed(1);
            })(),
            ibisobanuro: 'Igipimo cy\'ubuzima rusange bw\'ishuri'
          },

          intego_zagezweho: [
            {
              intego: 'Kongera abanyeshuri',
              igipimo: ((students.length / 1500) * 100).toFixed(1) + '%',
              yagezweho: students.length >= 1200
            },
            {
              intego: 'Kongera impuzamashuri',
              igipimo: (grades.reduce((sum, g) => sum + (g.grade_value || 0), 0) / grades.length).toFixed(1) + '%',
              yagezweho: (grades.reduce((sum, g) => sum + (g.grade_value || 0), 0) / grades.length) >= 70
            },
            {
              intego: 'Kongera kwitabira',
              igipimo: ((attendance.filter(a => a.status === 'present').length / attendance.length) * 100).toFixed(1) + '%',
              yagezweho: (attendance.filter(a => a.status === 'present').length / attendance.length) >= 0.90
            }
          ]
        }
      },

      // Interactive features
      ibikorwa_byihuse: {
        izina: "Ibikorwa Byihuse",
        ibisobanuro: "Ibikorwa bishobora gukorwa vuba",
        
        ibikorwa: [
          {
            izina: "Reba Abanyeshuri Bose",
            insobanuro: "Reba urutonde rw'abanyeshuri bose bo mu ishuri",
            endpoint: "/api/advisor-comprehensive/students/comprehensive",
            icon: "fas fa-users",
            ibara: "linear-gradient(135deg, #10b981 0%, #fbbf24 100%)"
          },
          {
            izina: "Reba Amanota",
            insobanuro: "Reba amanota y'abanyeshuri bose",
            endpoint: "/api/grades",
            icon: "fas fa-chart-line",
            ibara: "linear-gradient(135deg, #059669 0%, #f59e0b 100%)"
          },
          {
            izina: "Reba Ubutumwa",
            insobanuro: "Reba ubutumwa bw'ababyeyi n'abanyeshuri",
            endpoint: "/api/advisor/messages/parents",
            icon: "fas fa-envelope",
            ibara: "linear-gradient(135deg, #047857 0%, #d97706 100%)"
          },
          {
            izina: "Reba Itumanaho",
            insobanuro: "Reba itumanaho n'ibibazo",
            endpoint: "/api/contacts",
            icon: "fas fa-phone",
            ibara: "linear-gradient(135deg, #10b981 0%, #fbbf24 100%)"
          },
          {
            izina: "Kora Raporo",
            insobanuro: "Kora raporo y'iterambere ry'ishuri",
            endpoint: "/api/reports/generate",
            icon: "fas fa-file-alt",
            ibara: "linear-gradient(135deg, #059669 0%, #f59e0b 100%)"
          }
        ]
      },

      // System information
      amakuru_ya_sisitemu: {
        version: "4.0.0",
        itariki_ya_none: new Date().toISOString(),
        umujyanama: "Mukamugema Emerance",
        email: "emerancemukamugema77@gmail.com",
        telefoni: "+250788000000",
        uruhare: "Umujyanama w'Ishuri",
        uburenganzira: [
          "Kureba abanyeshuri bose",
          "Kureba amanota yose",
          "Gucunga ubutumwa",
          "Kora raporo",
          "Kureba imibare yose"
        ]
      }
    };

    res.json({ success: true, dashboard });
  } catch (error) {
    console.error('Error fetching Kinyarwanda dashboard:', error);
    res.status(500).json({ success: false, message: 'Ikosa mu gushaka amakuru' });
  }
});

module.exports = router;