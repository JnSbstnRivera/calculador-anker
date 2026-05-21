import { Document, Page, View, Text, Image, StyleSheet, Svg, Path } from '@react-pdf/renderer';
import React from 'react';

export type PdfMode = 'cash' | 'homedepot' | 'sync' | 'kiwi';
export type Idioma = 'es' | 'en';

export interface CotizacionPDFProps {
  cartItems: Array<{
    id: string;
    name: string;
    qty: number;
    cashPrice: number;
    syncPrice: number;
    syncPay12: number;
    syncPay24: number;
    syncPay48: number;
    image?: string;
  }>;
  pdfModes: PdfMode[];
  pdfSyncTerms: ('12' | '24' | '48')[];
  downPayment: number;
  consultor: { nombre: string; correo: string; telefono: string; };
  cliente: { nombre: string; correo: string; telefono: string; direccion: string; };
  idioma?: Idioma;
  promoMadres?: boolean;
  farmacias?: { activa: boolean; nombre: string };
}

// Colores Anker (logos / accents)
const ANKER_BLUE = '#00AEEF';
// Colores por modo en el PDF (per request del usuario)
const CASH_GREEN   = '#10B981';  // Cash → verde
const HD_GRAY      = '#6B7280';  // Home Depot → gris
const SYNC_PURPLE  = '#A78BFA';  // Synchrony → morado claro
const KIWI_AMBER   = '#F89B24';  // Kiwi → ámbar
// Aliases anteriores para compatibilidad (todavía usados por algunos estilos)
const BLUE       = ANKER_BLUE;
const ORANGE     = HD_GRAY;
const GREEN      = SYNC_PURPLE;
const KIWI       = KIWI_AMBER;
const BG         = '#0A1628';
const ROW_ODD    = '#0D1F38';
const ROW_EVEN   = '#0A1628';
const TEXT_MAIN  = '#FFFFFF';
const TEXT_SEC   = '#A0AEC0';

const MODE_META: Record<PdfMode, { label: string; color: string }> = {
  cash:      { label: 'CASH',       color: CASH_GREEN  },
  homedepot: { label: 'HOME DEPOT', color: HD_GRAY     },
  sync:      { label: 'SYNCHRONY',  color: SYNC_PURPLE },
  kiwi:      { label: 'KIWI',       color: KIWI_AMBER  },
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: BG,
    padding: 28,
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: TEXT_MAIN,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  logo: { height: 66, objectFit: 'contain' },
  ankerTitle: {
    color: BLUE,
    fontSize: 26,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 4,
  },
  divider: { height: 2, backgroundColor: BLUE, marginBottom: 8 },
  cotizacionTitle: {
    color: TEXT_MAIN,
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    marginBottom: 3,
  },
  cotizacionSubtitle: {
    color: TEXT_SEC,
    fontSize: 8,
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  dataBlock: {
    flexDirection: 'row',
    backgroundColor: ROW_ODD,
    borderRadius: 4,
    padding: 10,
    marginBottom: 12,
    gap: 10,
  },
  dataCol: { flex: 1 },
  dataColHeader: {
    color: BLUE,
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 1,
    marginBottom: 5,
  },
  dataRow: { flexDirection: 'row', marginBottom: 3, alignItems: 'flex-start' },
  dataLabel: { color: TEXT_SEC, fontSize: 7, width: 62, flexShrink: 0 },
  dataValue: { color: TEXT_MAIN, fontSize: 8, fontFamily: 'Helvetica-Bold', flex: 1 },
  tableHeader: {
    flexDirection: 'row',
    paddingHorizontal: 6,
    paddingVertical: 5,
    borderRadius: 3,
    marginBottom: 1,
    backgroundColor: BLUE,
  },
  tableHeaderCell: { color: TEXT_MAIN, fontSize: 8, fontFamily: 'Helvetica-Bold' },
  tableRow: { flexDirection: 'row', paddingHorizontal: 6, paddingVertical: 5, alignItems: 'center' },
  tableCell: { color: TEXT_MAIN, fontSize: 7.5 },
  // Producto con imagen inline (al lado del nombre)
  productCellWrap: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  productImgBox: {
    width: 32, height: 32, borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.95)', padding: 2,
    alignItems: 'center', justifyContent: 'center',
  },
  productImg: { width: '100%', height: '100%', objectFit: 'contain' },
  productTxt: { color: TEXT_MAIN, fontSize: 7.5, flex: 1, fontFamily: 'Helvetica-Bold' },

  // ─── Card por producto (nuevo layout) ───────────────────────────────────
  pCard: {
    marginBottom: 8,
    backgroundColor: ROW_ODD,
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.08)',
  },
  pCardHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 10, paddingVertical: 7,
    backgroundColor: ROW_EVEN,
    borderBottomWidth: 0.5, borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  pCardImgBox: {
    width: 50, height: 50, borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.95)',
    padding: 3,
    alignItems: 'center', justifyContent: 'center',
  },
  pCardImg: { width: '100%', height: '100%', objectFit: 'contain' },
  pCardName: { color: TEXT_MAIN, fontSize: 10, fontFamily: 'Helvetica-Bold', flex: 1 },
  pCardQtyBox: {
    backgroundColor: ANKER_BLUE, paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 12,
  },
  pCardQtyTxt: { color: TEXT_MAIN, fontSize: 8.5, fontFamily: 'Helvetica-Bold' },

  // Fila de cajas de precio por modo
  pCardPriceRow: { flexDirection: 'row', gap: 5, padding: 6 },
  pPriceBox: { flex: 1, borderRadius: 4, overflow: 'hidden' },
  pPriceBoxLabel: {
    color: TEXT_MAIN, fontSize: 7, fontFamily: 'Helvetica-Bold',
    textAlign: 'center', paddingVertical: 3, letterSpacing: 0.3,
  },
  pPriceBoxValueWrap: {
    paddingVertical: 5, paddingHorizontal: 4,
    backgroundColor: 'rgba(255,255,255,0.04)',
    alignItems: 'center',
  },
  pPriceBoxValue: {
    fontSize: 9, fontFamily: 'Helvetica-Bold', textAlign: 'center',
  },
  pPriceBoxSub: { color: TEXT_SEC, fontSize: 6.2, marginTop: 1 },
  totalsSection: { marginTop: 10, marginBottom: 12 },
  totalsRow: { flexDirection: 'row', gap: 6 },
  totalBox: { flex: 1, borderRadius: 4, overflow: 'hidden' },
  totalBoxHeader: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    alignItems: 'center',
  },
  totalBoxHeaderText: {
    color: TEXT_MAIN,
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  totalBoxRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: ROW_ODD,
  },
  totalBoxLabel: { color: TEXT_SEC, fontSize: 7 },
  totalBoxValue: { color: TEXT_MAIN, fontSize: 7, fontFamily: 'Helvetica-Bold' },
  totalBoxHighlight: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  totalBoxHighlightLabel: { color: TEXT_MAIN, fontSize: 9, fontFamily: 'Helvetica-Bold' },
  totalBoxHighlightValue: { color: TEXT_MAIN, fontSize: 9, fontFamily: 'Helvetica-Bold' },
  disclaimer: {
    color: TEXT_SEC,
    fontSize: 7,
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 1.5,
  },
  footer: {
    backgroundColor: BLUE,
    borderRadius: 4,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  footerText: {
    color: TEXT_MAIN,
    fontSize: 7.5,
    textAlign: 'center',
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 0.5,
  },
});

const fmt = (n: number) => '$' + n.toFixed(2);

type EffCol = { key: string; label: string; color: string; isSyncMode: boolean; syncTerm?: '12' | '24' | '48' };

export default function CotizacionPDF(props: CotizacionPDFProps) {
  const { cartItems, pdfModes, pdfSyncTerms, downPayment, consultor, cliente } = props;
  const idioma: Idioma = props.idioma ?? 'es';
  const promoMadres = props.promoMadres ?? false;
  const farmacias = props.farmacias ?? { activa: false, nombre: '' };

  /** Helper de traducción */
  const tr = (es: string, en: string) => (idioma === 'en' ? en : es);

  const cotizacionNum = 'WH-' + Date.now();
  const fechaStr = new Date().toLocaleDateString(idioma === 'en' ? 'en-US' : 'es-PR');

  // Expand pdfModes: each 'sync' entry becomes one column per selected term
  const effCols: EffCol[] = pdfModes.flatMap((mode): EffCol[] => {
    if (mode === 'sync') {
      return pdfSyncTerms.map(t => ({
        key: `sync-${t}`,
        label: `SYNC ${t}M`,
        color: GREEN,
        isSyncMode: true,
        syncTerm: t,
      }));
    }
    return [{ key: mode, label: MODE_META[mode].label, color: MODE_META[mode].color, isSyncMode: false }];
  });

  const isSingle = effCols.length === 1;

  const getColPrice = (item: typeof cartItems[0], col: EffCol) => {
    if (col.key === 'kiwi') return item.syncPrice;          // total financiado sin cuotas
    if (col.key === 'homedepot') return item.cashPrice;     // mismo precio cash
    if (!col.isSyncMode) return item.cashPrice;             // cash
    // sync — mensualidad por plazo
    if (col.syncTerm === '12') return item.syncPay12;
    if (col.syncTerm === '24') return item.syncPay24;
    return item.syncPay48;
  };

  const getColGrandTotal = (col: EffCol) =>
    cartItems.reduce((acc, item) => acc + getColPrice(item, col) * item.qty, 0);

  const numCols = effCols.length;
  const productColW = isSingle ? '44%' : numCols === 2 ? '38%' : numCols === 3 ? '32%' : '28%';
  const qtyColW = '8%';
  const remainingPct = isSingle ? 48 : numCols === 2 ? 54 : numCols === 3 ? 60 : 64;
  const modeColW = (remainingPct / numCols).toFixed(1) + '%';

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>

        {/* HEADER */}
        <View style={styles.headerRow}>
          <Image src="https://i.postimg.cc/44pJ0vXw/logo.png" style={styles.logo} />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Svg width={26} height={36} viewBox="0 0 24 32">
              <Path
                d="M14 0 L4 18 H10 L8 32 L20 12 H14 L16 0 Z"
                fill={ANKER_BLUE}
                stroke={ANKER_BLUE}
                strokeWidth={0.5}
                strokeLinejoin="round"
              />
            </Svg>
            <Text style={styles.ankerTitle}>ANKER</Text>
          </View>
        </View>
        <View style={styles.divider} />
        <Text style={styles.cotizacionTitle}>{tr('COTIZACIÓN FORMAL', 'FORMAL QUOTE')}</Text>
        <Text style={styles.cotizacionSubtitle}>{tr('BATERÍAS PORTÁTILES · WINDMAR HOME', 'PORTABLE BATTERIES · WINDMAR HOME')}</Text>

        {/* DATA BLOCK */}
        <View style={styles.dataBlock}>
          <View style={styles.dataCol}>
            <Text style={styles.dataColHeader}>{tr('CONSULTOR', 'CONSULTANT')}</Text>
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>{tr('Nombre:', 'Name:')}</Text>
              <Text style={styles.dataValue}>{consultor.nombre}</Text>
            </View>
            {consultor.correo ? (
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>{tr('Correo:', 'Email:')}</Text>
                <Text style={styles.dataValue}>{consultor.correo}</Text>
              </View>
            ) : null}
            {consultor.telefono ? (
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>{tr('Teléfono:', 'Phone:')}</Text>
                <Text style={styles.dataValue}>{consultor.telefono}</Text>
              </View>
            ) : null}
            <View style={{ marginTop: 6 }}>
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>{tr('N° Cotización:', 'Quote No.:')}</Text>
                <Text style={styles.dataValue}>{cotizacionNum}</Text>
              </View>
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>{tr('Fecha:', 'Date:')}</Text>
                <Text style={styles.dataValue}>{fechaStr}</Text>
              </View>
            </View>
          </View>

          <View style={styles.dataCol}>
            <Text style={styles.dataColHeader}>{tr('CLIENTE', 'CUSTOMER')}</Text>
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>{tr('Nombre:', 'Name:')}</Text>
              <Text style={styles.dataValue}>{cliente.nombre}</Text>
            </View>
            {cliente.correo ? (
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>{tr('Correo:', 'Email:')}</Text>
                <Text style={styles.dataValue}>{cliente.correo}</Text>
              </View>
            ) : null}
            {cliente.telefono ? (
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>{tr('Teléfono:', 'Phone:')}</Text>
                <Text style={styles.dataValue}>{cliente.telefono}</Text>
              </View>
            ) : null}
            {cliente.direccion ? (
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>{tr('Dirección:', 'Address:')}</Text>
                <Text style={styles.dataValue}>{cliente.direccion}</Text>
              </View>
            ) : null}
            <View style={{ marginTop: 6 }}>
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>{tr('Validez:', 'Valid for:')}</Text>
                <Text style={styles.dataValue}>{tr('30 días', '30 days')}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* PRODUCTS TABLE — layout clásico restaurado, con colores por modo */}
        {isSingle ? (
          /* ─── SINGLE COLUMN: cuando solo hay 1 modo seleccionado ─── */
          <>
            <View style={[styles.tableHeader, { backgroundColor: effCols[0].color }]}>
              <Text style={[styles.tableHeaderCell, { width: '44%' }]}>{tr('PRODUCTO', 'PRODUCT')}</Text>
              <Text style={[styles.tableHeaderCell, { width: '20%' }]}>
                {effCols[0].label}{effCols[0].isSyncMode ? '/MES' : ''}
              </Text>
              <Text style={[styles.tableHeaderCell, { width: '10%', textAlign: 'center' }]}>{tr('CANT', 'QTY')}</Text>
              <Text style={[styles.tableHeaderCell, { width: '26%', textAlign: 'right' }]}>{tr('TOTAL', 'TOTAL')}</Text>
            </View>
            {cartItems.map((item, idx) => {
              const unit = getColPrice(item, effCols[0]);
              const total = unit * item.qty;
              const bg = idx % 2 === 0 ? ROW_ODD : ROW_EVEN;
              return (
                <View key={item.id} style={[styles.tableRow, { backgroundColor: bg }]} wrap={false}>
                  <View style={[styles.productCellWrap, { width: '44%' }]}>
                    {item.image && (
                      <View style={styles.productImgBox}>
                        <Image src={item.image} style={styles.productImg} />
                      </View>
                    )}
                    <Text style={styles.productTxt}>{item.name}</Text>
                  </View>
                  <Text style={[styles.tableCell, { width: '20%' }]}>{fmt(unit)}{effCols[0].isSyncMode ? '/m' : ''}</Text>
                  <Text style={[styles.tableCell, { width: '10%', textAlign: 'center' }]}>{item.qty}</Text>
                  <Text style={[styles.tableCell, { width: '26%', textAlign: 'right' }]}>{fmt(total)}{effCols[0].isSyncMode ? '/m' : ''}</Text>
                </View>
              );
            })}
          </>
        ) : (
          /* ─── MULTI COLUMN: una columna por modo seleccionado ─── */
          <>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, { width: productColW }]}>{tr('PRODUCTO', 'PRODUCT')}</Text>
              <Text style={[styles.tableHeaderCell, { width: qtyColW, textAlign: 'center' }]}>{tr('CANT', 'QTY')}</Text>
              {effCols.map(col => (
                <View
                  key={col.key}
                  style={{
                    width: modeColW,
                    backgroundColor: col.color,
                    paddingHorizontal: 6, paddingVertical: 5,
                    marginHorizontal: -0.5,
                  }}
                >
                  <Text style={[styles.tableHeaderCell, { textAlign: 'right' }]}>
                    {col.label}{col.isSyncMode ? '/m' : ''}
                  </Text>
                </View>
              ))}
            </View>
            {cartItems.map((item, idx) => {
              const bg = idx % 2 === 0 ? ROW_ODD : ROW_EVEN;
              return (
                <View key={item.id} style={[styles.tableRow, { backgroundColor: bg }]} wrap={false}>
                  <View style={[styles.productCellWrap, { width: productColW }]}>
                    {item.image && (
                      <View style={styles.productImgBox}>
                        <Image src={item.image} style={styles.productImg} />
                      </View>
                    )}
                    <Text style={styles.productTxt}>{item.name}</Text>
                  </View>
                  <Text style={[styles.tableCell, { width: qtyColW, textAlign: 'center' }]}>{item.qty}</Text>
                  {effCols.map(col => (
                    <Text key={col.key} style={[styles.tableCell, { width: modeColW, textAlign: 'right', color: col.color, fontFamily: 'Helvetica-Bold' }]}>
                      {fmt(getColPrice(item, col) * item.qty)}{col.isSyncMode ? '/m' : ''}
                    </Text>
                  ))}
                </View>
              );
            })}
          </>
        )}

        {/* TOTALS — max 3 boxes per row */}
        {(() => {
          const syncTotalBase = cartItems.reduce((acc, it) => acc + it.syncPrice * it.qty, 0);
          const chunks: EffCol[][] = [];
          for (let i = 0; i < effCols.length; i += 3) chunks.push(effCols.slice(i, i + 3));
          return (
            <View style={styles.totalsSection}>
              {chunks.map((chunk, ci) => (
                <View key={ci} style={[styles.totalsRow, ci > 0 ? { marginTop: 6 } : {}]}>
                  {chunk.map(col => {
                    const grandTotal = getColGrandTotal(col);
                    const financed = col.isSyncMode ? Math.max(0, syncTotalBase - downPayment) : 0;
                    // IVU PR = 11.5% — para modos no-mensuales (Cash, Home Depot, Kiwi),
                    // se deriva sinIVU + IVU del total final. Math siempre cuadra:
                    //   sinIVU + IVU = grandTotal
                    const IVU_RATE = 0.115;
                    const isMonthly = col.isSyncMode;
                    const sinIvu = !isMonthly ? grandTotal / (1 + IVU_RATE) : 0;
                    const ivuVal = !isMonthly ? grandTotal - sinIvu        : 0;
                    return (
                      <View key={col.key} style={styles.totalBox}>
                        <View style={[styles.totalBoxHeader, { backgroundColor: col.color }]}>
                          <Text style={styles.totalBoxHeaderText}>{col.label}</Text>
                        </View>
                        {col.isSyncMode && downPayment > 0 && (
                          <>
                            <View style={styles.totalBoxRow}>
                              <Text style={styles.totalBoxLabel}>{tr('Precio Sync', 'Sync Price')}</Text>
                              <Text style={styles.totalBoxValue}>{fmt(syncTotalBase)}</Text>
                            </View>
                            <View style={[styles.totalBoxRow, { backgroundColor: ROW_EVEN }]}>
                              <Text style={styles.totalBoxLabel}>{tr('Pronto Pago', 'Down Payment')}</Text>
                              <Text style={styles.totalBoxValue}>{fmt(downPayment)}</Text>
                            </View>
                            <View style={styles.totalBoxRow}>
                              <Text style={styles.totalBoxLabel}>{tr('A financiar', 'To finance')}</Text>
                              <Text style={styles.totalBoxValue}>{fmt(financed)}</Text>
                            </View>
                          </>
                        )}
                        {/* IVU breakdown — Home Depot y Kiwi únicamente.
                            Cash NO muestra IVU (requerimiento de Anker — solo precio total). */}
                        {!isMonthly && col.key !== 'cash' && (
                          <>
                            <View style={styles.totalBoxRow}>
                              <Text style={styles.totalBoxLabel}>{tr('Sin IVU', 'No tax')}</Text>
                              <Text style={styles.totalBoxValue}>{fmt(sinIvu)}</Text>
                            </View>
                            <View style={[styles.totalBoxRow, { backgroundColor: ROW_EVEN }]}>
                              <Text style={styles.totalBoxLabel}>{tr('IVU 11.5%', 'Tax 11.5%')}</Text>
                              <Text style={styles.totalBoxValue}>{fmt(ivuVal)}</Text>
                            </View>
                          </>
                        )}
                        <View style={[styles.totalBoxHighlight, { backgroundColor: col.color }]}>
                          <Text style={styles.totalBoxHighlightLabel}>
                            {col.isSyncMode
                              ? tr(`CUOTA ${col.syncTerm}M`, `${col.syncTerm}M FEE`)
                              : tr('TOTAL', 'TOTAL')}
                          </Text>
                          <Text style={styles.totalBoxHighlightValue}>
                            {fmt(grandTotal)}{col.isSyncMode ? '/m' : ''}
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              ))}
            </View>
          );
        })()}

        {/* FARMACIAS BANNER — solo si promo activa */}
        {farmacias.activa && (
          <View style={{
            marginTop: 8, marginHorizontal: 12,
            backgroundColor: '#0A2818',
            borderWidth: 1.5, borderColor: '#0F9D58',
            borderRadius: 6, paddingVertical: 8, paddingHorizontal: 10,
          }}>
            <Text style={{
              fontSize: 10, color: '#A7E5C4',
              fontFamily: 'Helvetica-Bold', textAlign: 'center', marginBottom: 3,
            }}>
              {tr(
                `+ Promoción Farmacias — ${farmacias.nombre} +`,
                `+ Pharmacy Promo — ${farmacias.nombre} +`,
              )}
            </Text>
            <Text style={{
              fontSize: 7.5, color: '#A7E5C4', textAlign: 'center', lineHeight: 1.4,
            }}>
              {tr(
                'Descuento fijo de 10% aplicado sobre el total · Aplica a profesionales licenciados de farmacia · Validación en showroom',
                '10% fixed discount applied on the total · For licensed pharmacy professionals · In-showroom validation',
              )}
            </Text>
          </View>
        )}

        {/* MADRES BANNER — solo si promo activa */}
        {promoMadres && (
          <View style={{
            marginTop: 8, marginHorizontal: 12,
            backgroundColor: '#2A0E1F',
            borderWidth: 1.5, borderColor: '#E84F97',
            borderRadius: 6, paddingVertical: 8, paddingHorizontal: 10,
          }}>
            <Text style={{
              fontSize: 10, color: '#F8B8D4',
              fontFamily: 'Helvetica-Bold', textAlign: 'center', marginBottom: 3,
            }}>
              {tr(
                '+ + Promo Mes de las Madres 2026 — Anker + +',
                "+ + Mother's Day Promo 2026 — Anker + +",
              )}
            </Text>
            <Text style={{
              fontSize: 7.5, color: '#F8B8D4', textAlign: 'center', lineHeight: 1.4,
            }}>
              {tr(
                'Precios promo aplicados · Incluye Batería Anker C300 GRATIS · Vigente del 7 al 14 de mayo 2026 · Solo en showroom (Roosevelt, Mayagüez, Ponce, Hatillo)',
                "Promo prices applied · Includes FREE Anker C300 Battery · Valid May 7–14, 2026 · In-showroom only (Roosevelt, Mayagüez, Ponce, Hatillo)",
              )}
            </Text>
          </View>
        )}

        {/* DISCLAIMER */}
        <Text style={styles.disclaimer}>
          {tr(
            'Precios referenciales. Financiamiento sujeto a aprobación de Synchrony Financial.',
            'Reference prices. Financing subject to Synchrony Financial approval.',
          )}{'\n'}
          {tr(
            'Windmar Home — Distribuidor Exclusivo Anker en Puerto Rico y El Caribe.',
            'Windmar Home — Exclusive Anker Distributor in Puerto Rico and the Caribbean.',
          )}
        </Text>

        {/* FOOTER */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            787.395.7766  |  windmar.com  |  ventas@windmarhome.com  |  © Windmar Home {new Date().getFullYear()}
          </Text>
        </View>
      </Page>
    </Document>
  );
}
