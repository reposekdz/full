const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/leadership/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// GET all leaders
router.get('/', async (req, res) => {
  try {
    const [leaders] = await pool.execute('SELECT * FROM leadership WHERE status = "active" ORDER BY display_order, role, id ASC');
    
    // Define role order
    const roleOrder = { owner: 1, advisor: 2, headmaster: 3, director_study: 4, accountant: 5, patron: 6, matron: 7 };
    
    // Filter out cards without images, keep cards with images
    const filteredLeaders = [];
    const processedRoles = new Set();
    
    leaders.forEach(leader => {
      const role = leader.role || leader.position;
      
      // Skip if already processed (remove duplicates) or no image
      if (processedRoles.has(role) || (!leader.image_url && role !== 'owner')) {
        return;
      }
      
      processedRoles.add(role);
      
      if (role === 'advisor') {
        filteredLeaders.push({
          ...leader,
          description: 'Fostering positive relationship with parent, student and community',
          phone: '0788815924',
          image_url: leader.image_url || '/uploads/leadership/mukamugenga emmerance.jpg',
          services: [
            'Academic Guidance & Counseling',
            'Parent-Student-Community Relations',
            'Career Development Planning',
            'Personal Development Support',
            'Study Planning & Goal Setting',
            'Student Welfare & Support'
          ],
          order: roleOrder.advisor || 99
        });
      } else if (role === 'accountant') {
        filteredLeaders.push({
          ...leader,
          description: 'Accountant services and other related services',
          phone: '0788622709',
          image_url: leader.image_url || '/uploads/leadership/accountant.jpg',
          services: [
            'Financial Management & Reporting',
            'Budget Planning & Analysis',
            'Fee Collection & Management',
            'Expense Tracking & Control',
            'Financial Auditing',
            'Tax Compliance & Filing',
            'Payroll Management',
            'Investment Advisory'
          ],
          order: roleOrder.accountant || 99
        });
      } else if (role === 'director_study') {
        filteredLeaders.push({
          ...leader,
          image_url: leader.image_url || '/uploads/leadership/masezerano issac DOS.jpeg',
          order: roleOrder.director_study || 99
        });
      } else if (role === 'patron') {
        filteredLeaders.push({
          ...leader,
          image_url: leader.image_url || '/uploads/leadership/patron.jpg',
          order: roleOrder.patron || 99
        });
      } else {
        filteredLeaders.push({
          ...leader,
          order: roleOrder[role] || 99
        });
      }
    });
    
    // Always add school owner (has image)
    if (!processedRoles.has('owner')) {
      filteredLeaders.push({
        id: 999,
        first_name: 'Rugambage',
        last_name: 'Andre',
        position: 'School Owner',
        role: 'owner',
        description: 'Visionary leader and founder of Garden TVET School',
        image_url: '/uploads/leadership/school owner.png',
        services: [
          'Strategic Leadership & Vision',
          'Educational Excellence Oversight',
          'Community Development',
          'Innovation & Growth Planning',
          'Stakeholder Relations',
          'Quality Assurance'
        ],
        status: 'active',
        order: roleOrder.owner || 1
      });
    }
    
    // Sort by order
    const sortedLeaders = filteredLeaders.sort((a, b) => a.order - b.order);
    
    res.json({ success: true, leaders: sortedLeaders });
  } catch (error) {
    console.error('Error fetching leaders:', error);
    res.status(500).json({ success: false, message: 'Error fetching leaders' });
  }
});

// GET advisor specifically
router.get('/advisor', async (req, res) => {
  try {
    const [advisors] = await pool.execute(
      'SELECT * FROM leadership WHERE role = "advisor" AND status = "active" ORDER BY id ASC'
    );
    
    if (advisors.length > 0) {
      const advisor = {
        ...advisors[0],
        description: 'Fostering positive relationship with parent, student and community',
        phone: '0788815924',
        services: [
          'Academic Guidance & Counseling',
          'Parent-Student-Community Relations',
          'Career Development Planning',
          'Personal Development Support',
          'Study Planning & Goal Setting',
          'Student Welfare & Support',
          'Community Engagement',
          'Educational Psychology Support'
        ],
        availability: {
          monday: '8:00 AM - 5:00 PM',
          tuesday: '8:00 AM - 5:00 PM',
          wednesday: '8:00 AM - 5:00 PM',
          thursday: '8:00 AM - 5:00 PM',
          friday: '8:00 AM - 4:00 PM'
        },
        contact_methods: [
          { type: 'email', value: advisors[0].email, label: 'Email' },
          { type: 'phone', value: '0788815924', label: 'Phone' },
          { type: 'office', value: advisors[0].office_location || 'Student Affairs Office', label: 'Office' }
        ],
        specializations: [
          'Educational Psychology',
          'Community Engagement',
          'Student Counseling',
          'Academic Planning'
        ]
      };
      
      res.json({ success: true, advisor });
    } else {
      res.json({ success: true, advisor: null });
    }
  } catch (error) {
    console.error('Error fetching advisor:', error);
    res.status(500).json({ success: false, message: 'Error fetching advisor' });
  }
});

// GET accountant specifically
router.get('/accountant', async (req, res) => {
  try {
    const [accountants] = await pool.execute(
      'SELECT * FROM leadership WHERE role = "accountant" AND status = "active" ORDER BY id ASC'
    );
    
    if (accountants.length > 0) {
      const accountant = {
        ...accountants[0],
        description: 'Accountant services and other related services',
        phone: '0788622709',
        services: [
          'Financial Management & Reporting',
          'Budget Planning & Analysis',
          'Fee Collection & Management',
          'Expense Tracking & Control',
          'Financial Auditing',
          'Tax Compliance & Filing',
          'Payroll Management',
          'Investment Advisory'
        ],
        availability: {
          monday: '8:00 AM - 5:00 PM',
          tuesday: '8:00 AM - 5:00 PM',
          wednesday: '8:00 AM - 5:00 PM',
          thursday: '8:00 AM - 5:00 PM',
          friday: '8:00 AM - 4:00 PM'
        },
        contact_methods: [
          { type: 'email', value: accountant.email, label: 'Email' },
          { type: 'phone', value: '0788622709', label: 'Phone' },
          { type: 'office', value: accountant.office_location || 'Finance Office', label: 'Office' }
        ],
        specializations: [
          'Financial Accounting',
          'Management Accounting',
          'Auditing & Assurance',
          'Tax Planning'
        ]
      };
    }
    
    res.json({ success: true, accountant: accountants[0] || null });
  } catch (error) {
    console.error('Error fetching accountant:', error);
    res.status(500).json({ success: false, message: 'Error fetching accountant' });
  }
});

// GET school owner specifically
router.get('/owner', async (req, res) => {
  try {
    const [owners] = await pool.execute(
      'SELECT * FROM leadership WHERE role = "owner" OR position = "owner" OR first_name = "Rugambage" ORDER BY id ASC'
    );
    
    const owner = {
      id: owners.length > 0 ? owners[0].id : null,
      first_name: 'Rugambage',
      last_name: 'Andre',
      position: 'School Owner',
      role: 'owner',
      description: 'Visionary leader and founder of Garden TVET School',
      image_url: '/uploads/leadership/school owner.png',
      services: [
        'Strategic Leadership & Vision',
        'Educational Excellence Oversight',
        'Community Development',
        'Innovation & Growth Planning',
        'Stakeholder Relations',
        'Quality Assurance'
      ],
      specializations: [
        'Educational Leadership',
        'Strategic Management',
        'Community Development',
        'Educational Innovation'
      ],
      achievements: [
        'Founded Garden TVET School',
        'Educational Innovation Leader',
        'Community Development Champion'
      ]
    };
    
    res.json({ success: true, owner });
  } catch (error) {
    console.error('Error fetching owner:', error);
    res.status(500).json({ success: false, message: 'Error fetching owner' });
  }
});
router.get('/:id', async (req, res) => {
  try {
    const [leaders] = await pool.execute('SELECT * FROM leadership WHERE id = ?', [req.params.id]);
    if (leaders.length === 0) {
      return res.status(404).json({ success: false, message: 'Leader not found' });
    }
    
    const leader = leaders[0];
    // Add additional details for advisor
    if (leader.position === 'advisor') {
      leader.services = [
        'Academic Guidance',
        'Career Counseling', 
        'Personal Development',
        'Study Planning',
        'Goal Setting'
      ];
      leader.availability = {
        monday: '8:00 AM - 5:00 PM',
        tuesday: '8:00 AM - 5:00 PM',
        wednesday: '8:00 AM - 5:00 PM',
        thursday: '8:00 AM - 5:00 PM',
        friday: '8:00 AM - 4:00 PM'
      };
    }
    
    res.json({ success: true, leader });
  } catch (error) {
    console.error('Error fetching leader:', error);
    res.status(500).json({ success: false, message: 'Error fetching leader' });
  }
});

// POST new leader
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const {
      first_name, last_name, position, department, bio, email, phone,
      office_location, qualifications, experience_years,
      specialization, achievements, responsibilities
    } = req.body;

    const image_url = req.file ? `/uploads/leadership/${req.file.filename}` : null;

    const [result] = await pool.execute(
      `INSERT INTO leadership (first_name, last_name, position, department, bio, email, phone, 
       office_location, image_url, qualifications, experience_years, specialization, 
       achievements, responsibilities, is_active, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, true, NOW())`,
      [first_name, last_name, position, department, bio, email, phone, office_location, image_url,
       qualifications, experience_years, specialization, achievements, responsibilities]
    );

    res.json({ success: true, id: result.insertId, message: 'Leader added successfully' });
  } catch (error) {
    console.error('Error adding leader:', error);
    res.status(500).json({ success: false, message: 'Error adding leader' });
  }
});

// PUT update leader
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const {
      first_name, last_name, position, department, bio, email, phone,
      office_location, qualifications, experience_years,
      specialization, achievements, responsibilities
    } = req.body;

    let updateQuery = `UPDATE leadership SET first_name=?, last_name=?, position=?, department=?, bio=?, 
                       email=?, phone=?, office_location=?, qualifications=?, experience_years=?, 
                       specialization=?, achievements=?, responsibilities=?, updated_at=NOW()`;
    let params = [first_name, last_name, position, department, bio, email, phone, office_location,
                  qualifications, experience_years, specialization, achievements, responsibilities];

    if (req.file) {
      updateQuery += ', image_url=?';
      params.push(`/uploads/leadership/${req.file.filename}`);
    }

    updateQuery += ' WHERE id=?';
    params.push(req.params.id);

    await pool.execute(updateQuery, params);
    res.json({ success: true, message: 'Leader updated successfully' });
  } catch (error) {
    console.error('Error updating leader:', error);
    res.status(500).json({ success: false, message: 'Error updating leader' });
  }
});

// DELETE leader (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    await pool.execute('UPDATE leadership SET is_active = false WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Leader removed successfully' });
  } catch (error) {
    console.error('Error removing leader:', error);
    res.status(500).json({ success: false, message: 'Error removing leader' });
  }
});

module.exports = router;
