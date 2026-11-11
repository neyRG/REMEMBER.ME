import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Archive,
  CalendarDays,
  Check,
  ImagePlus,
  MapPin,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import useMemories from '../hooks/useMemories.js';
import './Escritorio.css';

const moods = [
  'Feliz',
  'Tranquilo/a',
  'Agradecido/a',
  'Ilusionado/a',
  'Motivado/a',
  'Nostálgico/a',
  'Preocupado/a',
  'Ansioso/a',
  'Triste',
  'Frustrado/a',
  'Enojado/a',
  'Cansado/a',
];

function formatDate(value) {
  return new Date(value).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function readImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') resolve(reader.result);
      else reject(new Error('No se pudo leer el archivo de imagen.'));
    };
    reader.onerror = () => reject(reader.error || new Error('No se pudo leer la imagen.'));
    reader.readAsDataURL(file);
  });
}

async function optimizeImage(file) {
  const source = await readImage(file);
  const image = new Image();
  image.src = source;
  await new Promise((resolve, reject) => {
    image.onload = resolve;
    image.onerror = () => reject(new Error('El archivo seleccionado no es una imagen válida.'));
  });

  const scale = Math.min(1, 1400 / Math.max(image.naturalWidth, image.naturalHeight));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
  const context = canvas.getContext('2d');
  if (!context) throw new Error('No se pudo preparar la imagen para guardarla.');
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL(file.type === 'image/png' ? 'image/png' : 'image/jpeg', 0.82);
}

export default function Escritorio() {
  const { memories, addMemory, deleteMemory, saveDraft, loadDraft, clearDraft } = useMemories();
  const fileInput = useRef(null);
  const [draft] = useState(() => loadDraft() || {});
  const [title, setTitle] = useState(draft.title || '');
  const [content, setContent] = useState(draft.content || '');
  const [category, setCategory] = useState(draft.category || 'Personal');
  const [mood, setMood] = useState(draft.mood || '');
  const [image, setImage] = useState(draft.image || '');
  const [location, setLocation] = useState(draft.location || '');
  const [status, setStatus] = useState('El borrador se guarda automáticamente en este navegador.');
  const [isLocating, setIsLocating] = useState(false);
  const [today] = useState(() => new Intl.DateTimeFormat('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date()));

  function updateDraft(changes) {
    try {
      saveDraft({ title, content, category, mood, image, location, ...changes });
      setStatus('El borrador se guarda automáticamente en este navegador.');
    } catch (error) {
      console.error('No se pudo guardar el borrador:', error);
      setStatus('No se pudo guardar el borrador en este navegador.');
    }
  }

  async function handleImageChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setStatus('El archivo seleccionado no es una imagen.');
      return;
    }
    try {
      const optimizedImage = await optimizeImage(file);
      setImage(optimizedImage);
      updateDraft({ image: optimizedImage });
      setStatus('Imagen añadida a la nota.');
    } catch (error) {
      console.error('No se pudo procesar la imagen:', error);
      setStatus(error.message || 'No se pudo procesar la imagen.');
    }
  }

  function addLocation() {
    if (!navigator.geolocation) {
      setStatus('Este navegador no permite obtener la ubicación.');
      return;
    }
    setIsLocating(true);
    setStatus('Obteniendo ubicación…');
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const nextLocation = `${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`;
        setLocation(nextLocation);
        updateDraft({ location: nextLocation });
        setStatus('Ubicación añadida a la nota.');
        setIsLocating(false);
      },
      (error) => {
        const explanation = error.code === error.PERMISSION_DENIED
          ? 'No se concedió permiso para obtener la ubicación.'
          : 'No se pudo obtener la ubicación. Inténtalo de nuevo.';
        setStatus(explanation);
        setIsLocating(false);
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
    );
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!title.trim()) return;
    addMemory({ title: title.trim(), content: content.trim(), category, mood, image, location });
    setTitle('');
    setContent('');
    setCategory('Personal');
    setMood('');
    setImage('');
    setLocation('');
    if (fileInput.current) fileInput.current.value = '';
    try {
      clearDraft();
      setStatus('Recuerdo guardado. Tu siguiente idea ya tiene espacio.');
    } catch (error) {
      console.error('No se pudo limpiar el borrador guardado:', error);
      setStatus('Recuerdo guardado, pero no se pudo limpiar el borrador anterior.');
    }
  }

  return (
    <div className="escritorio">
      <section className="escritorio__hero" aria-labelledby="desk-title">
        <motion.div
          className="welcome"
          initial={{ opacity: 0, x: -18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="eyebrow">TU CUADERNO</p>
          <h1 className="welcome__heading" id="desk-title">
            Que no se te<br /><em>escape nada.</em>
          </h1>
          <p className="welcome__copy">
            Ideas, momentos y pequeñas cosas que quieres tener cerca.
          </p>
          <span className="welcome__date-pill"><CalendarDays size={15} /> {today}</span>
        </motion.div>

        <motion.form
          className="form-card"
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="form-card__header">
            <span className="form-card__icon-circle"><Plus /></span>
            <div>
              <p className="form-card__title">NUEVA NOTA</p>
              <h2 className="form-card__subtitle">Guarda un recuerdo</h2>
            </div>
          </div>

          <div className="form-group">
            <label className="form-group__label" htmlFor="memory-title">Ponle un título</label>
            <input
              className="form-group__input"
              id="memory-title"
              value={title}
              onChange={(event) => {
                setTitle(event.target.value);
                updateDraft({ title: event.target.value });
              }}
              maxLength={80}
              placeholder="Lo que no quiero olvidar..."
              required
            />
          </div>
          <div className="form-group">
            <label className="visually-hidden" htmlFor="memory-content">Contenido de la nota</label>
            <textarea
              className="form-group__textarea"
              id="memory-content"
              value={content}
              onChange={(event) => {
                setContent(event.target.value);
                updateDraft({ content: event.target.value });
              }}
              rows={5}
              maxLength={2000}
              placeholder="Escribe una idea, un momento o cualquier cosa..."
            />
          </div>

          <div className="attachments-row">
            <button className="attach-btn" type="button" onClick={() => fileInput.current?.click()}>
              <ImagePlus /> Añadir imagen
            </button>
            <input
              ref={fileInput}
              className="visually-hidden"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              aria-label="Seleccionar una imagen"
            />
            <button className="attach-btn" type="button" onClick={addLocation} disabled={isLocating}>
              <MapPin /> {isLocating ? 'Buscando…' : 'Añadir ubicación'}
            </button>
          </div>

          {(image || location) && (
            <motion.div
              className="attachment-stack"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              {image && (
                <div className="preview-box">
                  <img className="preview-box__thumb" src={image} alt="Vista previa del recuerdo" />
                  <span className="preview-box__info">Imagen lista para guardar</span>
                  <button
                    className="preview-box__remove"
                    type="button"
                    onClick={() => {
                      setImage('');
                      updateDraft({ image: '' });
                      if (fileInput.current) fileInput.current.value = '';
                    }}
                    aria-label="Quitar imagen"
                  ><X /></button>
                </div>
              )}
              {location && (
                <div className="preview-box">
                  <MapPin size={18} />
                  <span className="preview-box__info">{location}</span>
                  <button
                    className="preview-box__remove"
                    type="button"
                    onClick={() => {
                      setLocation('');
                      updateDraft({ location: '' });
                    }}
                    aria-label="Quitar ubicación"
                  ><X /></button>
                </div>
              )}
            </motion.div>
          )}

          <p className="autosave-hint" role="status" aria-live="polite">{status}</p>
          <div className="form-card__footer">
            <label className="visually-hidden" htmlFor="memory-category">Categoría</label>
            <select
              className="form-select"
              id="memory-category"
              value={category}
              onChange={(event) => {
                setCategory(event.target.value);
                updateDraft({ category: event.target.value });
              }}
            >
              <option>Personal</option>
              <option>Ideas</option>
              <option>Personas</option>
              <option>Por hacer</option>
            </select>
            <label className="visually-hidden" htmlFor="memory-mood">Estado de ánimo</label>
            <select
              className="form-select"
              id="memory-mood"
              value={mood}
              onChange={(event) => {
                setMood(event.target.value);
                updateDraft({ mood: event.target.value });
              }}
            >
              <option value="">Estado de ánimo</option>
              {moods.map((option) => <option key={option}>{option}</option>)}
            </select>
            <motion.button
              className="form-card__submit"
              type="submit"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
            >
              <Plus size={17} /> Guardar nota
            </motion.button>
          </div>
        </motion.form>
      </section>

      <motion.section
        className="recent-section"
        aria-labelledby="recent-title"
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.45 }}
      >
        <div className="recent-section__header">
          <div>
            <p className="eyebrow">TU COLECCIÓN</p>
            <h2 className="recent-section__title" id="recent-title">Recuerdos recientes</h2>
          </div>
          <span className="recent-section__badge">{memories.length}</span>
          <Link className="recent-section__link" to="/recuerdos">
            Ver colección <Archive size={16} />
          </Link>
        </div>

        {memories.length ? (
          <div className="memories-grid">
            {memories.slice(0, 3).map((memory, index) => (
              <motion.article
                className="memory-card"
                key={memory.id}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08, duration: 0.35 }}
                layout
              >
                {memory.image && <img className="memory-card__thumb" src={memory.image} alt="" />}
                <div className="memory-card__body">
                  <span className={`memory-card__category memory-card__category--${memory.category?.toLowerCase().replace(/\s+/g, '-')}`}>
                    {memory.category}
                  </span>
                  <h3 className="memory-card__title">{memory.title || 'Sin título'}</h3>
                  <p className="memory-card__preview">
                    {memory.content || 'Este recuerdo no tiene texto.'}
                  </p>
                  <div className="memory-card__meta">
                    <CalendarDays size={13} /> {formatDate(memory.timestamp)}
                    {memory.mood && <span className="memory-card__mood">{memory.mood}</span>}
                    <button
                      className="memory-card__delete"
                      type="button"
                      onClick={() => deleteMemory(memory.id)}
                      aria-label={`Eliminar ${memory.title || 'recuerdo'}`}
                    ><Trash2 size={14} /></button>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        ) : (
          <motion.div
            className="empty-state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Check className="empty-state__icon" />
            <p className="empty-state__text">Tu primera nota empieza aquí.</p>
          </motion.div>
        )}
      </motion.section>
    </div>
  );
}
