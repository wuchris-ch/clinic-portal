-- Remove legacy pay periods for previous T4 years
DELETE FROM pay_periods WHERE t4_year <= 2025;

