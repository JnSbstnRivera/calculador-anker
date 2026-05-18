import React from 'react';
import { FileDown, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { Product } from '../constants';

export type CartMode = 'cash' | 'homedepot' | 'sync' | 'kiwi';
export type SyncTerm = '12' | '24' | '48';

export interface CartLine {
  id: string;
  qty: number;
}

/** Mapa producto-id → línea del carrito */
export type CartMap = Record<string, CartLine>;

interface CartProps {
  cart: CartMap;
  products: Product[];
  mode: CartMode;
  setMode: (m: CartMode) => void;
  syncTerm: SyncTerm;
  setSyncTerm: (t: SyncTerm) => void;
  downPayment: number;
  setDownPayment: (v: number) => void;
  onUpdateQty: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onClear: () => void;
  onPDF: () => void;
}

const fmt = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

const ACTIVE_PILL: Record<CartMode, { bg: string; text: string }> = {
  cash:      { bg: 'bg-anker-blue',     text: 'text-white' },
  homedepot: { bg: 'bg-orange-500',     text: 'text-white' },
  sync:      { bg: 'bg-[#8b5cf6]',      text: 'text-white' },
  kiwi:      { bg: 'bg-windmar-gold',   text: 'text-white' },
};

const MODES: { key: CartMode; emoji: string; label: string }[] = [
  { key: 'cash',      emoji: '💵', label: 'Cash' },
  { key: 'homedepot', emoji: '🏠', label: 'Home Depot' },
  { key: 'sync',      emoji: '🏦', label: 'Synchrony' },
  { key: 'kiwi',      emoji: '🥝', label: 'Kiwi' },
];

function getItemPrice(product: Product, mode: CartMode, syncTerm: SyncTerm): number {
  if (mode === 'cash') return product.cash;
  if (mode === 'homedepot') return product.syncPrice;
  if (mode === 'kiwi') return product.syncPrice;
  // sync — mensualidad según plazo
  if (syncTerm === '12') return product.pay12;
  if (syncTerm === '24') return product.pay24;
  return product.pay48;
}

interface ItemRowProps {
  product: Product;
  qty: number;
  mode: CartMode;
  syncTerm: SyncTerm;
  onUpdateQty: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
}

const IVU_RATE = 0.115;

const ItemRow: React.FC<ItemRowProps> = ({ product, qty, mode, syncTerm, onUpdateQty, onRemoveItem }) => {
  const price = getItemPrice(product, mode, syncTerm);
  const isMonthly = mode === 'sync';

  // IVU breakdown — solo para modos no mensuales
  const lineTotal = price * qty;
  const sinIvu = !isMonthly ? lineTotal / (1 + IVU_RATE) : 0;
  const ivuVal = !isMonthly ? lineTotal - sinIvu : 0;

  return (
    <div className="bg-white dark:bg-[#161b22] rounded-xl border border-windmar-blue-light/30 dark:border-white/10 p-3 shadow-sm">
      <div className="flex gap-3">
        <div className="w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0 bg-slate-50 dark:bg-white/95 rounded-lg flex items-center justify-center overflow-hidden p-1">
          {product.image && (
            <img
              src={product.image}
              alt={product.name}
              referrerPolicy="no-referrer"
              className="max-w-full max-h-full object-contain"
            />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[9px] uppercase tracking-wider font-bold text-slate-400">
            {product.category}
          </p>
          <p className="text-sm font-bold text-slate-900 dark:text-[#e8eaed] leading-tight truncate">
            {product.name}
          </p>

          <div className="mt-1 text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
            <span className="text-sm font-bold text-slate-900 dark:text-[#e8eaed]">
              {fmt(price)}{isMonthly && '/mes'}
            </span>
            {isMonthly && (
              <> · Financiado <b>{fmt(product.syncPrice)}</b></>
            )}
            {mode === 'kiwi' && (
              <> · <span className="italic">sin cuotas</span></>
            )}
            {qty > 1 && (
              <> · Subt. <b>{fmt(lineTotal)}{isMonthly && '/mes'}</b></>
            )}
          </div>

          {/* Breakdown IVU — Home Depot y Kiwi únicamente.
              Cash NO muestra IVU (requerimiento de Anker — solo precio total). */}
          {!isMonthly && mode !== 'cash' && (
            <div className="mt-1 flex flex-wrap gap-x-2 gap-y-0.5 text-[10px] text-slate-500 dark:text-slate-400 leading-snug">
              <span>Sin IVU: <b className="text-slate-700 dark:text-slate-200">{fmt(sinIvu)}</b></span>
              <span>IVU 11.5%: <b className="text-slate-700 dark:text-slate-200">{fmt(ivuVal)}</b></span>
            </div>
          )}

          <div className="flex items-center gap-1.5 mt-2">
            <button
              onClick={() => onUpdateQty(product.id, -1)}
              className="w-6 h-6 rounded-md bg-slate-100 dark:bg-white/10 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-sm font-bold leading-none"
            >−</button>
            <span className="text-xs font-bold w-5 text-center text-slate-900 dark:text-[#e8eaed]">
              {qty}
            </span>
            <button
              onClick={() => onUpdateQty(product.id, 1)}
              className="w-6 h-6 rounded-md bg-slate-100 dark:bg-white/10 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-sm font-bold leading-none"
            >+</button>
            <button
              onClick={() => onRemoveItem(product.id)}
              className="ml-auto w-6 h-6 rounded-md bg-red-50 dark:bg-red-900/30 hover:bg-red-100 text-red-600 flex items-center justify-center"
              title="Eliminar"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export function Cart({
  cart, products, mode, setMode, syncTerm, setSyncTerm,
  downPayment, setDownPayment,
  onUpdateQty, onRemoveItem, onClear, onPDF,
}: CartProps) {

  const lines = Object.values(cart);
  const productsById = new Map(products.map(p => [p.id, p]));

  const subtotal = lines.reduce((sum, line) => {
    const p = productsById.get(line.id);
    if (!p) return sum;
    return sum + getItemPrice(p, mode, syncTerm) * line.qty;
  }, 0);

  const isMonthly = mode === 'sync';

  if (lines.length === 0) {
    return (
      <div className="bg-white dark:bg-[#161b22] rounded-2xl p-6 text-center border-2 border-dashed border-anker-blue/40 dark:border-white/10">
        <p className="text-base font-bold text-slate-600 dark:text-slate-300">El carrito está vacío</p>
        <p className="text-xs text-slate-400 mt-1">Agrega productos del catálogo</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#161b22] rounded-2xl overflow-hidden shadow-xl border border-windmar-blue-light/30 dark:border-white/10">
      {/* Header siempre con azul anker */}
      <div className="bg-anker-blue px-4 sm:px-5 py-3 sm:py-4 flex items-center justify-between">
        <h2 className="text-white font-black text-base sm:text-lg tracking-wide">
          Carrito ({lines.length})
        </h2>
        <button
          onClick={onClear}
          className="text-white/80 hover:text-white text-xs sm:text-sm font-medium transition-colors"
        >
          Limpiar
        </button>
      </div>

      {/* Mode selector */}
      <div className="px-4 sm:px-5 pt-3 sm:pt-4 pb-2">
        <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-2">
          Modo de pago
        </p>
        <div className="grid grid-cols-2 gap-1.5">
          {MODES.map(m => {
            const active = mode === m.key;
            const pill = ACTIVE_PILL[m.key];
            return (
              <button
                key={m.key}
                onClick={() => setMode(m.key)}
                className={`py-2 rounded-lg text-[11px] font-bold transition-all ${
                  active
                    ? `${pill.bg} ${pill.text} shadow-md`
                    : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {m.emoji} {m.label}
              </button>
            );
          })}
        </div>

        {/* Sync term selector */}
        <AnimatePresence>
          {isMonthly && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 overflow-hidden"
            >
              <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-1.5">
                Plazo Synchrony
              </p>
              <div className="grid grid-cols-3 gap-1.5">
                {(['12', '24', '48'] as const).map(n => (
                  <button
                    key={n}
                    onClick={() => setSyncTerm(n)}
                    className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                      syncTerm === n
                        ? 'bg-[#8b5cf6] text-white shadow-md'
                        : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {n} meses
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Items */}
      <div className="px-4 sm:px-5 py-3 space-y-2.5 max-h-[55vh] overflow-y-auto custom-scrollbar">
        {lines.map(line => {
          const product = productsById.get(line.id);
          if (!product) return null;
          return (
            <ItemRow
              key={line.id}
              product={product}
              qty={line.qty}
              mode={mode}
              syncTerm={syncTerm}
              onUpdateQty={onUpdateQty}
              onRemoveItem={onRemoveItem}
            />
          );
        })}
      </div>

      {/* Resumen de compra */}
      <div className="px-4 sm:px-5 py-3 bg-slate-50 dark:bg-white/5 border-t border-windmar-blue-light/30 dark:border-white/10 space-y-2.5">
        <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">
          Resumen de compra
        </p>

        <div className="flex justify-between items-baseline">
          <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
            {isMonthly ? `Subtotal mensual (${syncTerm}m)` : 'Subtotal'}
          </span>
          <span className="text-base font-black font-mono text-slate-900 dark:text-[#e8eaed]">
            {fmt(subtotal)}{isMonthly && <span className="text-xs">/mes</span>}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="downPayment" className="text-xs font-bold text-slate-600 dark:text-slate-400 whitespace-nowrap">
            💰 Pronto pago:
          </label>
          <div className="relative flex-1">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">$</span>
            <input
              id="downPayment"
              type="number"
              min={0}
              value={downPayment || ''}
              onChange={e => setDownPayment(Number(e.target.value) || 0)}
              placeholder="0"
              className="w-full bg-white dark:bg-[#0f1215] border border-anker-blue/30 dark:border-white/10 rounded-lg pl-6 pr-7 py-1.5 text-xs font-bold text-slate-900 dark:text-[#e8eaed] outline-none focus:border-anker-blue focus:ring-1 focus:ring-anker-blue/30"
            />
            {downPayment > 0 && (
              <button
                type="button"
                onClick={() => setDownPayment(0)}
                className="absolute right-1 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-slate-200 dark:bg-white/10 hover:bg-red-100 dark:hover:bg-red-900/40 text-slate-500 hover:text-red-600 flex items-center justify-center text-[10px] font-bold transition-colors"
                title="Limpiar pronto pago"
                aria-label="Limpiar pronto pago"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {downPayment > 0 && (
          <div className="flex justify-between items-baseline pt-2 border-t border-windmar-blue-light/30 dark:border-white/10">
            <span className="text-xs uppercase tracking-widest font-bold text-anker-blue">
              {isMonthly ? `Mensual con pronto (${syncTerm}m)` : 'Total con pronto'}
            </span>
            <span className="text-lg font-black font-mono text-windmar-blue-dark dark:text-white">
              {fmt(Math.max(0, subtotal - (isMonthly ? downPayment / Number(syncTerm) : downPayment)))}
              {isMonthly && <span className="text-xs">/mes</span>}
            </span>
          </div>
        )}

        <p className="text-[10px] text-slate-400 italic">
          Promociones se aplican al generar el PDF.
        </p>
      </div>

      {/* PDF button */}
      <div className="px-4 sm:px-5 py-4">
        <button
          onClick={onPDF}
          className="w-full bg-anker-blue hover:bg-anker-blue-dark active:scale-[0.98] text-white font-bold py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-anker-blue/25"
        >
          <FileDown className="w-4 h-4" />
          Generar Cotización PDF
        </button>
      </div>
    </div>
  );
}
