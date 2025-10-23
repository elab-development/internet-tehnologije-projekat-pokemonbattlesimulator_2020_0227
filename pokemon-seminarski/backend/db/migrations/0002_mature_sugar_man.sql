ALTER TABLE "evolution" DROP CONSTRAINT "evolution_pokemon_id_pokemons_id_fk";
--> statement-breakpoint
ALTER TABLE "evolution" DROP CONSTRAINT "evolution_evolves_to_id_pokemons_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pokemon_type" ADD CONSTRAINT "pokemon_type_pokemon_id_pokemons_id_fk" FOREIGN KEY ("pokemon_id") REFERENCES "public"."pokemons"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pokemon_type" ADD CONSTRAINT "pokemon_type_type_id_types_id_fk" FOREIGN KEY ("type_id") REFERENCES "public"."types"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pokemons_moves" ADD CONSTRAINT "pokemons_moves_move_id_moves_id_fk" FOREIGN KEY ("move_id") REFERENCES "public"."moves"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pokemons_moves" ADD CONSTRAINT "pokemons_moves_pokemon_id_pokemons_id_fk" FOREIGN KEY ("pokemon_id") REFERENCES "public"."pokemons"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "evolution" ADD CONSTRAINT "evolution_pokemon_id_pokemons_id_fk" FOREIGN KEY ("pokemon_id") REFERENCES "public"."pokemons"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "evolution" ADD CONSTRAINT "evolution_evolves_to_id_pokemons_id_fk" FOREIGN KEY ("evolves_to_id") REFERENCES "public"."pokemons"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "type_effectiveness" ADD CONSTRAINT "type_effectiveness_attacker_type_id_types_id_fk" FOREIGN KEY ("attacker_type_id") REFERENCES "public"."types"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "type_effectiveness" ADD CONSTRAINT "type_effectiveness_defender_type_id_types_id_fk" FOREIGN KEY ("defender_type_id") REFERENCES "public"."types"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
