ALTER TABLE "users_pokemons" DROP CONSTRAINT "users_pokemons_pokemon_id_pokemons_id_fk";
--> statement-breakpoint
ALTER TABLE "users_pokemons" DROP CONSTRAINT "users_pokemons_user_id_users_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users_pokemons" ADD CONSTRAINT "users_pokemons_pokemon_id_pokemons_id_fk" FOREIGN KEY ("pokemon_id") REFERENCES "public"."pokemons"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users_pokemons" ADD CONSTRAINT "users_pokemons_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
