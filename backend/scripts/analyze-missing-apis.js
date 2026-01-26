const fs = require('fs');
const path = require('path');
const { pool } = require('../config/database');

async function analyzeMissingAPIs() {
  try {
    // Get all tables
    const [tables] = await pool.query('SHOW TABLES');
    const allTables = tables.map(t => Object.values(t)[0]);
    
    // Get all existing route files
    const routesDir = path.join(__dirname, '../routes');
    const routeFiles = fs.readdirSync(routesDir).filter(f => f.endsWith('.js'));
    
    // Map common patterns
    const tableToRoutePatterns = {
      // Common patterns for mapping table names to route files
      'academic_calendar': ['academic', 'calendar'],
      'admission_applications': ['admission', 'admissions'],
      'alumni': ['alumni'],
      'cafeteria_menu': ['cafeteria'],
      'certificates': ['certificate'],
      'counseling_sessions': ['counseling'],
      'hostel_rooms': ['hostel'],
      'library_books': ['library'],
      'workshops': ['workshop', 'events']
    };
    
    console.log('\n=== MISSING API ANALYSIS ===\n');
    console.log(`Total Tables: ${allTables.length}`);
    console.log(`Total Route Files: ${routeFiles.length}\n`);
    
    // Tables that likely need APIs
    const criticalTables = allTables.filter(table => {
      // Skip system/internal tables
      if (table.includes('_log') || table.includes('_cache') || table.includes('refresh_tokens')) {
        return false;
      }
      
      // Check if likely has a route file
      const hasRoute = routeFiles.some(route => {
        const routeName = route.replace('.js', '').toLowerCase();
        const tableName = table.toLowerCase();
        
        return routeName.includes(tableName) || 
               tableName.includes(routeName) ||
               tableName.replace('_', '-') === routeName ||
               tableName.replace('_', '') === routeName.replace('-', '');
      });
      
      return !hasRoute;
    });
    
    console.log('PRIORITY TABLES NEEDING APIs:\n');
    
    const categories = {
      academic: [],
      admission: [],
      alumni: [],
      cafeteria: [],
      certificates: [],
      counseling: [],
      hostel: [],
      library: [],
      medical: [],
      workshop: [],
      other: []
    };
    
    criticalTables.forEach(table => {
      if (table.includes('academic')) categories.academic.push(table);
      else if (table.includes('admission')) categories.admission.push(table);
      else if (table.includes('alumni')) categories.alumni.push(table);
      else if (table.includes('cafeteria')) categories.cafeteria.push(table);
      else if (table.includes('certificate')) categories.certificates.push(table);
      else if (table.includes('counseling')) categories.counseling.push(table);
      else if (table.includes('hostel')) categories.hostel.push(table);
      else if (table.includes('library')) categories.library.push(table);
      else if (table.includes('medical')) categories.medical.push(table);
      else if (table.includes('workshop')) categories.workshop.push(table);
      else categories.other.push(table);
    });
    
    Object.entries(categories).forEach(([category, tables]) => {
      if (tables.length > 0) {
        console.log(`\n${category.toUpperCase()}:`);
        tables.forEach(t => console.log(`  - ${t}`));
      }
    });
    
    console.log(`\n\nTOTAL MISSING: ${criticalTables.length} tables need API endpoints\n`);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

analyzeMissingAPIs();
