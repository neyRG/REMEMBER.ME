import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  Archive,
  BookOpen,
  Image,
  MapPin,
  NotebookPen,
  UserRound,
} from 'lucide-react';
import heroImage from '../assets/imagen-de-inicio.png';
import './Home.css';

const particles = [
  { left: '8%', top: '18%', delay: 0 },
  { left: '18%', top: '72%', delay: 1.1 },
  { left: '31%', top: '28%', delay: 0.6 },
  { left: '44%', top: '82%', delay: 1.8 },
  { left: '57%', top: '16%', delay: 0.3 },
  { left: '69%', top: '68%', delay: 1.4 },
  { left: '81%', top: '32%', delay: 0.9 },
  { left: '92%', top: '78%', delay: 2.1 },
];

const featureCards = [
  {
    icon: NotebookPen,
    eyebrow: 'TU CUADERNO DIGITAL',
    title: 'Escribe sin prisa.',
    description:
      'Guarda ideas, momentos y notas con categorías, imágenes, ubicación y estado de ánimo.',
    tags: ['Personal', 'Ideas', 'Personas', 'Por hacer'],
  },
  {
    icon: Archive,
    eyebrow: 'TU COLECCIÓN',
    title: 'Encuentra lo importante.',
    description:
      'Tus recuerdos quedan ordenados para que puedas volver a ellos cuando quieras.',
    tags: ['Filtros', 'Fechas', 'Búsqueda fácil'],
  },
  {
    icon: UserRound,
    eyebrow: 'TU ESPACIO',
    title: 'A tu manera.',
    description:
      'Personaliza tu perfil. Tus notas y preferencias permanecen guardadas en este navegador.',
    tags: ['Privado', 'Personal'],
  },
];

const formVariants = {
  hidden: { opacity: 0, x: 14 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
  },
  exit: { opacity: 0, x: -14, transition: { duration: 0.18 } },
};

export default function Home() {
  const [mode, setMode] = useState('login');
  const [message, setMessage] = useState('');
  const isRegistering = mode === 'register';

  function changeMode(nextMode) {
    setMode(nextMode);
    setMessage('');
  }

  function handleSubmit(event) {
    event.preventDefault();
    setMessage(
      'El acceso todavía no está conectado a un servicio de cuentas. Puedes continuar al cuaderno.'
    );
  }

  return (
    <div className="home-page">
      <section className="home-hero">
        <motion.div
          className="home-hero__bg"
          style={{ backgroundImage: `url(${heroImage})` }}
          initial={{ scale: 1.06 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          aria-hidden="true"
        />
        <div className="home-particles" aria-hidden="true">
          {particles.map((particle) => (
            <motion.span
              className="home-particle"
              key={particle.left}
              style={{ left: particle.left, top: particle.top }}
              animate={{ y: [0, -14, 0], opacity: [0.15, 0.55, 0.15] }}
              transition={{
                duration: 4.5,
                delay: particle.delay,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>

        <header className="home-topbar">
          <Link to="/" className="home-brand" aria-label="Remember Me, inicio">
            <span className="home-brand__mark">R.</span>
            <span>me</span>
          </Link>
          <Link to="/escritorio" className="home-topbar__link">
            Ir a mi cuaderno <ArrowUpRight size={16} />
          </Link>
        </header>

        <div className="home-hero__content">
          <motion.div
            className="home-welcome"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
            }}
          >
            <motion.span
              className="home-welcome__eyebrow"
              variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
            >
              TU ESPACIO, TUS RECUERDOS
            </motion.span>
            <motion.h1
              className="home-welcome__heading"
              variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0 } }}
            >
              Lo que importa
              <br />
              <em>merece quedarse.</em>
            </motion.h1>
            <motion.p
              className="home-welcome__subtitle"
              variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }}
            >
              Un espacio libre para tus recuerdos, ideas y notas. Guarda hoy
              esos pequeños momentos que querrás recordar.
            </motion.p>
            <motion.div
              className="home-welcome__details"
              variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
            >
              <span><BookOpen size={16} /> Un cuaderno solo tuyo</span>
              <span><Image size={16} /> Fotos y recuerdos</span>
              <span><MapPin size={16} /> Lugares especiales</span>
            </motion.div>
          </motion.div>

          <motion.div
            className="home-panel"
            initial={{ opacity: 0, y: 22, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.25, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="home-tabs" role="tablist" aria-label="Acceso a Remember Me">
              <button
                className={`home-tabs__btn${!isRegistering ? ' home-tabs__btn--active' : ''}`}
                id="login-tab"
                type="button"
                role="tab"
                aria-selected={!isRegistering}
                aria-controls="account-form"
                onClick={() => changeMode('login')}
              >
                Iniciar sesión
              </button>
              <button
                className={`home-tabs__btn${isRegistering ? ' home-tabs__btn--active' : ''}`}
                id="register-tab"
                type="button"
                role="tab"
                aria-selected={isRegistering}
                aria-controls="account-form"
                onClick={() => changeMode('register')}
              >
                Registrarse
              </button>
            </div>

            <AnimatePresence mode="wait">
              <motion.form
                className="home-form"
                id="account-form"
                key={mode}
                role="tabpanel"
                aria-labelledby={isRegistering ? 'register-tab' : 'login-tab'}
                variants={formVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onSubmit={handleSubmit}
              >
                <h2 className="home-form__title">
                  {isRegistering ? 'Empecemos por aquí.' : 'Qué bueno verte.'}
                </h2>
                {isRegistering && (
                  <label className="home-form__group">
                    <span className="home-form__label">Tu nombre</span>
                    <input
                      className="home-form__input"
                      type="text"
                      name="name"
                      autoComplete="name"
                      placeholder="¿Cómo te llamas?"
                      required
                    />
                  </label>
                )}
                <label className="home-form__group">
                  <span className="home-form__label">Correo electrónico</span>
                  <input
                    className="home-form__input"
                    type="email"
                    name="email"
                    autoComplete="email"
                    placeholder="tu@correo.com"
                    required
                  />
                </label>
                <label className="home-form__group">
                  <span className="home-form__label">
                    {isRegistering ? 'Crea una contraseña' : 'Contraseña'}
                  </span>
                  <input
                    className="home-form__input"
                    type="password"
                    name="password"
                    autoComplete={isRegistering ? 'new-password' : 'current-password'}
                    minLength={isRegistering ? 8 : undefined}
                    placeholder={isRegistering ? 'Mínimo 8 caracteres' : 'Tu contraseña'}
                    required
                  />
                </label>
                <motion.button
                  className="home-form__submit"
                  type="submit"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isRegistering ? 'Crear mi cuenta' : 'Entrar a mi espacio'}
                  <ArrowRight size={17} />
                </motion.button>
              </motion.form>
            </AnimatePresence>

            <AnimatePresence>
              {message && (
                <motion.p
                  className="home-form__message"
                  role="status"
                  initial={{ opacity: 0, height: 0, y: 6 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: 6 }}
                >
                  {message}
                </motion.p>
              )}
            </AnimatePresence>
            <Link className="home-guest" to="/escritorio">
              Continuar al cuaderno <ArrowUpRight size={16} />
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="home-features" aria-labelledby="features-title">
        <div className="home-features__inner">
          <motion.h2
            className="home-features__heading"
            id="features-title"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.45 }}
          >
            Un lugar para lo que importa.
          </motion.h2>
          <div className="home-features__grid">
            {featureCards.map(({ icon: Icon, eyebrow, title, description, tags }, index) => (
              <motion.article
                className="home-feature-card"
                key={title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: index * 0.1, duration: 0.45 }}
                whileHover={{ y: -5 }}
              >
                <span className="home-feature-card__icon"><Icon /></span>
                <p className="home-feature-card__eyebrow">{eyebrow}</p>
                <h3 className="home-feature-card__title">{title}</h3>
                <p className="home-feature-card__desc">{description}</p>
                <div className="home-feature-card__tags">
                  {tags.map((tag) => (
                    <span className="home-feature-card__tag" key={tag}>{tag}</span>
                  ))}
                </div>
              </motion.article>
            ))}
          </div>
          <motion.div
            className="home-features__cta"
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Link to="/escritorio">Empieza a guardar recuerdos <ArrowRight size={17} /></Link>
          </motion.div>
        </div>
      </section>

      <footer className="home-footer">
        <p>© 2026 <strong>Remember Me</strong></p>
        <p>Creado por Ney bajo el proyecto LA MARMOTA NEGRA</p>
      </footer>
    </div>
  );
}
