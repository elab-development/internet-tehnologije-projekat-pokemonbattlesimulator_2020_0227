# Domaći broj 1

## Opis
Ovaj domaći zadatak ima za cilj kreiranje REST API ruta pomoću Laravel razvojnog okruženja. Projekat se fokusira na izradu simulacije borbe između pokemona, a ova aplikacija pruža osnovne rute za dobijanje podataka o pokemonima iz baze.

## Struktura projekta
Projekat je organizovan u skladu s Laravel konvencijama i sadrži odgovarajuću strukturu foldera. Ovde su naglašaene ključne tačke koje treba uzeti u obzir prilikom razmatranja koda:

+ `app/Http/Controllers`
+ `app/Http/Requests`
+ `app/Http/Resources`
+ `app/Http/Polices`
+ `app/Models`
+ `routes/api.php`
+ `database/factories`
+ `database/migrations`
+ `database/seeders`

## Instalacija
```bash
# Kloniranje projekta
git clone https://github.com/elab-development/internet-tehnologije-projekat-pokemonbattlesimulator_2020_0227
cd internet-tehnologije-projekat-pokemonbattlesimulator_2020_0227\pokemon-laravel

# Instalacija zavisnost i migracija tabela
composer install
php artisan migrate --seed

# Pokretanje servera
php artisan serve
```

## API Rute
Sve rute imaju prefix `/api/v1`

|  Metoda   | Ruta                              | Opis                                                      |
|:----------|:----------------------------------|:----------------------------------------------------------|
| POST      | `/register`                       | Registruje korisnika                                      |
| POST      | `/login`                          | Prijavljuje korisnika i vraća token                       |
| POST      | `/logout`                         | Odjavljuje korisnika i briše token                        |
| GET       | `/moves`                          | Lista pokreta pokemona, moguće filtriranje                |
| GET       | `/moves/{move}`                   | Specifični pokret po id-u                                 |
| POST      | `/moves`                          | Čuva pokret u bazu                                        |
| PUT/PATCH | `/moves/{move}`                   | Menja podatke o pokretima                                 |
| DELETE    | `/moves/{move}`                   | Briše podatke o pokretima                                 |
| GET       | `/pokemons`                       | Lista pokemona, moguće filtriranje i populate za pokrete  |
| GET       | `/pokemons/{pokemon}`             | Specifični pokemon po id-u i populate za pokrete          |
| POST      | `/pokemons`                       | Čuva pokemona u bazu                                      |
| PUT/PATCH | `/pokemons/{pokemon}`             | Menja podatke o pokemonu                                  |
| DELETE    | `/pokemons/{pokemon}`             | Briše podatke o pokemonu                                  |
| POST      | `/pokemons/bulk`                  | Čuva više pokemona u bazu                                 |
| POST      | `/pokemons/{pokemon}/add-moves`   | Čuva pokrete vezane za pokemon                            |
| GET       | `/users`                          | Lista korsnika, moguće filtriranje i populate za pokemone |
| GET       | `/users/{user}`                   | Specifični korisnik po id-u  i populate za pokemone       |
| PUT/PATCH | `/users/{user}`                   | Menja podatke o korisniku                                 |
| DELETE    | `/users/{user}`                   | Briše podatke o korisniku                                 |
| POST      | `/users/{user}/add-pokemons`      | Čuva pokemone vezane za korisnika                         |
| POST      | `/users/{user}/get-random-pokemon`| Čuva random pokemon vezan za korisnika                    |
