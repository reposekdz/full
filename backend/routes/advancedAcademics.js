const express = require('express');
const router = express.Router();
const pool = require('../config/database').pool;
const { authenticateToken, requireRole } = require('../middleware/auth');

// ================================
// ADVANCED ACADEMIC APIS (11-30)
// ================================

// 11. Comprehensive Curriculum Management with Standards Tracking
router.get('/curriculum/standards-alignment/:courseId', authenticateToken, async (req, res) => {
  try {
    const { courseId } = req.params;
    
    const [alignment] = await pool.execute(`
      SELECT 
        c.id,
        c.name as course_name,
        c.code,
        cs.standard_code,
        cs.standard_description,
        cs.alignment_percentage,
        cs.mastery_level,
        COUNT(DISTINCT lo.id) as learning_objectives_count,
        COUNT(DISTINCT a.id) as assessments_count,
        AVG(sr.proficiency_score) as average_proficiency,
        cs.last_updated
      FROM courses c
      JOIN curriculum_standards cs ON c.curriculum_id = cs.curriculum_id
      LEFT JOIN learning_objectives lo ON c.id = lo.course_id AND lo.standard_id = cs.id
      LEFT JOIN assessments a ON c.id = a.course_id AND a.standard_id = cs.id
      LEFT JOIN student_results sr ON a.id = sr.assessment_id
      WHERE c.id = ?
      GROUP BY c.id, cs.id
      ORDER BY cs.alignment_percentage DESC
    `, [courseId]);

    const [competencyMap] = await pool.execute(`
      SELECT 
        comp.id,
        comp.competency_name,
        comp.description,
        comp.bloom_level,
        COUNT(DISTINCT lo.id) as linked_objectives,
        AVG(sr.score) as mastery_average,
        COUNT(DISTINCT CASE WHEN sr.score >= comp.mastery_threshold THEN sr.student_id END) as students_mastered,
        COUNT(DISTINCT sr.student_id) as total_students
      FROM competencies comp
      JOIN learning_objectives lo ON comp.id = lo.competency_id
      JOIN assessments a ON lo.id = a.learning_objective_id
      LEFT JOIN student_results sr ON a.id = sr.assessment_id
      WHERE lo.course_id = ?
      GROUP BY comp.id
    `, [courseId]);

    res.json({
      success: true,
      message: 'Amategeko y\'inyigisho yashyizweho neza',
      standards_alignment: alignment,
      competency_mapping: competencyMap
    });
  } catch (error) {
    console.error('Curriculum standards error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ikosa mu gushaka amategeko y\'inyigisho' 
    });
  }
});

// 12. Advanced Assessment Management with Adaptive Testing
router.post('/assessments/adaptive/generate', [authenticateToken, requireRole('teacher', 'admin')], async (req, res) => {
  try {
    const { student_id, subject_area, difficulty_preference, question_count } = req.body;

    // Get student's performance history for adaptive selection
    const [studentHistory] = await pool.execute(`
      SELECT 
        AVG(score) as avg_score,
        COUNT(*) as total_assessments,
        AVG(CASE WHEN difficulty_level = 'easy' THEN score END) as easy_avg,
        AVG(CASE WHEN difficulty_level = 'medium' THEN score END) as medium_avg,
        AVG(CASE WHEN difficulty_level = 'hard' THEN score END) as hard_avg,
        MAX(created_at) as last_assessment
      FROM student_assessments sa
      JOIN assessments a ON sa.assessment_id = a.id
      WHERE sa.student_id = ? AND a.subject_area = ?
    `, [student_id, subject_area]);

    // Adaptive algorithm to select appropriate questions
    const adaptiveLevel = determineAdaptiveLevel(studentHistory[0]);
    
    const [questions] = await pool.execute(`
      SELECT 
        q.id,
        q.question_text,
        q.question_type,
        q.difficulty_level,
        q.cognitive_level,
        q.estimated_time,
        q.correct_answer,
        q.options,
        q.explanation,
        q.learning_objective_id,
        lo.objective_text
      FROM questions q
      JOIN learning_objectives lo ON q.learning_objective_id = lo.id
      WHERE q.subject_area = ? 
        AND q.difficulty_level = ?
        AND q.status = 'active'
      ORDER BY q.usage_count ASC, RAND()
      LIMIT ?
    `, [subject_area, adaptiveLevel, question_count]);

    // Create adaptive assessment
    const assessmentId = `ADAPTIVE_${Date.now()}`;
    await pool.execute(`
      INSERT INTO assessments (
        id, title, description, subject_area, difficulty_level,
        question_count, time_limit, adaptive_type, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'adaptive', ?)
    `, [
      assessmentId, 
      `Ikizamini cy'ikoranabuhanga cya ${subject_area}`,
      `Ikizamini gihinduka ukurikije ubushobozi bwa ${student_id}`,
      subject_area, 
      adaptiveLevel,
      questions.length,
      questions.length * 2, // 2 minutes per question
      req.user.id
    ]);

    // Link questions to assessment
    for (const [index, question] of questions.entries()) {
      await pool.execute(`
        INSERT INTO assessment_questions (assessment_id, question_id, order_number, points)
        VALUES (?, ?, ?, ?)
      `, [assessmentId, question.id, index + 1, calculateQuestionPoints(question)]);
    }

    res.json({
      success: true,
      message: 'Ikizamini gihinduka cyakozwe neza',
      assessment_id: assessmentId,
      questions: questions.map(q => ({
        id: q.id,
        question_text: q.question_text,
        question_type: q.question_type,
        options: q.question_type === 'multiple_choice' ? JSON.parse(q.options || '[]') : null,
        estimated_time: q.estimated_time,
        cognitive_level: q.cognitive_level
      })),
      adaptive_level: adaptiveLevel,
      total_time: questions.reduce((sum, q) => sum + q.estimated_time, 0)
    });
  } catch (error) {
    console.error('Adaptive assessment error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ikosa mu gukora ikizamini gihinduka' 
    });
  }
});

// 13. Learning Analytics and Progress Visualization
router.get('/analytics/learning-paths/:studentId', authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.params;

    // Comprehensive learning path analysis
    const [learningJourney] = await pool.execute(`
      SELECT 
        lp.id as path_id,
        lp.path_name,
        lp.description,
        lp.estimated_duration,
        lps.current_step,
        lps.completion_percentage,
        lps.started_date,
        lps.expected_completion,
        COUNT(DISTINCT lpo.id) as total_objectives,
        COUNT(DISTINCT CASE WHEN so.mastery_level >= 70 THEN so.id END) as mastered_objectives,
        AVG(so.mastery_level) as overall_mastery,
        lps.last_activity_date
      FROM learning_paths lp
      JOIN learning_path_students lps ON lp.id = lps.path_id
      LEFT JOIN learning_path_objectives lpo ON lp.id = lpo.path_id
      LEFT JOIN student_objectives so ON lpo.objective_id = so.objective_id AND so.student_id = lps.student_id
      WHERE lps.student_id = ?
      GROUP BY lp.id, lps.id
      ORDER BY lps.started_date DESC
    `, [studentId]);

    // Skill progression tracking
    const [skillProgression] = await pool.execute(`
      SELECT 
        s.skill_name,
        s.skill_category,
        sp.current_level,
        sp.target_level,
        sp.progress_percentage,
        sp.last_assessment_score,
        sp.improvement_rate,
        sp.next_milestone,
        DATEDIFF(sp.target_completion_date, CURDATE()) as days_remaining,
        COUNT(DISTINCT sa.id) as practice_sessions
      FROM skills s
      JOIN student_skills sp ON s.id = sp.skill_id
      LEFT JOIN skill_assessments sa ON s.id = sa.skill_id AND sa.student_id = sp.student_id
      WHERE sp.student_id = ?
      ORDER BY sp.progress_percentage ASC
    `, [studentId]);

    // Knowledge gaps identification
    const [knowledgeGaps] = await pool.execute(`
      SELECT 
        lo.objective_text,
        lo.subject_area,
        lo.difficulty_level,
        AVG(sr.score) as current_score,
        lo.target_score,
        (lo.target_score - AVG(sr.score)) as gap_size,
        COUNT(DISTINCT sr.id) as attempts,
        MAX(sr.assessment_date) as last_attempt,
        CASE 
          WHEN AVG(sr.score) < 40 THEN 'Bikabije'
          WHEN AVG(sr.score) < 60 THEN 'Byihuse' 
          WHEN AVG(sr.score) < 80 THEN 'Biringaniye'
          ELSE 'Byiza'
        END as gap_severity
      FROM learning_objectives lo
      JOIN assessments a ON lo.id = a.learning_objective_id
      JOIN student_results sr ON a.id = sr.assessment_id
      WHERE sr.student_id = ? AND AVG(sr.score) < lo.target_score
      GROUP BY lo.id
      HAVING gap_size > 10
      ORDER BY gap_size DESC
    `, [studentId]);

    res.json({
      success: true,
      message: 'Isesengura ry\'ubwiyunge ryashyizweho',
      learning_journey: learningJourney,
      skill_progression: skillProgression,
      knowledge_gaps: knowledgeGaps,
      recommendations: generateLearningRecommendations(learningJourney, skillProgression, knowledgeGaps)
    });
  } catch (error) {
    console.error('Learning analytics error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ikosa mu gusesengura ubwiyunge' 
    });
  }
});

// 14. Digital Library and Resource Management
router.get('/library/intelligent-recommendations/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { subject_area, resource_type, difficulty_level } = req.query;

    // Get user's reading history and preferences
    const [readingHistory] = await pool.execute(`
      SELECT 
        r.id,
        r.title,
        r.subject_area,
        r.resource_type,
        r.difficulty_level,
        rh.reading_progress,
        rh.completion_date,
        rh.rating,
        rh.time_spent
      FROM resources r
      JOIN reading_history rh ON r.id = rh.resource_id
      WHERE rh.user_id = ?
      ORDER BY rh.access_date DESC
    `, [userId]);

    // Intelligent recommendations using collaborative filtering
    const [recommendations] = await pool.execute(`
      SELECT 
        r.id,
        r.title,
        r.description,
        r.subject_area,
        r.resource_type,
        r.difficulty_level,
        r.file_path,
        r.file_size,
        r.duration_minutes,
        AVG(rr.rating) as average_rating,
        COUNT(DISTINCT rr.id) as rating_count,
        r.download_count,
        r.view_count,
        rs.relevance_score,
        CASE 
          WHEN r.subject_area IN (SELECT DISTINCT subject_area FROM reading_history WHERE user_id = ?) THEN 5
          ELSE 0
        END as subject_preference_bonus
      FROM resources r
      LEFT JOIN resource_ratings rr ON r.id = rr.resource_id
      LEFT JOIN resource_similarities rs ON r.id = rs.similar_resource_id AND rs.base_resource_id IN (
        SELECT resource_id FROM reading_history WHERE user_id = ? ORDER BY access_date DESC LIMIT 10
      )
      WHERE r.status = 'published'
      ${subject_area ? 'AND r.subject_area = ?' : ''}
      ${resource_type ? 'AND r.resource_type = ?' : ''}
      ${difficulty_level ? 'AND r.difficulty_level = ?' : ''}
      AND r.id NOT IN (SELECT resource_id FROM reading_history WHERE user_id = ?)
      GROUP BY r.id
      ORDER BY (COALESCE(rs.relevance_score, 0) + subject_preference_bonus + AVG(COALESCE(rr.rating, 0))) DESC
      LIMIT 20
    `, [userId, userId, subject_area, resource_type, difficulty_level, userId].filter(Boolean));

    // Trending resources
    const [trendingResources] = await pool.execute(`
      SELECT 
        r.id,
        r.title,
        r.subject_area,
        r.resource_type,
        COUNT(DISTINCT rh.user_id) as unique_readers_week,
        AVG(rr.rating) as week_avg_rating,
        SUM(rh.time_spent) as total_engagement_time
      FROM resources r
      JOIN reading_history rh ON r.id = rh.resource_id
      LEFT JOIN resource_ratings rr ON r.id = rr.resource_id
      WHERE rh.access_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY r.id
      HAVING unique_readers_week >= 5
      ORDER BY unique_readers_week DESC, week_avg_rating DESC
      LIMIT 10
    `);

    res.json({
      success: true,
      message: 'Ibisabwa by\'isomero byashyizweho neza',
      recommendations: recommendations,
      trending_resources: trendingResources,
      reading_stats: {
        total_resources_read: readingHistory.length,
        average_rating_given: readingHistory.filter(r => r.rating).reduce((sum, r) => sum + r.rating, 0) / readingHistory.filter(r => r.rating).length || 0,
        total_time_spent: readingHistory.reduce((sum, r) => sum + (r.time_spent || 0), 0)
      }
    });
  } catch (error) {
    console.error('Library recommendations error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ikosa mu gushaka ibisabwa by\'isomero' 
    });
  }
});

// 15. Advanced Research and Project Management
router.post('/research/projects/collaborative-matching', [authenticateToken, requireRole('student', 'teacher')], async (req, res) => {
  try {
    const { project_interests, skill_areas, collaboration_preferences } = req.body;
    const userId = req.user.id;

    // Find potential collaborators based on complementary skills
    const [potentialCollaborators] = await pool.execute(`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.role,
        GROUP_CONCAT(DISTINCT us.skill_name) as skills,
        GROUP_CONCAT(DISTINCT pi.interest_area) as interests,
        AVG(pr.collaboration_rating) as collaboration_score,
        COUNT(DISTINCT rp.id) as completed_projects,
        cp.availability_status,
        cp.preferred_team_size,
        cp.communication_style
      FROM users u
      JOIN user_skills us ON u.id = us.user_id
      JOIN project_interests pi ON u.id = pi.user_id
      LEFT JOIN project_ratings pr ON u.id = pr.rated_user_id
      LEFT JOIN research_projects rp ON u.id = rp.participant_id
      LEFT JOIN collaboration_preferences cp ON u.id = cp.user_id
      WHERE u.id != ? 
        AND u.status = 'active'
        AND cp.availability_status = 'available'
        AND EXISTS (
          SELECT 1 FROM user_skills us2 
          WHERE us2.user_id = u.id 
          AND us2.skill_name IN (?)
        )
      GROUP BY u.id
      HAVING collaboration_score >= 4.0 OR collaboration_score IS NULL
      ORDER BY collaboration_score DESC, completed_projects DESC
      LIMIT 15
    `, [userId, skill_areas.join(',')]);

    // Suggest research projects based on interests and trending topics
    const [suggestedProjects] = await pool.execute(`
      SELECT 
        rpt.id,
        rpt.title,
        rpt.description,
        rpt.research_area,
        rpt.difficulty_level,
        rpt.estimated_duration,
        rpt.required_skills,
        rpt.max_participants,
        COUNT(DISTINCT pp.user_id) as current_participants,
        rpt.supervisor_id,
        u.name as supervisor_name,
        rpt.funding_available,
        rpt.publication_potential,
        MATCH(rpt.title, rpt.description, rpt.research_area) AGAINST (? IN NATURAL LANGUAGE MODE) as relevance_score
      FROM research_project_templates rpt
      JOIN users u ON rpt.supervisor_id = u.id
      LEFT JOIN project_participants pp ON rpt.id = pp.project_template_id
      WHERE rpt.status = 'open'
        AND (rpt.max_participants > (SELECT COUNT(*) FROM project_participants WHERE project_template_id = rpt.id))
        AND MATCH(rpt.title, rpt.description, rpt.research_area) AGAINST (? IN NATURAL LANGUAGE MODE)
      GROUP BY rpt.id
      ORDER BY relevance_score DESC, rpt.publication_potential DESC
      LIMIT 10
    `, [project_interests.join(' '), project_interests.join(' ')]);

    // Generate collaboration opportunities
    const collaborationOpportunities = generateCollaborationMatrix(potentialCollaborators, suggestedProjects, skill_areas);

    res.json({
      success: true,
      message: 'Amahirwe yo gufashanya mu bushakashatsi yashyizweho',
      potential_collaborators: potentialCollaborators,
      suggested_projects: suggestedProjects,
      collaboration_opportunities: collaborationOpportunities,
      matching_score: calculateMatchingScore(potentialCollaborators, suggestedProjects)
    });
  } catch (error) {
    console.error('Research collaboration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ikosa mu gushaka amahirwe yo gufashanya' 
    });
  }
});

// ================================
// STUDENT SUPPORT AND WELLNESS APIS (16-25)
// ================================

// 16. Mental Health and Wellness Tracking
router.get('/wellness/student-health-dashboard/:studentId', [authenticateToken, requireRole('counselor', 'admin', 'nurse')], async (req, res) => {
  try {
    const { studentId } = req.params;

    // Comprehensive health and wellness tracking
    const [healthMetrics] = await pool.execute(`
      SELECT 
        hc.id,
        hc.check_date,
        hc.physical_health_score,
        hc.mental_health_score,
        hc.stress_level,
        hc.sleep_quality,
        hc.exercise_frequency,
        hc.nutrition_score,
        hc.social_interaction_score,
        hc.academic_pressure_level,
        hc.notes,
        hc.counselor_id,
        u.name as counselor_name
      FROM health_checkups hc
      LEFT JOIN users u ON hc.counselor_id = u.id
      WHERE hc.student_id = ?
      ORDER BY hc.check_date DESC
      LIMIT 10
    `, [studentId]);

    // Mood tracking and patterns
    const [moodTracking] = await pool.execute(`
      SELECT 
        DATE(mt.entry_date) as date,
        AVG(mt.mood_score) as daily_mood,
        GROUP_CONCAT(DISTINCT mt.mood_tags) as mood_indicators,
        COUNT(DISTINCT mt.id) as entries_count,
        AVG(mt.energy_level) as energy_level,
        AVG(mt.anxiety_level) as anxiety_level
      FROM mood_tracking mt
      WHERE mt.student_id = ? 
        AND mt.entry_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY DATE(mt.entry_date)
      ORDER BY date DESC
    `, [studentId]);

    // Support interventions and their effectiveness
    const [supportInterventions] = await pool.execute(`
      SELECT 
        si.id,
        si.intervention_type,
        si.description,
        si.start_date,
        si.end_date,
        si.effectiveness_rating,
        si.progress_notes,
        si.status,
        u.name as counselor_name,
        COUNT(DISTINCT sf.id) as followup_sessions
      FROM support_interventions si
      JOIN users u ON si.counselor_id = u.id
      LEFT JOIN support_followups sf ON si.id = sf.intervention_id
      WHERE si.student_id = ?
      ORDER BY si.start_date DESC
    `, [studentId]);

    // Risk assessment and alerts
    const riskAssessment = calculateWellnessRiskLevel(healthMetrics, moodTracking);

    res.json({
      success: true,
      message: 'Raporo y\'ubuzima yashyizweho neza',
      health_metrics: healthMetrics,
      mood_tracking: moodTracking,
      support_interventions: supportInterventions,
      risk_assessment: riskAssessment,
      wellness_recommendations: generateWellnessRecommendations(healthMetrics, moodTracking, riskAssessment)
    });
  } catch (error) {
    console.error('Wellness tracking error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ikosa mu gukurikirana ubuzima' 
    });
  }
});

// 17. Career Guidance and Path Planning
router.get('/career/guidance-assessment/:studentId', authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.params;

    // Career aptitude assessment results
    const [aptitudeResults] = await pool.execute(`
      SELECT 
        ca.id,
        ca.assessment_date,
        ca.logical_reasoning_score,
        ca.verbal_ability_score,
        ca.numerical_ability_score,
        ca.spatial_intelligence_score,
        ca.creative_thinking_score,
        ca.leadership_potential_score,
        ca.technical_aptitude_score,
        ca.social_skills_score,
        ca.overall_percentile,
        ca.recommended_career_paths
      FROM career_assessments ca
      WHERE ca.student_id = ?
      ORDER BY ca.assessment_date DESC
      LIMIT 5
    `, [studentId]);

    // Interest profiling and career matching
    const [careerMatches] = await pool.execute(`
      SELECT 
        cp.career_title,
        cp.industry_sector,
        cp.education_requirements,
        cp.average_salary_range,
        cp.job_outlook,
        cp.required_skills,
        ci.interest_level,
        ci.aptitude_match_percentage,
        ci.personality_fit_score,
        ci.market_demand_score,
        (ci.interest_level + ci.aptitude_match_percentage + ci.personality_fit_score + ci.market_demand_score) / 4 as overall_match_score
      FROM career_profiles cp
      JOIN career_interests ci ON cp.id = ci.career_profile_id
      WHERE ci.student_id = ?
      ORDER BY overall_match_score DESC
      LIMIT 15
    `, [studentId]);

    // Educational pathway recommendations
    const [educationalPaths] = await pool.execute(`
      SELECT 
        ep.id,
        ep.pathway_name,
        ep.description,
        ep.duration_years,
        ep.entry_requirements,
        ep.career_outcomes,
        ep.success_rate,
        epi.student_interest_score,
        epi.feasibility_score,
        epi.alignment_with_goals
      FROM educational_pathways ep
      JOIN educational_pathway_interests epi ON ep.id = epi.pathway_id
      WHERE epi.student_id = ?
      ORDER BY (epi.student_interest_score + epi.feasibility_score + epi.alignment_with_goals) DESC
      LIMIT 10
    `, [studentId]);

    // Mentorship opportunities
    const [mentorshipOpportunities] = await pool.execute(`
      SELECT 
        m.id,
        u.name as mentor_name,
        u.email as mentor_email,
        m.profession,
        m.industry,
        m.experience_years,
        m.expertise_areas,
        m.availability_status,
        m.mentorship_style,
        m.success_stories_count,
        AVG(mr.rating) as mentor_rating
      FROM mentors m
      JOIN users u ON m.user_id = u.id
      LEFT JOIN mentor_ratings mr ON m.id = mr.mentor_id
      WHERE m.availability_status = 'available'
        AND EXISTS (
          SELECT 1 FROM career_interests ci 
          JOIN career_profiles cp ON ci.career_profile_id = cp.id
          WHERE ci.student_id = ? AND cp.industry_sector = m.industry
        )
      GROUP BY m.id
      ORDER BY mentor_rating DESC, m.success_stories_count DESC
      LIMIT 8
    `, [studentId]);

    res.json({
      success: true,
      message: 'Ubuyobozi bw\'umwuga bushyizweho neza',
      aptitude_results: aptitudeResults,
      career_matches: careerMatches,
      educational_paths: educationalPaths,
      mentorship_opportunities: mentorshipOpportunities,
      career_recommendations: generateCareerRecommendations(aptitudeResults, careerMatches, educationalPaths)
    });
  } catch (error) {
    console.error('Career guidance error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ikosa mu buyobozi bw\'umwuga' 
    });
  }
});

// Helper functions for academic features

function determineAdaptiveLevel(studentHistory) {
  if (!studentHistory || !studentHistory.avg_score) return 'medium';
  
  const avgScore = studentHistory.avg_score;
  if (avgScore >= 85) return 'hard';
  if (avgScore >= 70) return 'medium';
  return 'easy';
}

function calculateQuestionPoints(question) {
  const basePoints = 10;
  const difficultyMultiplier = {
    'easy': 1,
    'medium': 1.5,
    'hard': 2
  };
  
  return Math.round(basePoints * (difficultyMultiplier[question.difficulty_level] || 1));
}

function generateLearningRecommendations(journey, skills, gaps) {
  const recommendations = [];
  
  // Based on knowledge gaps
  const criticalGaps = gaps.filter(gap => gap.gap_severity === 'Bikabije');
  if (criticalGaps.length > 0) {
    recommendations.push({
      type: 'Ubufasha bwihariye',
      description: `Gusaba ubufasha mu ${criticalGaps[0].subject_area}`,
      priority: 'Byihuse',
      estimated_time: '2-3 ibyumweru'
    });
  }
  
  // Based on skill progression
  const slowProgressSkills = skills.filter(skill => skill.improvement_rate < 0.1);
  if (slowProgressSkills.length > 0) {
    recommendations.push({
      type: 'Guhindura amayega',
      description: `Korora uburyo bushya bwo kwiga ${slowProgressSkills[0].skill_name}`,
      priority: 'Biringaniye',
      estimated_time: '1 icyumweru'
    });
  }
  
  return recommendations;
}

function generateCollaborationMatrix(collaborators, projects, skills) {
  const opportunities = [];
  
  for (const project of projects) {
    const suitableCollaborators = collaborators.filter(collab => {
      const collaborSkills = collab.skills ? collab.skills.split(',') : [];
      const projectSkills = project.required_skills ? project.required_skills.split(',') : [];
      
      return projectSkills.some(skill => collaborSkills.includes(skill.trim()));
    });
    
    if (suitableCollaborators.length > 0) {
      opportunities.push({
        project_id: project.id,
        project_title: project.title,
        suitable_collaborators: suitableCollaborators.slice(0, 3),
        collaboration_potential: calculateCollaborationPotential(suitableCollaborators, project)
      });
    }
  }
  
  return opportunities;
}

function calculateMatchingScore(collaborators, projects) {
  if (!collaborators.length || !projects.length) return 0;
  
  const totalPossibleMatches = collaborators.length * projects.length;
  const actualMatches = collaborators.reduce((count, collab) => {
    return count + projects.filter(proj => 
      proj.required_skills && collab.skills && 
      proj.required_skills.split(',').some(skill => collab.skills.includes(skill.trim()))
    ).length;
  }, 0);
  
  return Math.round((actualMatches / totalPossibleMatches) * 100);
}

function calculateCollaborationPotential(collaborators, project) {
  const skillCoverage = calculateSkillCoverage(collaborators, project);
  const experienceLevel = collaborators.reduce((sum, c) => sum + (c.completed_projects || 0), 0) / collaborators.length;
  const collaborationScore = collaborators.reduce((sum, c) => sum + (c.collaboration_score || 4), 0) / collaborators.length;
  
  return Math.round((skillCoverage * 0.4 + experienceLevel * 0.3 + collaborationScore * 0.3) * 20);
}

function calculateSkillCoverage(collaborators, project) {
  if (!project.required_skills) return 0.5;
  
  const requiredSkills = project.required_skills.split(',').map(s => s.trim());
  const availableSkills = collaborators.reduce((skills, collab) => {
    if (collab.skills) {
      skills.push(...collab.skills.split(',').map(s => s.trim()));
    }
    return skills;
  }, []);
  
  const coveredSkills = requiredSkills.filter(skill => availableSkills.includes(skill));
  return coveredSkills.length / requiredSkills.length;
}

function calculateWellnessRiskLevel(healthMetrics, moodTracking) {
  if (!healthMetrics.length && !moodTracking.length) {
    return { level: 'Nta makuru', score: 0, alerts: [] };
  }
  
  const recentHealth = healthMetrics[0] || {};
  const recentMood = moodTracking.slice(0, 7); // Last 7 days
  
  let riskScore = 0;
  const alerts = [];
  
  // Physical health indicators
  if (recentHealth.physical_health_score < 40) {
    riskScore += 30;
    alerts.push('Ubuzima bw\'umubiri bumeze nabi');
  }
  
  // Mental health indicators
  if (recentHealth.mental_health_score < 40) {
    riskScore += 40;
    alerts.push('Ubuzima bw\'ubwoba bumeze nabi');
  }
  
  // Stress levels
  if (recentHealth.stress_level > 80) {
    riskScore += 25;
    alerts.push('Urwango rwinshi');
  }
  
  // Mood patterns
  const averageMood = recentMood.reduce((sum, m) => sum + (m.daily_mood || 50), 0) / (recentMood.length || 1);
  if (averageMood < 40) {
    riskScore += 20;
    alerts.push('Imyumvire idahwitse');
  }
  
  let level = 'Nta kintu';
  if (riskScore >= 80) level = 'Bikabije';
  else if (riskScore >= 50) level = 'Byihuse';
  else if (riskScore >= 25) level = 'Biringaniye';
  
  return { level, score: riskScore, alerts };
}

function generateWellnessRecommendations(healthMetrics, moodTracking, riskAssessment) {
  const recommendations = [];
  
  if (riskAssessment.level === 'Bikabije') {
    recommendations.push({
      category: 'Ubufasha bwihariye',
      action: 'Gusaba ubufasha bw\'umuganga w\'ubwoba',
      urgency: 'Byihuse',
      timeframe: 'Ako kanya'
    });
  }
  
  if (riskAssessment.alerts.includes('Urwango rwinshi')) {
    recommendations.push({
      category: 'Gukuraho urwango',
      action: 'Kwiga amayega yo kurhuriraho no gutegama',
      urgency: 'Biringaniye',
      timeframe: '1-2 ibyumweru'
    });
  }
  
  if (riskAssessment.alerts.includes('Imyumvire idahwitse')) {
    recommendations.push({
      category: 'Kuzamura imyumvire',
      action: 'Kwiyungurura cyangwa gusohoka',
      urgency: 'Biringaniye',
      timeframe: 'Buri munsi'
    });
  }
  
  return recommendations;
}

function generateCareerRecommendations(aptitude, matches, paths) {
  const recommendations = [];
  
  if (matches.length > 0) {
    const topMatch = matches[0];
    recommendations.push({
      category: 'Umwuga usanzwe',
      description: `Ugomba kwiga byinshi kuri ${topMatch.career_title}`,
      next_steps: ['Gushakisha amahugurwa akwiye', 'Kubana n\'abandi bakozi muri ubwo bwuga'],
      timeline: '3-6 amezi'
    });
  }
  
  if (aptitude.length > 0) {
    const latest = aptitude[0];
    if (latest.technical_aptitude_score > 80) {
      recommendations.push({
        category: 'Ubuhanga',
        description: 'Ufite ubushobozi bwinshi mu buhanga',
        next_steps: ['Kwiga porogaramu', 'Gukora imishinga y\'ikoranabuhanga'],
        timeline: '6-12 amezi'
      });
    }
  }
  
  return recommendations;
}

module.exports = router;