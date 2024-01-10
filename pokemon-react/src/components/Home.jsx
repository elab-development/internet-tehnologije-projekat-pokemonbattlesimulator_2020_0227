import React from 'react'
import './css/Home.css';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <>
      <h1> Pokémon React Aplikacija</h1><hr />
      <p>
        Dobrodošli u Pokemon Pokedex React aplikaciju! Ova aplikacija vam omogućava istraživanje fascinantnog sveta Pokemona, pružajući detaljne informacije o svakom od njih. Bez obzira da li ste Pokemon trener ili jednostavno ljubitelj Pokemona, ova aplikacija vam omogućava da istražite raznolikost vrsta, njihove karakteristike i sposobnosti.
      </p>

      <h2> Funkcionalnosti</h2>
      <ul className='home-lista funkcionalnosti'>
        <li><b>Pretraživanje po Imenu ili Broju u Pokedexu:</b> Lako pronađite željenog Pokemona pomoću praktične pretrage.</li>
        <li><b>Detaljni Prikaz Podataka:</b> Saznajte sve o visini, težini, vrsti, napadima i mnogim drugim karakteristikama za svakog Pokemona.</li>
      </ul>

      <h2>Kako Pokrenuti</h2>
      <ul className='home-lista kako-pokrenuti'>
        <li>Klonirajte repozitorijum na svoj lokalni uređaj sa <a href='https://github.com/elab-development/internet-tehnologije-projekat-pokemonbattlesimulator_2020_0227'>linka</a>.</li>
        <li>Pokrenite <code>npm install</code> radi instalacije potrebnih paketa.</li>
        <li>Zatim izvršite <code>npm start</code> kako biste pokrenuli aplikaciju lokalno.</li>
        <li>Zatim izvršite <code>npm start</code> kako biste pokrenuli aplikaciju lokalno.</li>
      </ul>
      <p>
        Nadam se da će vam ova aplikacija pružiti uzbudljivo iskustvo istraživanja Pokemona. Slobodno doprinesite i poboljšajte aplikaciju, ili prijavite greške ako ih pronađete. Hvala vam što koristite Pokemon Pokedex React aplikaciju!
      </p>
      <div className='div-wrapper'>
        <Link to='/pokemons' className='home-dugme'>Pretražite pokemone</Link>
      </div>
    </>
  )
}

export default Home