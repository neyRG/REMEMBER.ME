import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AnimatePresence, MotionConfig } from 'framer-motion';

import Layout from './components/Layout';
import Home from './pages/Home';
import Escritorio from './pages/Escritorio';
import Recuerdos from './pages/Recuerdos';
import Perfil from './pages/Perfil';

import './styles/variables.css';
import './styles/global.css';

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <BrowserRouter>
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route element={<Layout />}>
              <Route path="/escritorio" element={<Escritorio />} />
              <Route path="/recuerdos" element={<Recuerdos />} />
              <Route path="/perfil" element={<Perfil />} />
            </Route>
          </Routes>
        </AnimatePresence>
      </BrowserRouter>
    </MotionConfig>
  );
}
