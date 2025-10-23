/* 
    Unfortunately in current drizzle-kit version we can't automatically get name for primary key.
    We are working on making it available!

    Meanwhile you can:
        1. Check pk name in your database, by running
            SELECT constraint_name FROM information_schema.table_constraints
            WHERE table_schema = 'public'
                AND table_name = 'evolution'
                AND constraint_type = 'PRIMARY KEY';
        2. Uncomment code below and paste pk name manually
        
    Hope to release this update as soon as possible
*/

ALTER TABLE "evolution" DROP CONSTRAINT "evolution_pkey";--> statement-breakpoint
ALTER TABLE "evolution" ADD CONSTRAINT "evolution_id_evolves_to_id_pokemon_id_pk" PRIMARY KEY("id","evolves_to_id","pokemon_id");