/* ═══════════════════════════════════════════════════════
   Recuerdos — Colección de memorias guardadas
   © 2026 Ney · LA MARMOTA NEGRA
   ═══════════════════════════════════════════════════════ */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  Plus,
  Trash2,
  Edit3,
  X,
  MapPin,
  Calendar,
  Tag,
  Eye,
  ChevronDown,
} from 'lucide-react';
import useMemories from '../hooks/useMemories';
import './Recuerdos.css';

/* ── Categorías disponibles ── */
const CATEGORIES = ['Todas', 'Personal', 'Ideas', 'Personas', 'Por hacer'];

/* ── Helpers de formato ── */
function fmtDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function preview(text, max = 110) {
  if (!text) return '';
  return text.length > max ? text.slice(0, max) + '…' : text;
}

/* ── Variantes de animación ── */
const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { delay: i * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] },
  }),
  exit: { opacity: 0, scale: 0.92, transition: { duration: 0.25 } },
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

const dialogVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0,
    scale: 0.92,
    y: 12,
    transition: { duration: 0.2 },
  },
};

export default function Recuerdos() {
  const {
    memories,
    deleteMemory,
    deleteMemories,
    renameMemory,
    filterMemories,
  } = useMemories();

  /* ── Filtros ── */
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [category, setCategory] = useState('Todas');

  const filtersActive = dateFrom || dateTo || category !== 'Todas';

  const filtered = useMemo(() => {
    return filterMemories({
      from: dateFrom || undefined,
      to: dateTo ? dateTo + 'T23:59:59' : undefined,
      category: category !== 'Todas' ? category : undefined,
    });
  }, [memories, dateFrom, dateTo, category, filterMemories]);

  function clearFilters() {
    setDateFrom('');
    setDateTo('');
    setCategory('Todas');
  }

  /* ── Selección múltiple ── */
  const [selected, setSelected] = useState(new Set());

  function toggleSelect(id) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function clearSelection() {
    setSelected(new Set());
  }

  /* ── Diálogos ── */
  const [detailNote, setDetailNote] = useState(null);
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const [deleteOpen, setDeleteOpen] = useState(false);

  /* Detalle */
  function openDetail(note) {
    setDetailNote(note);
  }
  function closeDetail() {
    setDetailNote(null);
  }

  /* Renombrar */
  function openRename() {
    setRenameValue('');
    setRenameOpen(true);
  }
  function confirmRename() {
    if (!renameValue.trim()) return;
    selected.forEach((id) => renameMemory(id, renameValue.trim()));
    setRenameOpen(false);
    clearSelection();
  }

  /* Eliminar */
  function openDelete() {
    setDeleteOpen(true);
  }
  function confirmDelete() {
    deleteMemories([...selected]);
    setDeleteOpen(false);
    clearSelection();
  }

  /* ── Render ── */
  return (
    <div className="recuerdos-page">
      {/* ── Header ── */}
      <motion.header
        className="recuerdos-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <h1 className="recuerdos-title">
          Todos tus <span className="accent-italic">recuerdos.</span>
        </h1>
        <p className="recuerdos-subtitle">
          Un vistazo a las cosas que elegiste guardar.
        </p>
        <Link to="/escritorio" className="recuerdos-new-btn">
          <motion.span
            className="recuerdos-new-btn-inner"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
          >
            <Plus size={18} />
            Nueva nota
          </motion.span>
        </Link>
      </motion.header>

      {/* ── Filtros ── */}
      <motion.section
        className="recuerdos-filters"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4 }}
      >
        <div className="filter-group">
          <label className="filter-label">Desde</label>
          <input
            type="date"
            className="filter-input"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label className="filter-label">Hasta</label>
          <input
            type="date"
            className="filter-input"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label className="filter-label">Categoría</label>
          <div className="filter-select-wrap">
            <select
              className="filter-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <ChevronDown size={15} className="filter-select-icon" />
          </div>
        </div>

        <button
          className="filter-clear-btn"
          disabled={!filtersActive}
          onClick={clearFilters}
        >
          Limpiar
        </button>

        <span className="filter-count">
          {filtered.length} {filtered.length === 1 ? 'resultado' : 'resultados'}
        </span>
      </motion.section>

      {/* ── Toolbar de selección ── */}
      <AnimatePresence>
        {selected.size > 0 && (
          <motion.div
            className="selection-toolbar"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <span className="selection-count">
              {selected.size} {selected.size === 1 ? 'seleccionada' : 'seleccionadas'}
            </span>

            <div className="selection-actions">
              <button className="sel-btn sel-rename" onClick={openRename}>
                <Edit3 size={15} />
                Renombrar
              </button>
              <button className="sel-btn sel-delete" onClick={openDelete}>
                <Trash2 size={15} />
                Eliminar seleccionadas
              </button>
              <button className="sel-btn sel-cancel" onClick={clearSelection}>
                <X size={15} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Grid de notas ── */}
      <section className="recuerdos-grid">
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <motion.div
              className="empty-state"
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Search size={48} strokeWidth={1.2} />
              <p className="empty-title">Sin recuerdos todavía</p>
              <p className="empty-sub">
                Crea tu primera nota desde el escritorio.
              </p>
            </motion.div>
          ) : (
            filtered.map((note, i) => (
              <motion.article
                className={`note-card ${selected.has(note.id) ? 'selected' : ''}`}
                key={note.id}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                layout
              >
                {/* Checkbox */}
                <label className="note-check">
                  <input
                    type="checkbox"
                    checked={selected.has(note.id)}
                    onChange={() => toggleSelect(note.id)}
                  />
                  <span className="note-check-mark" />
                </label>

                {/* Clickable body */}
                <div
                  className="note-body"
                  onClick={() => openDetail(note)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && openDetail(note)}
                >
                  {note.category && (
                    <span className="note-tag">
                      <Tag size={12} />
                      {note.category}
                    </span>
                  )}

                  <h3 className="note-title">
                    {note.title || 'Sin título'}
                  </h3>

                  <p className="note-preview">{preview(note.content)}</p>

                  {note.image && (
                    <div className="note-thumb">
                      <img src={note.image} alt="" />
                    </div>
                  )}

                  <footer className="note-meta">
                    <span className="note-date">
                      <Calendar size={13} />
                      {fmtDate(note.timestamp)}
                    </span>
                    {note.mood && (
                      <span className="note-mood">{note.mood}</span>
                    )}
                  </footer>
                </div>

                {/* Quick view */}
                <button
                  className="note-view-btn"
                  onClick={() => openDetail(note)}
                  title="Ver detalle"
                >
                  <Eye size={16} />
                </button>
              </motion.article>
            ))
          )}
        </AnimatePresence>
      </section>

      {/* ═══ DIÁLOGO: Detalle ═══ */}
      <AnimatePresence>
        {detailNote && (
          <>
            <motion.div
              className="dialog-overlay"
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={closeDetail}
            />
            <motion.div
              className="dialog detail-dialog"
              variants={dialogVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <button className="dialog-close" onClick={closeDetail}>
                <X size={20} />
              </button>

              <div className="detail-meta-row">
                {detailNote.category && (
                  <span className="detail-tag">
                    <Tag size={13} />
                    {detailNote.category}
                  </span>
                )}
                <span className="detail-date">
                  <Calendar size={13} />
                  {fmtDate(detailNote.timestamp)}
                </span>
                {detailNote.mood && (
                  <span className="detail-mood">{detailNote.mood}</span>
                )}
              </div>

              <h2 className="detail-title">
                {detailNote.title || 'Sin título'}
              </h2>

              <div className="detail-content">
                {detailNote.content || 'Sin contenido.'}
              </div>

              {detailNote.image && (
                <div className="detail-image">
                  <img src={detailNote.image} alt="" />
                </div>
              )}

              {detailNote.location && (
                <a
                  className="detail-location"
                  href={`https://maps.google.com/?q=${encodeURIComponent(detailNote.location)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MapPin size={14} />
                  {detailNote.location}
                </a>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ═══ DIÁLOGO: Renombrar ═══ */}
      <AnimatePresence>
        {renameOpen && (
          <>
            <motion.div
              className="dialog-overlay"
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={() => setRenameOpen(false)}
            />
            <motion.div
              className="dialog rename-dialog"
              variants={dialogVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <h3 className="dialog-heading">Renombrar notas</h3>
              <p className="dialog-sub">
                Asigna un nuevo título a {selected.size}{' '}
                {selected.size === 1 ? 'nota seleccionada' : 'notas seleccionadas'}.
              </p>
              <input
                className="dialog-input"
                type="text"
                placeholder="Nuevo título…"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                autoFocus
              />
              <div className="dialog-actions">
                <button
                  className="btn-secondary"
                  onClick={() => setRenameOpen(false)}
                >
                  Cancelar
                </button>
                <button
                  className="btn-primary"
                  onClick={confirmRename}
                  disabled={!renameValue.trim()}
                >
                  Guardar
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ═══ DIÁLOGO: Eliminar ═══ */}
      <AnimatePresence>
        {deleteOpen && (
          <>
            <motion.div
              className="dialog-overlay"
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={() => setDeleteOpen(false)}
            />
            <motion.div
              className="dialog delete-dialog"
              variants={dialogVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <h3 className="dialog-heading">¿Eliminar recuerdos?</h3>
              <p className="dialog-sub">
                Estás a punto de eliminar{' '}
                <strong>
                  {selected.size}{' '}
                  {selected.size === 1 ? 'nota' : 'notas'}
                </strong>
                . Esta acción no se puede deshacer.
              </p>
              <div className="dialog-actions">
                <button
                  className="btn-secondary"
                  onClick={() => setDeleteOpen(false)}
                >
                  Cancelar
                </button>
                <button className="btn-danger" onClick={confirmDelete}>
                  Eliminar
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
