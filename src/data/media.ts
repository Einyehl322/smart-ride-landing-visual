/**
 * Recursos fotográficos.
 *
 * Las fuentes PNG se conservan. Los seis modelos nuevos usan WebP a resolución
 * nativa (1448 × 1086) y variantes responsive, sin ampliar la imagen original.
 */
import casco1280 from '../assets/media/casco-1280.webp'
import casco1920 from '../assets/media/casco-1920.webp'
import casco2560 from '../assets/media/casco-2560.webp'
import casco3840 from '../assets/media/casco-3840.webp'
import ruta1280 from '../assets/media/ruta-1280.webp'
import ruta1920 from '../assets/media/ruta-1920.webp'
import ruta2560 from '../assets/media/ruta-2560.webp'
import ruta3840 from '../assets/media/ruta-3840.webp'
import v12Pro480 from '../assets/media/products/v12-pro-480.webp'
import v12Pro960 from '../assets/media/products/v12-pro-960.webp'
import v12Pro1448 from '../assets/media/products/v12-pro-1448.webp'

/** Fotografías premium aportadas por SMART RIDE, una fuente distinta por modelo. */
import y13Pro480 from '../assets/media/products/y13-pro-480.webp'
import y13Pro960 from '../assets/media/products/y13-pro-960.webp'
import y13Pro1448 from '../assets/media/products/y13-pro-1448.webp'
import freedconnHero480 from '../assets/media/products/freedconn-hero-480.webp'
import freedconnHero960 from '../assets/media/products/freedconn-hero-960.webp'
import freedconnHero1448 from '../assets/media/products/freedconn-hero-1448.webp'
import s7Pro480 from '../assets/media/products/s7-pro-480.webp'
import s7Pro960 from '../assets/media/products/s7-pro-960.webp'
import s7Pro1448 from '../assets/media/products/s7-pro-1448.webp'
import s7480 from '../assets/media/products/s7-480.webp'
import s7960 from '../assets/media/products/s7-960.webp'
import s71448 from '../assets/media/products/s7-1448.webp'
import q58Max480 from '../assets/media/products/q58-max-480.webp'
import q58Max960 from '../assets/media/products/q58-max-960.webp'
import q58Max1448 from '../assets/media/products/q58-max-1448.webp'
import p30Pro480 from '../assets/media/products/p30-pro-480.webp'
import p30Pro960 from '../assets/media/products/p30-pro-960.webp'
import p30Pro1448 from '../assets/media/products/p30-pro-1448.webp'

export const media = {
  /** Intercomunicador montado en casco, fondo oscuro (hasta 4K). */
  casco: {
    src: casco1920,
    srcSet: `${casco1280} 1280w, ${casco1920} 1920w, ${casco2560} 2560w, ${casco3840} 3840w`,
    width: 3840,
    height: 3840,
  },
  /** Motociclista en carretera de montaña (hasta 4K). */
  ruta: {
    src: ruta1920,
    srcSet: `${ruta1280} 1280w, ${ruta1920} 1920w, ${ruta2560} 2560w, ${ruta3840} 3840w`,
    width: 3840,
    height: 3840,
  },
  /** Y12: audífono con iluminación RGB (fuente PNG 1448 × 1086 en src/assets/media). */
  v12Hero: {
    src: v12Pro1448,
    srcSet: `${v12Pro480} 480w, ${v12Pro960} 960w, ${v12Pro1448} 1448w`,
    width: 1448,
    height: 1086,
  },
} as const

export const productMedia = {
  'y13-pro': {
    src: y13Pro1448,
    srcSet: `${y13Pro480} 480w, ${y13Pro960} 960w, ${y13Pro1448} 1448w`,
    width: 1448,
    height: 1086,
  },
  'freedconn-hero': {
    src: freedconnHero1448,
    srcSet: `${freedconnHero480} 480w, ${freedconnHero960} 960w, ${freedconnHero1448} 1448w`,
    width: 1448,
    height: 1086,
  },
  's7-pro': {
    src: s7Pro1448,
    srcSet: `${s7Pro480} 480w, ${s7Pro960} 960w, ${s7Pro1448} 1448w`,
    width: 1448,
    height: 1086,
  },
  's7': {
    src: s71448,
    srcSet: `${s7480} 480w, ${s7960} 960w, ${s71448} 1448w`,
    width: 1448,
    height: 1086,
  },
  'q58-max': {
    src: q58Max1448,
    srcSet: `${q58Max480} 480w, ${q58Max960} 960w, ${q58Max1448} 1448w`,
    width: 1448,
    height: 1086,
  },
  'p30-pro': {
    src: p30Pro1448,
    srcSet: `${p30Pro480} 480w, ${p30Pro960} 960w, ${p30Pro1448} 1448w`,
    width: 1448,
    height: 1086,
  },
} as const
