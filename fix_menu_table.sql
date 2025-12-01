-- Fix for menu_items table: Add missing is_deleted column
-- This column is required by the Python model but missing from the database schema
-- Add is_deleted column to menu_items table
ALTER TABLE menu_items
ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE
AFTER is_available;
-- Update existing records to ensure they are not marked as deleted
UPDATE menu_items
SET is_deleted = FALSE
WHERE is_deleted IS NULL;
-- Verify the change
SELECT 'Column added successfully' AS status;