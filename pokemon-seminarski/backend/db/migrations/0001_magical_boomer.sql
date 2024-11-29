-- Custom SQL migration file, put you code below!
-- https://stackoverflow.com/questions/18807709/
CREATE OR REPLACE FUNCTION lowercase_email_trigger() 
RETURNS trigger AS $lowercase_email$
    BEGIN
        NEW.email := LOWER(NEW.email);
        RETURN NEW;
    END;
$lowercase_email$ LANGUAGE plpgsql;

CREATE TRIGGER lowercase_email_before_insert
BEFORE INSERT OR UPDATE ON users
FOR EACH ROW
    EXECUTE FUNCTION lowercase_email_trigger();