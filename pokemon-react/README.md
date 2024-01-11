# Domaći broj 2

## Opis
Ovaj domaći zadatak ima za cilj kreiranje front end dela aplikaciju pomoću React.js biblioteke zajedno sa babelom i drugima koji čine `create-react-app`.
Domaći se fokusira na izradu pokédex-a kako bi korisnicima omogučili da se lakše spreme za turnire. Podaci su preuzeti iz javnog api-ja `https://pokeapi.co/v2/api/`;

## Struktura projekta
Projekat je organizovan u skladu sa svim react paternima i konvencijama i sadržu odgovarajuću strukturu foldera. Ovde su istaknuti ključni fajlovi, kao i slike koje sam samostalno kreirao. Trebalo bi ih uzeti u obzir prilikom pregledanja koda:

+ `src/App.js`
+ `src/components/Home.jsx`
+ `src/components/PokemonCard.jsx`
+ `src/components/PokemonDisplay.jsx`
+ `src/components/util/useDebounce.jsx` --custom hook
+ `src/components/util/constants.jsx` --konstante u programu (za paginaciju, api i fetchAmount)
+ `src/images/components/index.jsx` --custom svg

## Instalacija 
Potrebno je da se instalira `node.js` radno okruženje pre kloniranja repozitorijuma.

``` bash
# Kloniranje repozitorijuma
git clone https://github.com/elab-development/internet-tehnologije-projekat-pokemonbattlesimulator_2020_0227
cd internet-tehnologije-projekat-pokemonbattlesimulator_2020_0227\pokemon-reaect

# Instalacija paketa
npm install

# Pokretanje servera
npm run start
```

## Front rute

| Rute                              | Opis                                                      |
|:----------------------------------|:----------------------------------------------------------|
| `/`                               | Početna ili home strana                                   |
| `/pokemons`                       | Prikazuje listu pokemona                                  |
| `/pokemons/:id`                   | Prikazuje određeni pokemon                                |
