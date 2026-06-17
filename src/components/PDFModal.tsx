import { useState } from 'react';
import { X, Download, FileText } from 'lucide-react';
import {
  isMadresAnnounceActive,
  isMadresSaleActive,
  MADRES_GIFT_NAME_ES,
  MADRES_GIFT_NAME_EN,
} from '../lib/promoMadres';

export type PdfMode = 'cash' | 'homedepot' | 'sync' | 'kiwi';
export type SyncTerm = '12' | '24' | '48';
export type Idioma = 'es' | 'en';

export interface ClienteForm {
  nombre: string;
  correo: string;
  telefono: string;
  direccion: string;
}

export interface ConsultorForm {
  nombre: string;
  correo: string;
  telefono: string;
  agenteTelefonico: string;   // Agente Telefónico (Lead Owner) — obligatorio
}

export interface FarmaciasPromo {
  activa: boolean;
  nombre: string;
}

export interface PDFFormData {
  cliente: ClienteForm;
  consultor: ConsultorForm;
  pdfModes: PdfMode[];
  pdfSyncTerms: SyncTerm[];
  idioma: Idioma;
  promoMadres: boolean;
  farmacias: FarmaciasPromo;
}

interface PDFModalProps {
  isOpen: boolean;
  isGenerating: boolean;
  onClose: () => void;
  onConfirm: (data: PDFFormData) => void;
  initialMode: PdfMode;
  initialSyncTerm: SyncTerm;
  /** Pronto pago — controlado desde el Cart, solo display */
  downPayment: number;
  idioma: Idioma;
  onIdiomaChange: (i: Idioma) => void;
  promoMadres: boolean;
  onPromoMadresChange: (v: boolean) => void;
  farmacias: FarmaciasPromo;
  onFarmaciasChange: (v: FarmaciasPromo) => void;
}

// ── Tema Anker dark ───────────────────────────────────────────────────────
const ANKER_BLUE        = '#00AEEF';
const ANKER_BLUE_DARK   = '#0086B8';
const DARK_BG           = '#0A1628';          // fondo principal modal
const DARK_PANEL        = '#0F1F38';          // paneles internos / inputs
const DARK_PANEL_HOVER  = '#162B4D';
const LINE_WHITE        = 'rgba(255,255,255,0.85)';
const LINE_SUBTLE       = 'rgba(255,255,255,0.12)';
const TEXT_PRIMARY      = '#FFFFFF';
const TEXT_MUTED        = 'rgba(255,255,255,0.65)';
const INPUT_BORDER      = 'rgba(255,255,255,0.15)';

// Helper para inputs uniformes (tema dark)
function Field({
  label, value, onChange, type = 'text', colSpan = 1, placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  colSpan?: 1 | 2;
  placeholder?: string;
}) {
  return (
    <div style={{ gridColumn: colSpan === 2 ? 'span 2' : 'span 1' }}>
      <label style={{ display: 'block', fontSize: 11, color: TEXT_MUTED, marginBottom: 4, fontWeight: 600, letterSpacing: 0.3 }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%', border: `1px solid ${INPUT_BORDER}`, borderRadius: 8,
          padding: '8px 10px', fontSize: 13, outline: 'none', boxSizing: 'border-box',
          background: DARK_PANEL, color: TEXT_PRIMARY,
        }}
      />
    </div>
  );
}

const MODES: { key: PdfMode; emoji: string; labelES: string; labelEN: string }[] = [
  { key: 'cash',      emoji: '💵', labelES: 'Cash',       labelEN: 'Cash' },
  { key: 'homedepot', emoji: '🏠', labelES: 'Home Depot', labelEN: 'Home Depot' },
  { key: 'sync',      emoji: '🏦', labelES: 'Synchrony',  labelEN: 'Synchrony' },
  { key: 'kiwi',      emoji: '🥝', labelES: 'Kiwi',       labelEN: 'Kiwi' },
];

const SYNC_TERMS: SyncTerm[] = ['12', '24', '48'];

export function PDFModal({
  isOpen, isGenerating, onClose, onConfirm,
  initialMode, initialSyncTerm, downPayment,
  idioma, onIdiomaChange,
  promoMadres, onPromoMadresChange,
  farmacias, onFarmaciasChange,
}: PDFModalProps) {

  const [cliente, setCliente] = useState<ClienteForm>({ nombre: '', correo: '', telefono: '', direccion: '' });
  const [consultor, setConsultor] = useState<ConsultorForm>({ nombre: '', correo: '', telefono: '', agenteTelefonico: '' });
  const [pdfModes, setPdfModes] = useState<PdfMode[]>([initialMode]);
  const [pdfSyncTerms, setPdfSyncTerms] = useState<SyncTerm[]>([initialSyncTerm]);
  const [promosOpen, setPromosOpen] = useState(true);
  const [madresCardOpen, setMadresCardOpen] = useState(false);
  const [farmaCardOpen, setFarmaCardOpen] = useState(true);
  const [error, setError] = useState('');

  const showSyncTerms = pdfModes.includes('sync');
  const madresAnnounce = isMadresAnnounceActive();
  const madresApply    = isMadresSaleActive();

  const toggleMode = (m: PdfMode) => {
    setPdfModes(prev => {
      const has = prev.includes(m);
      if (has && prev.length === 1) return prev; // mínimo 1
      return has ? prev.filter(x => x !== m) : [...prev, m];
    });
  };

  const toggleSyncTerm = (t: SyncTerm) => {
    setPdfSyncTerms(prev =>
      prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]
    );
  };

  const handleConfirm = () => {
    if (!cliente.nombre.trim() || !consultor.nombre.trim()) {
      setError(idioma === 'en'
        ? 'Customer name and consultant name are required.'
        : 'Nombre del cliente y consultor son requeridos.');
      return;
    }
    if (!consultor.agenteTelefonico.trim()) {
      setError(idioma === 'en'
        ? 'Lead Owner (call-center agent) is required.'
        : 'Agente Telefónico (Lead Owner) es obligatorio.');
      return;
    }
    if (pdfModes.length === 0) {
      setError(idioma === 'en'
        ? 'Select at least one payment mode.'
        : 'Selecciona al menos un modo de pago.');
      return;
    }
    if (pdfModes.includes('sync') && pdfSyncTerms.length === 0) {
      setError(idioma === 'en'
        ? 'Select at least one Synchrony term.'
        : 'Selecciona al menos un plazo Synchrony.');
      return;
    }
    if (farmacias.activa && !farmacias.nombre.trim()) {
      setError(idioma === 'en'
        ? 'Enter the pharmacy name before generating the PDF.'
        : 'Ingresa el nombre de la farmacia antes de generar el PDF.');
      return;
    }
    setError('');
    onConfirm({
      cliente, consultor, pdfModes, pdfSyncTerms,
      idioma,
      promoMadres: promoMadres && madresApply,
      farmacias,
    });
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 50, padding: 16,
    }}>
      <div style={{
        background: DARK_BG, borderRadius: 16, width: '100%', maxWidth: 640,
        maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,174,239,0.2)',
        color: TEXT_PRIMARY,
      }}>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px', borderBottom: `1px solid ${LINE_SUBTLE}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <FileText size={22} color={ANKER_BLUE} />
            <span style={{ fontSize: 17, fontWeight: 700, color: TEXT_PRIMARY }}>
              {idioma === 'en' ? 'Anker Quote' : 'Cotización Anker'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ display: 'flex', borderRadius: 20, overflow: 'hidden', border: `1.5px solid ${ANKER_BLUE}` }}>
              {(['es', 'en'] as const).map(lang => (
                <button key={lang} onClick={() => onIdiomaChange(lang)} style={{
                  padding: '4px 12px', fontSize: 11, fontWeight: 700,
                  cursor: 'pointer', border: 'none',
                  background: idioma === lang ? ANKER_BLUE : 'transparent',
                  color:      idioma === lang ? 'white'    : ANKER_BLUE,
                  transition: 'all 0.15s',
                }}>
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>
            <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
              <X size={22} color={TEXT_MUTED} />
            </button>
          </div>
        </div>

        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* CLIENTE */}
          <section>
            <div style={{
              fontSize: 13, fontWeight: 700, color: ANKER_BLUE,
              borderBottom: `2px solid ${LINE_WHITE}`, paddingBottom: 4, marginBottom: 12,
            }}>
              {idioma === 'en' ? 'Customer Information' : 'Datos del Cliente'}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <Field
                label={idioma === 'en' ? 'Full name *' : 'Nombre completo *'}
                value={cliente.nombre}
                onChange={v => setCliente({ ...cliente, nombre: v })}
                colSpan={2}
              />
              <Field
                label={idioma === 'en' ? 'Address' : 'Dirección'}
                value={cliente.direccion}
                onChange={v => setCliente({ ...cliente, direccion: v })}
                colSpan={2}
              />
              <Field
                label={idioma === 'en' ? 'Phone' : 'Teléfono'}
                value={cliente.telefono}
                onChange={v => setCliente({ ...cliente, telefono: v })}
              />
              <Field
                label="Email"
                value={cliente.correo}
                onChange={v => setCliente({ ...cliente, correo: v })}
                type="email"
              />
            </div>
          </section>

          {/* CONSULTOR */}
          <section>
            <div style={{
              fontSize: 13, fontWeight: 700, color: ANKER_BLUE,
              borderBottom: `2px solid ${LINE_WHITE}`, paddingBottom: 4, marginBottom: 12,
            }}>
              {idioma === 'en' ? 'Consultant Information' : 'Datos del Consultor'}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <Field
                label={idioma === 'en' ? 'Consultant name *' : 'Nombre del Consultor *'}
                value={consultor.nombre}
                onChange={v => setConsultor({ ...consultor, nombre: v })}
                colSpan={2}
              />
              <Field
                label="Email"
                value={consultor.correo}
                onChange={v => setConsultor({ ...consultor, correo: v })}
                type="email"
              />
              <Field
                label={idioma === 'en' ? 'Phone' : 'Teléfono'}
                value={consultor.telefono}
                onChange={v => setConsultor({ ...consultor, telefono: v })}
              />
              <Field
                label={idioma === 'en' ? 'Lead Owner (call-center agent) *' : 'Agente Telefónico (Lead Owner) *'}
                value={consultor.agenteTelefonico}
                onChange={v => setConsultor({ ...consultor, agenteTelefonico: v })}
                colSpan={2}
              />
            </div>
          </section>

          {/* MODOS DE PAGO — selectores con color Anker */}
          <section>
            <div style={{
              fontSize: 13, fontWeight: 700, color: ANKER_BLUE,
              borderBottom: `2px solid ${LINE_WHITE}`, paddingBottom: 4, marginBottom: 12,
            }}>
              {idioma === 'en' ? 'Payment Modes (multi-select)' : 'Modos de Pago (selección múltiple)'}
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {MODES.map(m => {
                const active = pdfModes.includes(m.key);
                return (
                  <button
                    key={m.key}
                    onClick={() => toggleMode(m.key)}
                    style={{
                      padding: '8px 16px', borderRadius: 20, fontSize: 12.5, cursor: 'pointer',
                      border: `2px solid ${active ? ANKER_BLUE : INPUT_BORDER}`,
                      background: active ? ANKER_BLUE : DARK_PANEL,
                      color: active ? 'white' : TEXT_PRIMARY,
                      fontWeight: active ? 700 : 500,
                      transition: 'all 0.15s',
                    }}
                  >
                    {m.emoji} {idioma === 'en' ? m.labelEN : m.labelES}
                  </button>
                );
              })}
            </div>

            {showSyncTerms && (
              <div style={{
                marginTop: 14,
                padding: 12,
                background: 'rgba(139,92,246,0.12)',
                border: '1.5px solid #8b5cf6',
                borderRadius: 10,
              }}>
                <div style={{
                  fontSize: 12, color: '#c4b5fd', marginBottom: 8, fontWeight: 800,
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  🏦 {idioma === 'en' ? 'Synchrony — select term(s)' : 'Synchrony — selecciona plazo(s)'}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {SYNC_TERMS.map(t => {
                    const active = pdfSyncTerms.includes(t);
                    return (
                      <button
                        key={t}
                        onClick={() => toggleSyncTerm(t)}
                        style={{
                          flex: 1,
                          padding: '10px 14px', borderRadius: 8, fontSize: 13, cursor: 'pointer',
                          border: `2px solid ${active ? '#8b5cf6' : INPUT_BORDER}`,
                          background: active ? '#8b5cf6' : DARK_PANEL,
                          color: active ? 'white' : TEXT_PRIMARY,
                          fontWeight: active ? 700 : 500,
                        }}
                      >
                        {t} {idioma === 'en' ? 'months' : 'meses'}
                      </button>
                    );
                  })}
                </div>
                {pdfSyncTerms.length === 0 && (
                  <p style={{ fontSize: 11, color: '#e74c3c', marginTop: 6, marginBottom: 0 }}>
                    {idioma === 'en' ? 'Pick at least one Synchrony term.' : 'Selecciona al menos un plazo Synchrony.'}
                  </p>
                )}
              </div>
            )}
          </section>

          {/* PROMOCIONES DISPONIBLES — accordion contenedor (siempre visible) */}
          <section style={{ border: `1.5px solid ${INPUT_BORDER}`, borderRadius: 12, overflow: 'hidden' }}>
            <button
              type="button"
              onClick={() => setPromosOpen(o => !o)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 16px', cursor: 'pointer',
                background: 'linear-gradient(90deg, rgba(232,79,151,0.10) 0%, rgba(15,157,88,0.08) 100%)',
                border: 'none', borderBottom: promosOpen ? `1.5px solid ${INPUT_BORDER}` : 'none',
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 800, color: TEXT_PRIMARY, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span aria-hidden>🎁</span>
                <span>{idioma === 'en' ? 'Available promotions' : 'Promociones disponibles'}</span>
              </span>
              <span style={{ fontSize: 11, color: TEXT_MUTED, display: 'flex', alignItems: 'center', gap: 4 }}>
                {promoMadres && madresApply && (
                  <span style={{
                    background: '#1D429B', color: 'white',
                    padding: '2px 8px', borderRadius: 10, fontWeight: 700,
                  }}>
                    🧔 {idioma === 'en' ? "Father's" : 'Padre'}
                  </span>
                )}
                {farmacias.activa && (
                  <span style={{
                    background: '#0F9D58', color: 'white',
                    padding: '2px 8px', borderRadius: 10, fontWeight: 700,
                  }}>
                    ⚕ {idioma === 'en' ? 'Pharmacy' : 'Farmacia'}
                  </span>
                )}
                <span style={{ marginLeft: 4 }}>{promosOpen ? '▴' : '▾'}</span>
              </span>
            </button>

            {promosOpen && (
              <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>

                {/* ── Día del Padre (solo cuando dentro de vigencia) ── */}
                {madresAnnounce && (
                  <div style={{
                    border: `2px solid ${promoMadres && madresApply ? '#1D429B' : 'rgba(29,66,155,0.3)'}`,
                    borderRadius: 10, overflow: 'hidden',
                    background: 'rgba(29,66,155,0.08)',
                  }}>
                    <button type="button" onClick={() => setMadresCardOpen(o => !o)}
                      style={{
                        width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '10px 12px', background: 'transparent', border: 'none', cursor: 'pointer',
                        fontSize: 12.5, fontWeight: 800, color: '#AEC2EC',
                      }}>
                      <span>🧔 {idioma === 'en' ? "Father's Day 2026 — Anker" : 'Día del Padre 2026 — Anker'} 🧔</span>
                      <span>{madresCardOpen ? '▴' : '▾'}</span>
                    </button>
                    {madresCardOpen && (
                      <div style={{ padding: '0 12px 12px' }}>
                        <p style={{ fontSize: 11, color: TEXT_MUTED, marginBottom: 10, lineHeight: 1.5 }}>
                          {idioma === 'en'
                            ? <>Valid <b style={{ color: TEXT_PRIMARY }}>June 18–25, 2026</b>. <b style={{ color: TEXT_PRIMARY }}>Anker Solix F2600</b> and its expansion battery at <b style={{ color: TEXT_PRIMARY }}>20% off</b> (already reflected in the catalog). <b style={{ color: '#AEC2EC' }}>FREE {MADRES_GIFT_NAME_EN}</b> with the purchase of the <b style={{ color: TEXT_PRIMARY }}>Anker Solix F3800 Plus</b>. In-showroom only.</>
                            : <>Vigente <b style={{ color: TEXT_PRIMARY }}>18 al 25 de junio 2026</b>. <b style={{ color: TEXT_PRIMARY }}>Anker Solix F2600</b> y su batería de expansión al <b style={{ color: TEXT_PRIMARY }}>20% off</b> (ya aplicado en el catálogo). <b style={{ color: '#AEC2EC' }}>{MADRES_GIFT_NAME_ES} GRATIS</b> con la compra de la <b style={{ color: TEXT_PRIMARY }}>Anker Solix F3800 Plus</b>. Solo en showroom.</>}
                        </p>
                        {!madresApply ? (
                          <p style={{ fontSize: 11, color: TEXT_MUTED, fontStyle: 'italic', padding: '8px 0', margin: 0 }}>
                            {idioma === 'en'
                              ? 'Activation window opens June 18, 2026.'
                              : 'La ventana de aplicación abre el 18 de junio de 2026.'}
                          </p>
                        ) : (
                          <label style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            padding: '10px 12px', borderRadius: 8,
                            cursor: farmacias.activa ? 'not-allowed' : 'pointer',
                            opacity: farmacias.activa ? 0.5 : 1,
                            background: promoMadres ? '#1D429B' : DARK_PANEL,
                            border: `2px solid ${promoMadres ? '#1D429B' : 'rgba(29,66,155,0.4)'}`,
                          }}>
                            <input
                              type="checkbox"
                              checked={promoMadres}
                              disabled={farmacias.activa}
                              onChange={e => onPromoMadresChange(e.target.checked)}
                              style={{ width: 18, height: 18, accentColor: '#1D429B' }}
                            />
                            <span style={{ fontSize: 12, fontWeight: 700, color: promoMadres ? 'white' : '#AEC2EC' }}>
                              {idioma === 'en'
                                ? <>Apply Father's Day promo (+ FREE {MADRES_GIFT_NAME_EN} with F3800 Plus)</>
                                : <>Aplicar promo Día del Padre (+ {MADRES_GIFT_NAME_ES} GRATIS con F3800 Plus)</>}
                            </span>
                          </label>
                        )}
                        {farmacias.activa && madresApply && (
                          <p style={{ fontSize: 10.5, color: TEXT_MUTED, marginTop: 6, fontStyle: 'italic' }}>
                            {idioma === 'en'
                              ? 'Disable Pharmacy promo to use this one.'
                              : 'Desactiva la promo de Farmacias para usar esta.'}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* ── Farmacias (siempre disponible) ── */}
                <div style={{
                  border: `2px solid ${farmacias.activa ? '#0F9D58' : 'rgba(15,157,88,0.35)'}`,
                  borderRadius: 10, overflow: 'hidden',
                  background: 'rgba(15,157,88,0.08)',
                }}>
                  <button type="button" onClick={() => setFarmaCardOpen(o => !o)}
                    style={{
                      width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '10px 12px', background: 'transparent', border: 'none', cursor: 'pointer',
                      fontSize: 12.5, fontWeight: 800, color: '#A7E5C4',
                    }}>
                    <span>💊 {idioma === 'en' ? 'Pharmacy Promo ⚕️' : 'Promoción Farmacias ⚕️'}</span>
                    <span>{farmaCardOpen ? '▴' : '▾'}</span>
                  </button>
                  {farmaCardOpen && (
                    <div style={{ padding: '0 12px 12px' }}>
                      <p style={{ fontSize: 11, color: TEXT_MUTED, marginBottom: 10, lineHeight: 1.5 }}>
                        {idioma === 'en'
                          ? <>🩺 Fixed <b style={{ color: '#A7E5C4' }}>10% discount</b> on the total. Eligible for licensed pharmacy professionals. In-showroom validation.</>
                          : <>🩺 Descuento fijo de <b style={{ color: '#A7E5C4' }}>10%</b> sobre el total. Aplica a profesionales licenciados de farmacia. Validación en showroom.</>}
                      </p>
                      <label style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '10px 12px', borderRadius: 8, marginBottom: farmacias.activa ? 10 : 0,
                        cursor: (promoMadres && madresApply) ? 'not-allowed' : 'pointer',
                        opacity: (promoMadres && madresApply) ? 0.5 : 1,
                        background: farmacias.activa ? '#0F9D58' : DARK_PANEL,
                        border: `2px solid ${farmacias.activa ? '#0F9D58' : 'rgba(15,157,88,0.4)'}`,
                      }}>
                        <input
                          type="checkbox"
                          checked={farmacias.activa}
                          disabled={promoMadres && madresApply}
                          onChange={e => {
                            onFarmaciasChange({ ...farmacias, activa: e.target.checked });
                            if (e.target.checked && promoMadres) onPromoMadresChange(false);
                          }}
                          style={{ width: 18, height: 18, accentColor: '#0F9D58' }}
                        />
                        <span style={{ fontSize: 12, fontWeight: 700, color: farmacias.activa ? 'white' : '#A7E5C4' }}>
                          {idioma === 'en' ? 'Apply 10% pharmacy discount' : 'Aplicar 10% descuento farmacias'}
                        </span>
                      </label>
                      {farmacias.activa && (
                        <div>
                          <label style={{ display: 'block', fontSize: 11, color: '#A7E5C4', marginBottom: 4, fontWeight: 700 }}>
                            🏥 {idioma === 'en' ? 'Pharmacy name *' : 'Nombre de la farmacia *'}
                          </label>
                          <input
                            type="text"
                            value={farmacias.nombre}
                            onChange={e => onFarmaciasChange({ ...farmacias, nombre: e.target.value })}
                            placeholder={idioma === 'en' ? 'e.g., Walgreens, CVS, Caridad...' : 'Ej: Walgreens, CVS, Caridad...'}
                            maxLength={40}
                            style={{
                              width: '100%', border: '1.5px solid rgba(15,157,88,0.4)', borderRadius: 8,
                              padding: '8px 10px', fontSize: 12, outline: 'none', boxSizing: 'border-box',
                              background: DARK_PANEL, color: TEXT_PRIMARY,
                            }}
                          />
                        </div>
                      )}
                      {promoMadres && madresApply && (
                        <p style={{ fontSize: 10.5, color: TEXT_MUTED, marginTop: 6, fontStyle: 'italic' }}>
                          {idioma === 'en'
                            ? 'Disable Father\'s Day promo to use this one.'
                            : 'Desactiva Día del Padre para usar esta promo.'}
                        </p>
                      )}
                    </div>
                  )}
                </div>

              </div>
            )}
          </section>

          {/* Pronto pago — display only (se controla desde el carrito) */}
          {downPayment > 0 && (
            <section style={{
              padding: '10px 14px', borderRadius: 10,
              background: 'rgba(248,155,36,0.10)', border: '1.5px solid #F89B24',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <span style={{ fontSize: 12.5, fontWeight: 800, color: '#F89B24' }}>
                💰 {idioma === 'en' ? 'Down Payment' : 'Pronto pago'}
                <span style={{ fontSize: 10.5, color: TEXT_MUTED, fontWeight: 500, marginLeft: 6, fontStyle: 'italic' }}>
                  ({idioma === 'en' ? 'set in cart' : 'configurado en el carrito'})
                </span>
              </span>
              <span style={{ fontSize: 14, fontWeight: 800, color: '#F89B24' }}>
                ${downPayment.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </section>
          )}

          {error && (
            <p style={{ fontSize: 12, color: '#ff6b6b', background: 'rgba(231,76,60,0.15)', padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(231,76,60,0.3)' }}>
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex', justifyContent: 'flex-end', gap: 10,
          padding: '16px 24px', borderTop: `1px solid ${LINE_SUBTLE}`,
        }}>
          <button
            onClick={onClose}
            disabled={isGenerating}
            style={{
              padding: '9px 20px', borderRadius: 8, border: `1px solid ${INPUT_BORDER}`,
              background: DARK_PANEL, color: TEXT_PRIMARY, fontSize: 13, cursor: 'pointer',
            }}
          >
            {idioma === 'en' ? 'Cancel' : 'Cancelar'}
          </button>
          <button
            onClick={handleConfirm}
            disabled={isGenerating}
            style={{
              padding: '9px 20px', borderRadius: 8, border: 'none',
              background: isGenerating ? '#7dd0f0' : ANKER_BLUE,
              color: 'white', fontSize: 13, fontWeight: 700,
              cursor: isGenerating ? 'default' : 'pointer',
              display: 'flex', alignItems: 'center', gap: 8,
              boxShadow: `0 4px 12px ${ANKER_BLUE_DARK}33`,
            }}
          >
            <Download size={16} />
            {isGenerating
              ? (idioma === 'en' ? 'Generating PDF...' : 'Generando PDF...')
              : (idioma === 'en' ? 'Download PDF' : 'Descargar PDF')}
          </button>
        </div>
      </div>
    </div>
  );
}
