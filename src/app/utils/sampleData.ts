export const generateSampleStudents = (count: number = 50) => {
  const names = ['John Doe', 'Jane Smith', 'Alice Johnson', 'Bob Williams', 'Charlie Brown', 'Diana Prince', 'Eve Adams', 'Frank Miller', 'Grace Lee', 'Henry Wilson'];
  const grades = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6'];
  const classes = ['A', 'B', 'C'];
  const genders = ['Male', 'Female'];
  const behaviors = ['excellent', 'good', 'poor'];
  const statuses = ['active', 'suspended', 'graduated'];
  const subjects = [
    ['Math', 'Physics', 'Chemistry'],
    ['Biology', 'English', 'History'],
    ['Geography', 'French', 'Kinyarwanda'],
    ['Computer Science', 'Economics', 'Literature']
  ];

  return Array.from({ length: count }, (_, i) => ({
    id: `STU${String(i + 1).padStart(4, '0')}`,
    name: names[Math.floor(Math.random() * names.length)] + ` ${i + 1}`,
    grade: grades[Math.floor(Math.random() * grades.length)],
    class: classes[Math.floor(Math.random() * classes.length)],
    age: Math.floor(Math.random() * 6) + 13,
    gender: genders[Math.floor(Math.random() * genders.length)],
    guardianName: `Guardian ${i + 1}`,
    guardianPhone: `+250${Math.floor(Math.random() * 900000000) + 100000000}`,
    fees: Math.floor(Math.random() * 500000) + 300000,
    feesPaid: Math.floor(Math.random() * 400000) + 100000,
    feesBalance: 0,
    attendance: Math.floor(Math.random() * 30) + 70,
    behavior: behaviors[Math.floor(Math.random() * behaviors.length)],
    academicPerformance: Math.floor(Math.random() * 40) + 60,
    subjects: subjects[Math.floor(Math.random() * subjects.length)],
    enrollmentDate: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
    status: statuses[Math.floor(Math.random() * statuses.length)] as 'active' | 'suspended' | 'graduated'
  })).map(student => ({
    ...student,
    feesBalance: student.fees - student.feesPaid
  }));
};
