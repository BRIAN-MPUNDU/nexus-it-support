INSERT INTO records (title, category, description, status)
SELECT *
FROM (VALUES
    ('Computer not starting', 'Hardware', 'Office computer fails to start.', 'Pending'),
    ('Internet connection issue', 'Network', 'Internet connection is unavailable.', 'In progress'),
    ('Printer not working', 'Hardware', 'The office printer is not printing.', 'Pending'),
    ('Password reset request', 'Account', 'User requires a password reset.', 'Completed'),
    ('Software installation', 'Software', 'Install required office software.', 'Pending'),
    ('Email access problem', 'Account', 'User cannot access the email account.', 'In progress'),
    ('Keyboard replacement', 'Hardware', 'Replace the damaged computer keyboard.', 'Completed'),
    ('Network configuration', 'Network', 'Configure network settings for a new computer.', 'Pending')
) AS sample(title, category, description, status)
WHERE NOT EXISTS (
    SELECT 1 FROM records
);  