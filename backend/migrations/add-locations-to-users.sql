-- Add Rwanda location fields to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS province_id INT,
ADD COLUMN IF NOT EXISTS district_id INT,
ADD COLUMN IF NOT EXISTS sector_id INT,
ADD COLUMN IF NOT EXISTS cell_id INT,
ADD COLUMN IF NOT EXISTS village_id INT,
ADD FOREIGN KEY IF NOT EXISTS (province_id) REFERENCES provinces(id),
ADD FOREIGN KEY IF NOT EXISTS (district_id) REFERENCES districts(id),
ADD FOREIGN KEY IF NOT EXISTS (sector_id) REFERENCES sectors(id),
ADD FOREIGN KEY IF NOT EXISTS (cell_id) REFERENCES cells(id),
ADD FOREIGN KEY IF NOT EXISTS (village_id) REFERENCES villages(id);
