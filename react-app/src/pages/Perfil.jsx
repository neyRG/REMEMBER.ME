/* ═══════════════════════════════════════════════════════
   Perfil — Página de perfil y ajustes del usuario
   © 2026 Ney · LA MARMOTA NEGRA
   ═══════════════════════════════════════════════════════ */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Mail,
  Lock,
  Camera,
  MapPin,
  Calendar,
  Save,
  X,
  Check,
} from 'lucide-react';
import './Perfil.css';

/* ── localStorage helpers ── */
const PROFILE_KEY = 'rememberme_profile';
const MAX_AVATAR_SIZE = 2 * 1024 * 1024;

function loadProfile() {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    const saved = raw ? JSON.parse(raw) : {};
    return {
      name: typeof saved.name === 'string' ? saved.name : '',
      bio: typeof saved.bio === 'string' ? saved.bio : '',
      birthday: typeof saved.birthday === 'string' ? saved.birthday : '',
      city: typeof saved.city === 'string' ? saved.city : '',
      email: typeof saved.email === 'string' ? saved.email : '',
      avatar: typeof saved.avatar === 'string' ? saved.avatar : null,
    };
  } catch {
    return {};
  }
}

function saveProfile(data) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(data));
}

/* ── Variantes de animación ── */
const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.45, ease: [0.16, 1, 0.3, 1] },
  }),
};

const checkVariants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 400, damping: 15 } },
  exit: { opacity: 0, scale: 0.5, transition: { duration: 0.2 } },
};

export default function Perfil() {
  const fileRef = useRef(null);
  const infoTimeout = useRef(null);
  const emailTimeout = useRef(null);

  /* ── State from localStorage ── */
  const [profile, setProfile] = useState(() => {
    const p = loadProfile();
    return {
      name: p.name || '',
      bio: p.bio || '',
      birthday: p.birthday || '',
      city: p.city || '',
      email: p.email || '',
      avatar: p.avatar || null,
    };
  });
  const profileRef = useRef(profile);

  /* ── Form state ── */
  const [name, setName] = useState(profile.name);
  const [bio, setBio] = useState(profile.bio);
  const [birthday, setBirthday] = useState(profile.birthday);
  const [city, setCity] = useState(profile.city);

  const [newEmail, setNewEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');

  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  /* ── Status messages ── */
  const [infoStatus, setInfoStatus] = useState('');
  const [infoStatusType, setInfoStatusType] = useState('success');
  const [emailStatus, setEmailStatus] = useState('');
  const [emailStatusType, setEmailStatusType] = useState('error');
  const [avatarStatus, setAvatarStatus] = useState('');
  const [infoSaved, setInfoSaved] = useState(false);
  const [emailSaved, setEmailSaved] = useState(false);

  useEffect(() => () => {
    clearTimeout(infoTimeout.current);
    clearTimeout(emailTimeout.current);
  }, []);

  function updateProfile(updates) {
    const next = { ...profileRef.current, ...updates };
    try {
      saveProfile(next);
      profileRef.current = next;
      setProfile(next);
      setInfoStatus('');
      setInfoSaved(false);
      return true;
    } catch {
      clearTimeout(infoTimeout.current);
      setInfoSaved(false);
      setInfoStatus('No se pudo guardar en este navegador. Libera espacio e inténtalo de nuevo.');
      setInfoStatusType('error');
      return false;
    }
  }

  function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setAvatarStatus('El archivo seleccionado no es una imagen.');
      e.target.value = '';
      return;
    }

    if (file.size > MAX_AVATAR_SIZE) {
      setAvatarStatus('La imagen debe pesar menos de 2 MB.');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        setAvatarStatus('No se pudo cargar la imagen. Inténtalo de nuevo.');
        return;
      }
      setAvatarStatus(
        updateProfile({ avatar: reader.result })
          ? 'Foto actualizada.'
          : 'No se pudo guardar la foto en este navegador.'
      );
    };
    reader.onerror = () => {
      setAvatarStatus('No se pudo leer la imagen. Inténtalo de nuevo.');
      e.target.value = '';
    };
    reader.readAsDataURL(file);
  }

  function removeAvatar() {
    setAvatarStatus(
      updateProfile({ avatar: null })
        ? 'Foto eliminada.'
        : 'No se pudo quitar la foto guardada.'
    );
    if (fileRef.current) fileRef.current.value = '';
  }

  function saveInfo(e) {
    e.preventDefault();
    const trimmedName = name.trim();
    clearTimeout(infoTimeout.current);

    if (!trimmedName) {
      setInfoStatus('Escribe tu nombre.');
      setInfoStatusType('error');
      setInfoSaved(false);
      return;
    }

    const saved = updateProfile({
      name: trimmedName,
      bio: bio.trim(),
      birthday,
      city: city.trim(),
    });
    if (!saved) return;
    setInfoStatus('¡Información guardada!');
    setInfoStatusType('success');
    setInfoSaved(true);
    clearTimeout(infoTimeout.current);
    infoTimeout.current = setTimeout(() => {
      setInfoStatus('');
      setInfoSaved(false);
    }, 2500);
  }

  function saveEmail(e) {
    e.preventDefault();

    const email = newEmail.trim();
    const confirmation = confirmEmail.trim();
    clearTimeout(emailTimeout.current);

    if (!email) {
      setEmailStatus('Escribe un correo nuevo.');
      setEmailStatusType('error');
      setEmailSaved(false);
      return;
    }

    if (email.toLowerCase() !== confirmation.toLowerCase()) {
      setEmailStatus('Los correos no coinciden.');
      setEmailStatusType('error');
      setEmailSaved(false);
      return;
    }

    if (!updateProfile({ email })) {
      setEmailStatus('No se pudo guardar el correo en este navegador.');
      setEmailStatusType('error');
      return;
    }
    setNewEmail('');
    setConfirmEmail('');
    setEmailStatus('¡Correo actualizado!');
    setEmailStatusType('success');
    setEmailSaved(true);
    emailTimeout.current = setTimeout(() => {
      setEmailStatus('');
      setEmailSaved(false);
    }, 2500);
  }

  /* Initial letter for avatar fallback */
  const initial = (profile.name || profile.email || 'U').charAt(0).toUpperCase();

  return (
    <div className="perfil-page">
      {/* ── Header ── */}
      <motion.header
        className="perfil-header"
        initial={{ opacity: 0, y: -18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <span className="perfil-eyebrow">TU CUENTA</span>
        <h1 className="perfil-heading">Tu perfil.</h1>
        <p className="perfil-subtitle">
          Administra tu información personal y tus preferencias.
        </p>
      </motion.header>

      <div className="perfil-layout">
        {/* ═══════════ SIDEBAR ═══════════ */}
        <motion.aside
          className="perfil-sidebar"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
        >
          <div className="avatar-frame">
            {profile.avatar ? (
              <img
                className="avatar-img"
                src={profile.avatar}
                alt={profile.name ? `Foto de ${profile.name}` : 'Foto de perfil'}
              />
            ) : (
              <span className="avatar-fallback">{initial}</span>
            )}
          </div>

          <label className="avatar-upload-label" htmlFor="avatar-file">
            <Camera size={15} />
            Cambiar foto
            <input
              id="avatar-file"
              ref={fileRef}
              type="file"
              accept="image/*"
              className="visually-hidden avatar-file-input"
              onChange={handleAvatarChange}
            />
          </label>

          {avatarStatus && (
            <p className="avatar-status" role="status" aria-live="polite">
              {avatarStatus}
            </p>
          )}

          {profile.avatar && (
            <button className="avatar-remove-btn" type="button" onClick={removeAvatar}>
              <X size={14} />
              Quitar foto
            </button>
          )}

          <div className="sidebar-info">
            <p className="sidebar-name">{profile.name || 'Sin nombre'}</p>
            <p className="sidebar-email">{profile.email || 'sin correo'}</p>
          </div>

          <p className="sidebar-note">
            La información se guarda en este navegador.
          </p>
        </motion.aside>

        {/* ═══════════ MAIN SETTINGS ═══════════ */}
        <div className="perfil-main">
          {/* ── 1. Información personal ── */}
          <motion.section
            className="settings-card"
            custom={0}
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="card-eyebrow">
              <User size={14} />
              SOBRE TI
            </div>
            <h2 className="card-title">Información personal</h2>

            <form className="settings-form" onSubmit={saveInfo}>
              <div className="field">
                <label className="field-label" htmlFor="profile-name">Nombre</label>
                <input
                  id="profile-name"
                  type="text"
                  className="field-input"
                  placeholder="Tu nombre"
                  maxLength={50}
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="field">
                <label className="field-label" htmlFor="profile-bio">Acerca de ti</label>
                <textarea
                  id="profile-bio"
                  className="field-textarea"
                  placeholder="Cuéntanos algo sobre ti…"
                  maxLength={240}
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
                <span className="field-counter">{bio.length}/240</span>
              </div>

              <div className="field-row">
                <div className="field">
                  <label className="field-label" htmlFor="profile-birthday">
                    <Calendar size={13} />
                    Fecha de nacimiento
                  </label>
                  <input
                    id="profile-birthday"
                    type="date"
                    className="field-input"
                    value={birthday}
                    onChange={(e) => setBirthday(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label className="field-label" htmlFor="profile-city">
                    <MapPin size={13} />
                    Ciudad
                  </label>
                  <input
                    id="profile-city"
                    type="text"
                    className="field-input"
                    placeholder="Tu ciudad"
                    maxLength={80}
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-footer">
                <button type="submit" className="btn-save">
                  <Save size={15} />
                  Guardar información
                </button>
                <AnimatePresence>
                  {infoSaved && (
                    <motion.span
                      className="save-check"
                      variants={checkVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                    >
                      <Check size={16} />
                    </motion.span>
                  )}
                </AnimatePresence>
                {infoStatus && (
                  <span className={`status-msg ${infoStatusType}`} role="status" aria-live="polite">
                    {infoStatus}
                  </span>
                )}
              </div>
            </form>
          </motion.section>

          {/* ── 2. Correo electrónico ── */}
          <motion.section
            className="settings-card"
            custom={1}
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="card-eyebrow">
              <Mail size={14} />
              ACCESO
            </div>
            <h2 className="card-title">Correo electrónico</h2>

            <form className="settings-form" onSubmit={saveEmail}>
              <div className="field">
                <label className="field-label" htmlFor="current-email">Correo actual</label>
                <input
                  id="current-email"
                  type="email"
                  className="field-input readonly"
                  value={profile.email}
                  placeholder="No configurado"
                  readOnly
                />
              </div>

              <div className="field-row">
                <div className="field">
                  <label className="field-label" htmlFor="new-email">Nuevo correo</label>
                  <input
                    id="new-email"
                    type="email"
                    className="field-input"
                    placeholder="nuevo@correo.com"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label className="field-label" htmlFor="confirm-email">Confirmar correo</label>
                  <input
                    id="confirm-email"
                    type="email"
                    className="field-input"
                    placeholder="confirmar@correo.com"
                    required
                    value={confirmEmail}
                    onChange={(e) => setConfirmEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-footer">
                <button type="submit" className="btn-save">
                  <Mail size={15} />
                  Actualizar correo
                </button>
                <AnimatePresence>
                  {emailSaved && (
                    <motion.span
                      className="save-check"
                      variants={checkVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                    >
                      <Check size={16} />
                    </motion.span>
                  )}
                </AnimatePresence>
                {emailStatus && (
                  <span
                    className={`status-msg ${emailStatusType}`}
                    role="status"
                    aria-live="polite"
                  >
                    {emailStatus}
                  </span>
                )}
              </div>
            </form>
          </motion.section>

          {/* ── 3. Contraseña ── */}
          <motion.section
            className="settings-card"
            custom={2}
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="card-eyebrow">
              <Lock size={14} />
              SEGURIDAD
            </div>
            <h2 className="card-title">Contraseña</h2>

            <p className="security-note">
              El acceso todavía no está conectado a un servicio de cuentas.
              Cuando se integre, podrás cambiar tu contraseña aquí.
            </p>

            <fieldset className="settings-form" disabled>
              <div className="field-row">
                <div className="field">
                  <label className="field-label" htmlFor="new-password">Nueva contraseña</label>
                  <input
                    id="new-password"
                    type="password"
                    className="field-input"
                    placeholder="••••••••"
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label className="field-label" htmlFor="confirm-password">Confirmar contraseña</label>
                  <input
                    id="confirm-password"
                    type="password"
                    className="field-input"
                    placeholder="••••••••"
                    value={confirmPass}
                    onChange={(e) => setConfirmPass(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-footer">
                <button type="button" className="btn-save disabled-btn">
                  <Lock size={15} />
                  Cambiar contraseña
                </button>
              </div>
            </fieldset>
          </motion.section>
        </div>
      </div>
    </div>
  );
}
