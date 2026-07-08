-- Tworzy dodatkową bazę danych dla Payload CMS na tym samym serwerze PostgreSQL
-- Użytkownik 'garden' musi mieć uprawnienia do tworzenia baz

SELECT 'CREATE DATABASE garden_payload'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'garden_payload')\gexec

GRANT ALL PRIVILEGES ON DATABASE garden_payload TO garden;
