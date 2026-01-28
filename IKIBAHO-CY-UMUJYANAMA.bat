@echo off
echo 🎓 IKIBAHO CY'UMUJYANAMA - GUSHYIRAHO BYUZUYE
echo ============================================
echo.

echo 1. Gushyiraho amakuru y'umujyanama...
cd backend
node setup-advisor-simple.js

echo.
echo 2. Kugenzura API...
echo Kugenzura ikibaho cy'umujyanama...
curl -s http://localhost:5000/api/advisor-dashboard/dashboard/kinyarwanda 2>nul | findstr "umutwe" >nul && echo "✅ Ikibaho cy'Umujyanama Kiratangiye" || echo "⚠️ Ikibaho Kikeneye Gusubiramo Seriveri"

echo.
echo 3. Kugenzura ikarita y'umujyanama...
curl -s http://localhost:5000/api/staff-roles/roles/cards 2>nul | findstr "advisor" >nul && echo "✅ Ikarita y'Umujyanama Irahari" || echo "⚠️ Ikarita Ikeneye Gushyirwaho"

echo.
echo 🎉 IKIBAHO CY'UMUJYANAMA CYARANGIYE!
echo =====================================
echo.
echo 📊 Ibisobanuro by'Ikibaho:
echo.
echo AMABARA:
echo    - Ibanze: Icyatsi kugeza ku Muhondo (Green to Yellow Gradient)
echo    - Amabara: linear-gradient(135deg, #10b981 0%, #fbbf24 100%%)
echo.
echo URURIMI:
echo    - Byose mu Kinyarwanda
echo    - Ibisobanuro byuzuye
echo    - Amakuru yose y'ishuri
echo.
echo IBIKORWA:
echo    ✓ Kureba abanyeshuri bose bo mu myuga yose
echo    ✓ Isesengura mu gihe nyacyo
echo    ✓ Gucunga ubutumwa bw'ababyeyi
echo    ✓ Gukurikirana iterambere ry'abanyeshuri
echo    ✓ Kora raporo zuzuye
echo    ✓ Isesengura ry'ingaruka
echo    ✓ Guhuza ababyeyi n'abarimu
echo    ✓ Amakuru y'iterambere ry'ishuri
echo    ✓ Imicungire yose y'ishuri
echo    ✓ Ibikorwa byihuse
echo.
echo 📡 API Endpoints:
echo    GET /api/advisor-dashboard/dashboard/kinyarwanda
echo        - Ikibaho cyuzuye cy'umujyanama mu Kinyarwanda
echo        - Imibare yose y'ishuri
echo        - Isesengura ryuzuye
echo        - Ibikorwa byihuse
echo.
echo    GET /api/staff-roles/roles/cards
echo        - Ikarita y'umujyanama hamwe n'abandi
echo        - Amabara: Icyatsi kugeza ku Muhondo
echo        - Ibisobanuro mu Kinyarwanda
echo.
echo    GET /api/advisor-comprehensive/students/comprehensive
echo        - Abanyeshuri bose bo mu myuga yose
echo        - Ibisobanuro byuzuye by'abanyeshuri
echo.
echo    GET /api/advisor-staff/staff/dashboard
echo        - Ikibaho cy'imicungire
echo        - Isesengura ryuzuye
echo.
echo 🔐 Amakuru yo Kwinjira:
echo    Username: advisor_emerance
echo    Email: emerancemukamugema77@gmail.com
echo    Uruhare: Umujyanama w'Ishuri
echo.
echo 🎨 Amabara Yakoreshejwe:
echo    - Icyatsi (#10b981) kugeza ku Muhondo (#fbbf24)
echo    - Gradient: 135deg
echo    - Nk'uko byakoreshejwe mu bindi bihugu
echo.
echo ✅ Byose Byarangiye! Ikibaho Kiratangiye!
echo.

pause