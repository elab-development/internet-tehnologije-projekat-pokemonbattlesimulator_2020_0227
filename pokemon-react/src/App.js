import './App.css';
import { Routes, Route, BrowserRouter } from 'react-router-dom'
import Header from './components/Header';
import Home from './components/Home';
import Pokedex from './components/Pokedex';
import Footer from './components/Footer';
import PokemonDisplay from './components/PokemonDisplay';

function App() {
  return (
    <BrowserRouter>
      <Header />
      <div className="content">
        <Routes>
          <Route path='/' exact element={<Home />} />
          <Route path='/pokemons' element={<Pokedex />} />
          <Route path='/pokemons/:id' element={<PokemonDisplay />} />          
        </Routes>
      </div>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
