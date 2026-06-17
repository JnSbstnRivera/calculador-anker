/**
 * Promo Día del Padre 2026 — Anker
 *
 * Reglas (campaña Día del Padre):
 *   - Anker Solix F2600 y batería de expansión: 20% off → ya reflejado en precio cash
 *   - Regalo: PANEL SOLAR GRATIS con la compra de la Anker Solix F3800 Plus
 *
 *   Vigencia: 18 al 25 de junio de 2026 (anuncio y aplicación en la misma ventana)
 *   Solo en showroom (Roosevelt, Mayagüez, Ponce, Hatillo)
 */

export const MADRES_GIFT_NAME_ES = 'Panel solar';
export const MADRES_GIFT_NAME_EN = 'Solar panel';

const ANNOUNCE_START = new Date('2026-06-18T00:00:00');
const SALE_START     = new Date('2026-06-18T00:00:00');
const SALE_END       = new Date('2026-06-25T23:59:59');

/** ¿Hay que mostrar el banner promo en el modal? (1 al 14 de mayo) */
export function isMadresAnnounceActive(now: Date = new Date()): boolean {
  return now >= ANNOUNCE_START && now <= SALE_END;
}

/** ¿Se puede APLICAR el descuento? (7 al 14 de mayo) */
export function isMadresSaleActive(now: Date = new Date()): boolean {
  return now >= SALE_START && now <= SALE_END;
}
