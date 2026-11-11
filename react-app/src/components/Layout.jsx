import { useState, useEffect } from 'react';
import { Outlet, NavLink, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Archive, User } from 'lucide-react';
import './Layout.css';

const navItems = [
  { to: '/escritorio', label: 'Escritorio', icon: BookOpen },
  { to: '/recuerdos', label: 'Recuerdos', icon: Archive },
  { to: '/perfil', label: 'Perfil', icon: User },
];

const overlayVariants = {
  hidden: { opacity: 0, x: '100%' },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    x: '100%',
    transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
  },
};

const mobileLinkVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.1 + i * 0.07, duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  }),
};

const pageVariants = {
  initial: { opacity: 0, y: 14 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.25, ease: 'easeIn' },
  },
};

export default function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  /* Close mobile menu on route change */
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  /* Header shadow on scroll */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Lock body scroll when mobile menu is open */
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  return (
    <>
      {/* ── Header ── */}
      <header className={`layout-header${scrolled ? ' scrolled' : ''}`}>
        <Link to="/" className="brand" aria-label="Inicio Remember Me">
          <span className="brand-circle">
            <span className="brand-letter">R.</span>
          </span>
          <span className="brand-name">me</span>
        </Link>

        {/* Desktop nav */}
        <nav className="nav-desktop" aria-label="Navegación principal">
          {navItems.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `nav-link${isActive ? ' active' : ''}`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Hamburger */}
        <button
          className={`hamburger${menuOpen ? ' open' : ''}`}
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={menuOpen}
        >
          <span className="hamburger-line" />
          <span className="hamburger-line" />
          <span className="hamburger-line" />
        </button>
      </header>

      {/* ── Mobile Overlay ── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            className="mobile-overlay"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            aria-label="Menú móvil"
          >
            {navItems.map(({ to, label, icon: Icon }, i) => (
              <motion.div
                key={to}
                custom={i}
                variants={mobileLinkVariants}
                initial="hidden"
                animate="visible"
              >
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    `mobile-nav-link${isActive ? ' active' : ''}`
                  }
                  onClick={() => setMenuOpen(false)}
                >
                  <Icon size={22} style={{ marginRight: 10, verticalAlign: 'middle' }} />
                  {label}
                </NavLink>
              </motion.div>
            ))}
          </motion.nav>
        )}
      </AnimatePresence>

      {/* ── Page Content ── */}
      <main className="layout-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            className="page-wrapper"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* ── Footer ── */}
      <footer className="layout-footer">
        <p className="footer-copy">
          © 2026 <strong>Remember Me</strong>
        </p>
        <p className="footer-project">
          Creado por Ney bajo el proyecto LA MARMOTA NEGRA
        </p>
      </footer>
    </>
  );
}
