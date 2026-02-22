@echo off
echo ========================================
echo ADD 24 LEVEL 3 SOD STUDENTS
echo ========================================
echo.

echo Running migration to add Level 3 SOD students...
mysql -u root -p school_management < backend\migrations\add_level3_sod_students.sql

echo.
echo ========================================
echo MIGRATION COMPLETE!
echo ========================================
echo.
echo 24 Level 3 SOD students have been added to global_student_sheets
echo.
echo Students added:
echo - Akimana Ange Benita
echo - BAHATI Noella
echo - CYOMORO ARIHO RICKEY
echo - CYUZUZO Aime Prince
echo - DUSHIME MUTIMUTUJE Napoleon
echo - GATSINZI Frank
echo - IMANIZABAYO Alpha
echo - ISHIMWE AIME ENOCK
echo - MANIRAREBA Stiven
echo - MFASHWANABO Hybert
echo - MUGISHA Elissa
echo - MUGISHA Dieu Merci
echo - MUGISHA Prince
echo - MUNEZERO DARIUS
echo - Mutsindashyaka Alexis
echo - NIYONSHUTI Costase
echo - NSHIMIYIMANA Raphael
echo - RUGAMBAGE Yannick Seviye
echo - RUTAYISIRE EMILE
echo - SHEMA Alexandre
echo - TUYISINGIZE Pacifique
echo - UWAMAHORO JEANNETTE
echo - UWARUGIRA DANNY
echo - UWIMANA CHANTAL
echo.
echo Now restart your backend server:
echo   cd backend
echo   npm start
echo.
pause
