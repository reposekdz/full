const mysql = require('mysql2/promise');

async function updateLeaderCredentials() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'school_management'
  });

  try {
    // Update Matron
    await conn.execute(
      `UPDATE leadership SET 
        name = ?,
        email = ?,
        phone = ?,
        biography_rw = ?,
        biography_en = ?
      WHERE role = ?`,
      ['Ishimwe Esther', 'eishimwe674@gmail.com', '0787342430', 
       'Matron w\'abanyeshuri b\'abakobwa akaba ashinzwe imibereho myiza y\'abanyeshuri',
       'Girls matron ensuring positive welfare and wellbeing of female students', 'Matron']
    );
    console.log('✓ Updated Matron - Ishimwe Esther');

    // Update Advisor
    await conn.execute(
      `UPDATE leadership SET 
        phone = ?,
        biography_rw = ?,
        biography_en = ?
      WHERE role = ?`,
      ['0788815924', 
       'Umujyanama w\'ishuri akaba afasha mu mibanire myiza hagati y\'ababyeyi, abanyeshuri n\'umuryango',
       'Fostering positive relationship with parent, student and community', 'Advisor']
    );
    console.log('✓ Updated Advisor - Phone: 0788815924');

    // Update Accountant
    await conn.execute(
      `UPDATE leadership SET 
        phone = ?,
        biography_rw = ?,
        biography_en = ?
      WHERE role = ?`,
      ['0788622709',
       'Umubitsi w\'ishuri akaba atanga serivisi z\'ibaruramari n\'izindi serivisi zijyanye n\'imari',
       'Accountant services and other related services', 'Accountant']
    );
    console.log('✓ Updated Accountant - Phone: 0788622709');

    console.log('\n✓ All leader credentials updated successfully!');
  } catch (error) {
    console.error('Error updating credentials:', error);
  } finally {
    await conn.end();
  }
}

updateLeaderCredentials();
