import React, { useState, useEffect, useMemo } from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PRODUCTS } from './constants';
import { usePDFCotizacion } from './hooks/usePDFCotizacion';
import { trackUsage } from './lib/trackUsage';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ProductCard } from './components/ProductCard';
import { Cart, CartMap, CartMode, SyncTerm } from './components/Cart';
import { PDFModal, PDFFormData, Idioma, FarmaciasPromo } from './components/PDFModal';

const CATEGORIES = [
  'Todos',
  'Anker Battery',
  'Expansion',
  'Solar Panels',
  'Transfer Switches',
  'Coolers',
  'Accessories',
] as const;
type Category = typeof CATEGORIES[number];

export default function App() {
  // ─── State principal ───────────────────────────────────────────────────────
  const [cart, setCart] = useState<CartMap>({});
  const [mode, setMode] = useState<CartMode>('cash');
  const [syncTerm, setSyncTerm] = useState<SyncTerm>('12');
  const [downPayment, setDownPayment] = useState<number>(0);
  const [filterCat, setFilterCat] = useState<Category>('Todos');
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [idiomaPDF, setIdiomaPDF] = useState<Idioma>('es');
  const [promoMadres, setPromoMadres] = useState(false);
  const [farmacias, setFarmacias] = useState<FarmaciasPromo>({ activa: false, nombre: '' });

  const [isSplashVisible, setIsSplashVisible] = useState(true);
  const [toast, setToast] = useState<{ msg: string; isError?: boolean } | null>(null);

  // Dark mode (patrón wh-theme)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try { return localStorage.getItem('wh-theme') === 'dark'; }
    catch { return false; }
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      try { localStorage.setItem('wh-theme', 'dark'); } catch { /* ignore */ }
    } else {
      root.classList.remove('dark');
      try { localStorage.setItem('wh-theme', 'light'); } catch { /* ignore */ }
    }
  }, [isDarkMode]);

  // Splash timeout — máx 3.5s
  useEffect(() => {
    const t = setTimeout(() => setIsSplashVisible(false), 3200);
    return () => clearTimeout(t);
  }, []);

  // Persistencia del carrito (solo carrito — Pronto pago siempre arranca en 0)
  useEffect(() => {
    const saved = localStorage.getItem('anker_cart_v5');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCart(parsed.cart || {});
        // NO restauramos downPayment — el pronto pago debe ser una decisión consciente
        // de cada sesión, no algo que aparezca automático.
      } catch (e) {
        console.error('Failed to load cart', e);
      }
    }
    // Limpieza retroactiva: si quedó algún downPayment fantasma en storage antiguo,
    // lo borramos al guardar de nuevo solo con cart.
    localStorage.removeItem('anker_cart_v5');
  }, []);

  useEffect(() => {
    // Solo persistimos el carrito. Nunca downPayment.
    localStorage.setItem('anker_cart_v5', JSON.stringify({ cart }));
  }, [cart]);

  // ─── Toast ────────────────────────────────────────────────────────────────
  const showToast = (msg: string, isError = false) => {
    setToast({ msg, isError });
    setTimeout(() => setToast(null), 2200);
  };

  // ─── Reglas de compatibilidad (preservadas) + addToCart ───────────────────
  const addToCart = (id: string) => {
    const incompatibleWith3800 = ['PANEL_200W', 'PANEL_200W_50'];

    if (id === 'ANKER_SOLIX_3800') {
      const hasIncompatible = incompatibleWith3800.some(itemId => cart[itemId]);
      if (hasIncompatible) {
        showToast('No compatible con equipos seleccionados', true);
        return;
      }
    }
    if (incompatibleWith3800.includes(id)) {
      if (cart['ANKER_SOLIX_3800']) {
        showToast('No compatible con Anker Solix 3800', true);
        return;
      }
    }

    const autoTransferSwitches = ['TRANSFER_SWITH_AUTOMATICO', 'TRANSFER_SWITH_AUTOMATICO_APTO'];
    const incompatibleWithAutoTransfer = ['ANKER_SOLIX_F2600', 'EXPANSION_BATTERY_BP2600'];

    if (autoTransferSwitches.includes(id)) {
      if (incompatibleWithAutoTransfer.some(itemId => cart[itemId])) {
        showToast('No compatible con equipos seleccionados', true);
        return;
      }
    }
    if (incompatibleWithAutoTransfer.includes(id)) {
      if (autoTransferSwitches.some(itemId => cart[itemId])) {
        showToast('No compatible con Transfer Switch Automático', true);
        return;
      }
    }

    setCart(prev => ({
      ...prev,
      [id]: { id, qty: (prev[id]?.qty || 0) + 1 },
    }));
    const prod = PRODUCTS.find(p => p.id === id);
    showToast(`${prod?.name ?? 'Producto'} agregado ✓`);
  };

  const updateQty = (id: string, delta: number) => {
    setCart(prev => {
      const current = prev[id];
      if (!current) return prev;
      const nextQty = Math.max(1, current.qty + delta);
      return { ...prev, [id]: { ...current, qty: nextQty } };
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    showToast('Producto eliminado');
  };

  const resetCart = () => {
    setCart({});
    setDownPayment(0);
    showToast('Cotización vaciada');
  };

  // ─── Filtro de productos por categoría ────────────────────────────────────
  const filteredProducts = useMemo(
    () => filterCat === 'Todos' ? PRODUCTS : PRODUCTS.filter(p => p.category === filterCat),
    [filterCat],
  );

  // ─── PDF ──────────────────────────────────────────────────────────────────
  const { downloadPDF, isGenerating } = usePDFCotizacion();

  const handlePDFConfirm = async (data: PDFFormData) => {
    interface PdfCartItem {
      id: string;
      name: string;
      qty: number;
      cashPrice: number;
      syncPrice: number;
      syncPay12: number;
      syncPay24: number;
      syncPay48: number;
      image?: string;
    }
    const lines = Object.keys(cart).map(k => cart[k]);
    const cartItems: PdfCartItem[] = lines.flatMap(line => {
      const p = PRODUCTS.find(x => x.id === line.id);
      if (!p) return [];
      return [{
        id: p.id,
        name: p.name,
        qty: line.qty,
        cashPrice: p.cash,
        syncPrice: p.syncPrice,
        syncPay12: p.pay12,
        syncPay24: p.pay24,
        syncPay48: p.pay48,
        image: p.image,
      }];
    });

    try {
      await downloadPDF({
        cartItems,
        pdfModes: data.pdfModes,
        pdfSyncTerms: data.pdfSyncTerms,
        downPayment,
        consultor: data.consultor,
        cliente: data.cliente,
        idioma: data.idioma,
        promoMadres: data.promoMadres,
        farmacias: data.farmacias,
      });
      trackUsage({
        app: 'anker',
        consultor: (data.consultor as any)?.nombre,
        agente_telefonico: (data.consultor as any)?.agenteTelefonico,
        cliente_nombre: (data.cliente as any)?.nombre,
        correo_cliente: (data.cliente as any)?.correo ?? (data.cliente as any)?.email,
        telefono_cliente: (data.cliente as any)?.telefono,
        monto_cotizado: cartItems.reduce((s, i) => s + (i.cashPrice || 0) * (i.qty || 0), 0),
        idioma: data.idioma,
        detalle: {
          items: cartItems.map(i => ({ id: i.id, qty: i.qty })),
          promoPadre: data.promoMadres,
          farmacia: (data.farmacias as any)?.activa,
        },
      });
      setShowPDFModal(false);
      showToast('PDF descargado ✓');
    } catch (e) {
      console.error(e);
      showToast('Error al generar PDF', true);
    }
  };

  return (
    <>
      {/* SPLASH — fuera del content wrapper para que el fixed cubra el viewport completo */}
      <AnimatePresence>
        {isSplashVisible && (
          <motion.div
            key="splash"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100vh' }}
            className="z-[9999] bg-slate-950 flex flex-col items-center justify-center overflow-hidden"
          >
              <div className="absolute inset-0">
                {/* Halos de color difuso */}
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-anker-blue rounded-full blur-[150px]"
                />
                <motion.div
                  animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.2, 0.1] }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-windmar-gold rounded-full blur-[120px]"
                />

                {/* Chispas eléctricas radiales (40 partículas) */}
                {[...Array(40)].map((_, i) => {
                  const angle = (i / 40) * Math.PI * 2;
                  const distance = 400 + Math.random() * 300;
                  const startOffset = 40 + Math.random() * 40;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{
                        opacity: [0, 1, 0],
                        scale: [0.5, 1.2, 0.5],
                        x: [Math.cos(angle) * startOffset, Math.cos(angle) * distance],
                        y: [Math.sin(angle) * startOffset, Math.sin(angle) * distance],
                      }}
                      transition={{
                        duration: 0.6 + Math.random() * 0.4,
                        repeat: Infinity,
                        delay: Math.random() * 2,
                        ease: 'easeOut',
                      }}
                      className="absolute top-1/2 left-1/2 w-0.5 h-4 bg-anker-blue rounded-full blur-[1px] shadow-[0_0_15px_#00AEEF]"
                      style={{ rotate: `${(angle * 180) / Math.PI + 90}deg` }}
                    />
                  );
                })}

                {/* Anillos eléctricos rotando */}
                <motion.div
                  animate={{ rotate: 360, scale: [1, 1.2, 1], opacity: [0.3, 0.7, 0.3] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] border-2 border-dashed border-anker-blue rounded-full blur-[2px] opacity-40"
                />
                <motion.div
                  animate={{ rotate: -360, scale: [1, 1.15, 1], opacity: [0.2, 0.5, 0.2] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] border border-dashed border-windmar-gold rounded-full blur-[1px] opacity-30"
                />
              </div>

              <div className="relative z-10 flex flex-col items-center gap-8">
                <motion.div
                  initial={{ y: -100, scale: 0.5, opacity: 0 }}
                  animate={{ y: 0, scale: 1, opacity: 1 }}
                  transition={{ duration: 1, type: 'spring' }}
                  className="flex flex-col items-center gap-4"
                >
                  <img
                    src="https://i.postimg.cc/44pJ0vXw/logo.png"
                    alt="Windmar Home"
                    className="w-40 md:w-56 object-contain drop-shadow-2xl"
                    referrerPolicy="no-referrer"
                  />
                  <img
                    src="https://cdn.freelogovectors.net/wp-content/uploads/2018/06/anker-logo.png"
                    alt="Anker"
                    className="w-32 md:w-44 object-contain drop-shadow-2xl bg-white/95 rounded-2xl px-4 py-2"
                    referrerPolicy="no-referrer"
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="text-center"
                >
                  <div className="text-[10px] font-black text-anker-blue uppercase tracking-[0.4em] mb-2">
                    Cargando Cotizador
                  </div>
                  <div className="text-2xl md:text-3xl font-black text-white uppercase tracking-widest">
                    Anker Pro
                  </div>
                </motion.div>
              </div>
          </motion.div>
        )}
      </AnimatePresence>

    <div className="min-h-screen p-3 sm:p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* HEADER */}
        <Header isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />

        {/* LAYOUT PRINCIPAL: grid productos + carrito */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-6 items-start">
          <main className="space-y-4">
            {/* Filtros de categoría */}
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilterCat(cat)}
                  className={`px-3 py-1.5 rounded-full border text-xs font-bold transition-all ${
                    filterCat === cat
                      ? 'bg-anker-blue text-white border-anker-blue shadow-md shadow-anker-blue/25'
                      : 'bg-white dark:bg-[#161b22] border-windmar-blue-light/40 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:border-anker-blue/40 hover:text-anker-blue'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="text-xs text-slate-400">
              {filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''}
            </div>

            {/* Grid de productos */}
            <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
              {filteredProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAdd={addToCart}
                />
              ))}
            </div>
          </main>

          {/* CART sidebar */}
          <aside className="lg:sticky lg:top-4">
            <Cart
              cart={cart}
              products={PRODUCTS}
              mode={mode}
              setMode={setMode}
              syncTerm={syncTerm}
              setSyncTerm={setSyncTerm}
              downPayment={downPayment}
              setDownPayment={setDownPayment}
              onUpdateQty={updateQty}
              onRemoveItem={removeFromCart}
              onClear={resetCart}
              onPDF={() => setShowPDFModal(true)}
            />
          </aside>
        </div>

        <Footer />
      </div>

      {/* MODAL PDF */}
      <PDFModal
        isOpen={showPDFModal}
        isGenerating={isGenerating}
        onClose={() => setShowPDFModal(false)}
        onConfirm={handlePDFConfirm}
        initialMode={mode}
        initialSyncTerm={syncTerm}
        downPayment={downPayment}
        idioma={idiomaPDF}
        onIdiomaChange={setIdiomaPDF}
        promoMadres={promoMadres}
        onPromoMadresChange={setPromoMadres}
        farmacias={farmacias}
        onFarmaciasChange={setFarmacias}
      />

      {/* TOAST */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 30, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 30, x: '-50%' }}
            className="fixed bottom-7 left-1/2 z-[500] bg-slate-800 text-white px-5 py-2.5 rounded-full text-[13px] font-semibold flex items-center gap-2 shadow-2xl"
          >
            {toast.isError ? <AlertCircle className="w-4 h-4 text-red-500" /> : <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </>
  );
}
