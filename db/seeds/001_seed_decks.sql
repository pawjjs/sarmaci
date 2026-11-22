INSERT INTO decks (code, name, description)
VALUES (
    'basic',
    'Podstawowa',
    'Podstawowa talia dostępna w grze.'
)
ON CONFLICT(code) DO NOTHING;
