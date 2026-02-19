-- Delete existing football players first
DELETE FROM sports_players WHERE team_id = (SELECT id FROM sports_teams WHERE name LIKE '%Football%' OR name LIKE '%Umupira%' LIMIT 1);

-- Add Garden TVET Football Players with images
INSERT INTO sports_players (team_id, name, position, jersey_number, is_captain, image_url, is_active) 
SELECT id, 'Beningabo Emmanuel', 'Forward', 10, 1, '/uploads/sports/garden foot ball plyers/beningabo emannuel.jpg', 1 FROM sports_teams WHERE name LIKE '%Football%' OR name LIKE '%Umupira%' LIMIT 1;

INSERT INTO sports_players (team_id, name, position, jersey_number, is_captain, image_url, is_active) 
SELECT id, 'Cyangwege John', 'Midfielder', 8, 0, '/uploads/sports/garden foot ball plyers/cyangwege john.jpg', 1 FROM sports_teams WHERE name LIKE '%Football%' OR name LIKE '%Umupira%' LIMIT 1;

INSERT INTO sports_players (team_id, name, position, jersey_number, is_captain, image_url, is_active) 
SELECT id, 'Dukuze JMV', 'Defender', 5, 0, '/uploads/sports/garden foot ball plyers/dukuze jmv.jpg', 1 FROM sports_teams WHERE name LIKE '%Football%' OR name LIKE '%Umupira%' LIMIT 1;

INSERT INTO sports_players (team_id, name, position, jersey_number, is_captain, image_url, is_active) 
SELECT id, 'Habineza Felix', 'Goalkeeper', 1, 0, '/uploads/sports/garden foot ball plyers/habineza felix.jpg', 1 FROM sports_teams WHERE name LIKE '%Football%' OR name LIKE '%Umupira%' LIMIT 1;

INSERT INTO sports_players (team_id, name, position, jersey_number, is_captain, image_url, is_active) 
SELECT id, 'Iradukunda Sammuel', 'Forward', 11, 0, '/uploads/sports/garden foot ball plyers/iradukunda sammuel.jpg', 1 FROM sports_teams WHERE name LIKE '%Football%' OR name LIKE '%Umupira%' LIMIT 1;

INSERT INTO sports_players (team_id, name, position, jersey_number, is_captain, image_url, is_active) 
SELECT id, 'Irafasha Augiste', 'Midfielder', 6, 0, '/uploads/sports/garden foot ball plyers/irafasha augiste.jpg', 1 FROM sports_teams WHERE name LIKE '%Football%' OR name LIKE '%Umupira%' LIMIT 1;

INSERT INTO sports_players (team_id, name, position, jersey_number, is_captain, image_url, is_active) 
SELECT id, 'Manzi Fabrice', 'Defender', 4, 0, '/uploads/sports/garden foot ball plyers/manzi fabrice.jpg', 1 FROM sports_teams WHERE name LIKE '%Football%' OR name LIKE '%Umupira%' LIMIT 1;

INSERT INTO sports_players (team_id, name, position, jersey_number, is_captain, image_url, is_active) 
SELECT id, 'Mpfite Umukiza Lavie', 'Midfielder', 7, 0, '/uploads/sports/garden foot ball plyers/mpfite umukiza lavie.jpg', 1 FROM sports_teams WHERE name LIKE '%Football%' OR name LIKE '%Umupira%' LIMIT 1;

INSERT INTO sports_players (team_id, name, position, jersey_number, is_captain, image_url, is_active) 
SELECT id, 'Mugisha Dieudonne', 'Forward', 9, 0, '/uploads/sports/garden foot ball plyers/mugisha dieudonne.jpg', 1 FROM sports_teams WHERE name LIKE '%Football%' OR name LIKE '%Umupira%' LIMIT 1;

INSERT INTO sports_players (team_id, name, position, jersey_number, is_captain, image_url, is_active) 
SELECT id, 'Mugisha Elisa', 'Defender', 3, 0, '/uploads/sports/garden foot ball plyers/mugisha elisa.jpg', 1 FROM sports_teams WHERE name LIKE '%Football%' OR name LIKE '%Umupira%' LIMIT 1;

INSERT INTO sports_players (team_id, name, position, jersey_number, is_captain, image_url, is_active) 
SELECT id, 'Mugisha Joseph', 'Midfielder', 14, 0, '/uploads/sports/garden foot ball plyers/mugisha joseph.jpg', 1 FROM sports_teams WHERE name LIKE '%Football%' OR name LIKE '%Umupira%' LIMIT 1;

INSERT INTO sports_players (team_id, name, position, jersey_number, is_captain, image_url, is_active) 
SELECT id, 'Ndayizeye Eric', 'Forward', 17, 0, '/uploads/sports/garden foot ball plyers/ndayizeye eric.jpg', 1 FROM sports_teams WHERE name LIKE '%Football%' OR name LIKE '%Umupira%' LIMIT 1;

INSERT INTO sports_players (team_id, name, position, jersey_number, is_captain, image_url, is_active) 
SELECT id, 'Ndayizeye Patric', 'Defender', 2, 0, '/uploads/sports/garden foot ball plyers/ndayizeye patric.jpg', 1 FROM sports_teams WHERE name LIKE '%Football%' OR name LIKE '%Umupira%' LIMIT 1;

INSERT INTO sports_players (team_id, name, position, jersey_number, is_captain, image_url, is_active) 
SELECT id, 'Ndori Vedaste', 'Midfielder', 15, 0, '/uploads/sports/garden foot ball plyers/ndori vedaste.jpg', 1 FROM sports_teams WHERE name LIKE '%Football%' OR name LIKE '%Umupira%' LIMIT 1;

INSERT INTO sports_players (team_id, name, position, jersey_number, is_captain, image_url, is_active) 
SELECT id, 'Nineza Nick Nelly', 'Forward', 19, 0, '/uploads/sports/garden foot ball plyers/nineza nick nelly.jpg', 1 FROM sports_teams WHERE name LIKE '%Football%' OR name LIKE '%Umupira%' LIMIT 1;

INSERT INTO sports_players (team_id, name, position, jersey_number, is_captain, image_url, is_active) 
SELECT id, 'Nsengiyumva Flank', 'Defender', 12, 0, '/uploads/sports/garden foot ball plyers/nsengiyumva flank.jpg', 1 FROM sports_teams WHERE name LIKE '%Football%' OR name LIKE '%Umupira%' LIMIT 1;

INSERT INTO sports_players (team_id, name, position, jersey_number, is_captain, image_url, is_active) 
SELECT id, 'Nzamurambaho Jirbert', 'Midfielder', 13, 0, '/uploads/sports/garden foot ball plyers/nzamurambaho jirbert.jpg', 1 FROM sports_teams WHERE name LIKE '%Football%' OR name LIKE '%Umupira%' LIMIT 1;

INSERT INTO sports_players (team_id, name, position, jersey_number, is_captain, image_url, is_active) 
SELECT id, 'Olivier', 'Forward', 20, 0, '/uploads/sports/garden foot ball plyers/olivier.jpg', 1 FROM sports_teams WHERE name LIKE '%Football%' OR name LIKE '%Umupira%' LIMIT 1;

INSERT INTO sports_players (team_id, name, position, jersey_number, is_captain, image_url, is_active) 
SELECT id, 'Umukundwa Anfge Lohike', 'Defender', 16, 0, '/uploads/sports/garden foot ball plyers/umukundwa anfge lohike.jpg', 1 FROM sports_teams WHERE name LIKE '%Football%' OR name LIKE '%Umupira%' LIMIT 1;

INSERT INTO sports_players (team_id, name, position, jersey_number, is_captain, image_url, is_active) 
SELECT id, 'Uwayisenga Patrick', 'Midfielder', 18, 0, '/uploads/sports/garden foot ball plyers/uwayisenga patrick.jpg', 1 FROM sports_teams WHERE name LIKE '%Football%' OR name LIKE '%Umupira%' LIMIT 1;
