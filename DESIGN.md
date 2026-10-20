---
name: Chin Ballon d'Or
description: La première cérémonie annuelle du chinparley — gala paródica como programa de ópera grabado
colors:
  ivory: "#efe6d2"
  ivory-deep: "#e4d7bd"
  ivory-sink: "#d8c9a8"
  ink: "#1c1813"
  ink-soft: "#45402f"
  ink-faint: "#6e6557"
  foil: "#8f6f2e"
  foil-bright: "#c8a45c"
  foil-ink: "#7a5c22"
  stage: "#12100c"
  stage-lift: "#1e1a13"
typography:
  display:
    fontFamily: "Bodoni Moda, serif"
    fontSize: "clamp(2.6rem, 12vw, 4.6rem)"
    fontWeight: 700
    lineHeight: 1.04
    letterSpacing: "0.045em"
  headline:
    fontFamily: "Bodoni Moda, serif"
    fontSize: "clamp(1.6rem, 7.5vw, 2.6rem)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "0.05em"
  title:
    fontFamily: "Bodoni Moda, serif"
    fontSize: "22px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.04em"
  body:
    fontFamily: "Source Serif 4, serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Cinzel, serif"
    fontSize: "11px"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0.32em"
rounded:
  full: "9999px"
spacing:
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "40px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.ivory}"
    padding: "16px 20px"
  button-secondary:
    backgroundColor: "{colors.ivory}"
    textColor: "{colors.ink}"
    padding: "16px 20px"
  input:
    backgroundColor: "rgba(228, 215, 189, 0.6)"
    textColor: "{colors.ink}"
    padding: "14px 16px"
  card:
    backgroundColor: "{colors.ivory}"
    textColor: "{colors.ink}"
    padding: "20px 24px"
---

# Design System: Chin Ballon d'Or

## Overview

**Creative North Star: "El programa impreso de la función anual"**

Toda la interfaz es el programa de gala impreso: papel marfil con grano, tinta negra de cobregrabado y un único foil dorado que solo toca lo premiado. La ceremonia no es una página más: es una platea oscura con foco de escenario que vive DENTRO del programa, como las fotos de producción de un programa de teatro volvieronas vivas. La elegancia nace de la densidad de impresión (dobles filetes, versalitas con tracking largo, florituras grabadas), no de brillos ni gradientes.

**Key Characteristics:**
- Hoja con marco de doble filete que cierra el viewport completo con márgenes parejos (12px).
- Un solo acento metálico: el foil aparece en el wordmark, ganadores, sellos y numerales de podio; nunca como decoración.
- Estados "de prensa": las placas se hunden al pulsar, los sellos van en seco (sin tinta), las selecciones punteadas se vuelven tinta continua al sellar.
- La ceremonia invierte el mundo: fondo stage casi negro, foco radial cálido, placas marfil flotando bajo el spot.

## Colors

Paleta de imprenta de lujo: dos tintas (marfil y negra) más un oro apagado de estampación.

### Primary
- **Marfil Papel** (#efe6d2): el suelo de toda página impresa; fondo de tarjetas y placas de ganador sobre la platea.
- **Tinta Grabado** (#1c1813): texto, filetes, marcos, botones primarios de tinta. El negro cálido de la tinta de prensa, nunca negro puro.

### Secondary
- **Foil Estampado** (#8f6f2e): el oro sobre marfil — wordmark, títulos de acta, nombres de ganador (≥3:1 en display).
- **Foil Profundo** (#7a5c22): el oro para texto pequeño sobre marfil (numerales de rango, etiquetas "Complète", ≥4.5:1).

### Tertiary
- **Foil Escénico** (#c8a45c): el oro solo sobre la platea oscura — títulos de escena, sellos del sobre, confeti.

### Neutral
- **Marfil Profundo** (#e4d7bd): fondos de inputs y placas activas.
- **Marfil Hundido** (#d8c9a8): estados pressed y pistas de campo.
- **Tinta Suave** (#45402f): texto secundario y subtítulos.
- **Tinta Apagada** (#6e6557): hairlines secundarios, notas al pie, placeholders.
- **Platea** (#12100c) y **Platea Elevada** (#1e1a13): fondo de la ceremonia y cuerpo del sobre.

### Named Rules
**La regla del foil sagrado.** El dorado solo toca lo premiado: wordmark, ganadores, podios y sellos. Si un elemento no ganó nada, va en tinta.
**La regla de la hoja entera.** Toda página pública vive dentro del marco de doble filete con margen parejo; nada toca el borde del viewport.

## Typography

**Display Font:** Bodoni Moda (fallback serif) — didone de casa de ópera, con itálica para lineas de sabor francés.
**Body Font:** Source Serif 4 (fallback serif) — serif de trabajo legible en móvil.
**Label Font:** Cinzel (fallback serif) — versalitas de cobregrabado, siempre en uppercase con tracking 0.14–0.42em.

**Character:** Contraste didone/tinta que evoca programa de teatro impreso; la itálica Bodoni lleva el tono snob francés ("La nuit la plus prestigieuse du chinparley").

### Hierarchy
- **Display** (700, clamp(2.6rem, 12vw, 4.6rem), 1.04): solo el wordmark "CHIN BALLON D'OR".
- **Headline** (700, clamp(1.6rem, 7.5vw, 2.6rem), 1.1): títulos de página y de escena, uppercase.
- **Title** (700, 22px, 1.2): títulos de categoría en acta y tarjetas.
- **Body** (400, 14–15px, 1.6, máx ~48ch): párrafos, instrucciones, mensajes.
- **Label** (600, 9–13px, tracking 0.14–0.42em, uppercase): cartuchos de estado, encabezados de tabla, etiquetas de campo, firmas de burbuja.

### Named Rules
**La regla del tracker largo.** Las versalitas Cinzel nunca bajan de 0.14em de tracking; el aire entre letras ES el estilo de grabado.

## Layout

Una sola columna centrada (max-width 560–620px) sobre la hoja enmarcada; todo mobile-first. Ritmo vertical: gap 5–7 entre bloques, más espacio sobre un heading que debajo. Los márgenes de la hoja son 12px (m-3) en móvil, 20px (m-5) desde sm. Las tablas del acta usan filas con hairline (border-b 25% tinta) y cifras tabulares.

## Elevation & Depth

Sistema de **prensa**, no de sombras flotantes: la profundidad es papel physical — insets que hunden y relieves que estampan. Nada de drop shadows difusas sobre tarjetas.

### Shadow Vocabulary
- **plate-press** (`inset 0 1px 0 rgba(255,255,255,0.32), inset 0 -2px 3px rgba(28,24,19,0.22), 0 1px 0 rgba(255,255,255,0.55), 0 3px 6px rgba(28,24,19,0.28)`): botones y placas en reposo; al pulsar se invierte a inset hundido + translateY(1px).
- **emboss-seal** (`inset 0 2px 3px rgba(255,255,255,0.6), inset 0 -3px 4px rgba(28,24,19,0.35), 0 1px 1px rgba(255,255,255,0.7)`): estampado en seco del sello CB, sin tinta.
- **vignette-stage** (`inset 0 0 clamp(60px,14vw,160px) 24px rgba(0,0,0,0.55)`): oscurecimiento de bordes de la platea.

### Named Rules
**La regla de la prensa.** Un control se hunde al pulsarlo; nunca salta hacia arriba. La metáfora es presionar plomo tipográfico, no levantar tarjetas.

## Shapes

Esquinas rectas en todo el sistema (radius 0): el lenguaje es el rectángulo impreso con doble filete (border 1px + segundo borde inset 5px, o border-top + box-shadow offset 3px para reglas horizontales). La única curva es el círculo perfecto (9999px): monogramas y sellos, siempre con anillo doble (borde exterior + anillo interior a 2.5px).

## Components

### Coupon (botón/CTA)
- **Shape:** rectángulo recto con columna izquierda de troquel (línea discontinua vertical + tijeras dibujadas en SVG).
- **Primary (tinta):** fondo ink, texto marfil, etiqueta en Cinzel 13px caps + subtítulo itálico 13px, flecha SVG en foil-bright.
- **Secondary (marfil):** fondo ivory, texto ink, mismo anatomy.
- **States:** plate-press en reposo, hundido en active, opacity 40% disabled (sin sombra).
- **Padding:** 16px 20px; ancho máx 420px centrado.

### Monogram
- **Shape:** círculo con anillo doble (borde ink + anillo interior a 2.5px).
- **Contenido:** iniciales Cinzel (34% del tamaño) en tinta — o en foil-ink cuando el estado es "premiado"; foto cuadrada recortada al círculo interior si existe.
- **Sizes:** 34 (tablas), 38-44 (podios, listas), 52-56 (papeleta).

### ChatBubble (mensaje nominado)
- **Shape:** cartucho recto con doble filete (border + inner inset 3px).
- **Anatomy:** firma (Cinzel 11px caps, tinta suave) + fecha itálica 11px a la derecha; texto Source Serif 14-15px.
- **Padding:** 16px 20px (compact: 12px 16px).

### RuleFrame (contenedor de página)
- **Shape:** doble filete perimetral (border ink + inner border 70% a 5px).
- **Uso:** envuelve cada página pública; flex-1 para cerrar la hoja completa.

### Escena de ceremonia
- **Fondo:** spotlight (radial cálido 92%x78% al 30% superior sobre stage) + grano + vignette inset.
- **Placa de ganador:** papel marfil, doble filete, monograma foil, nombre display en foil (winner) o tinta, cifras tabulares 12px.
- **Sobre:** cuerpo stage-lift con filete marfil 40%, solapa trapezoidal que rota (rotateX -168º, 550ms) y sello foil de 20px.
- **Progreso:** rombos de 6px por categoría (pasado foil lleno, actual foil-bright, futuro borde marfil 40%).

### Inputs
- **Style:** fondo ivory-deep 60%, borde ink, texto Cinzel/didone con tracking largo para códigos.
- **Focus:** borde foil + outline foil 2px offset 3px en focus-visible global.
- **Error:** cartucho con doble regla horizontal (border-y ink) y texto itálico — nunca rojo.

### Tablas (acta)
- **Header:** Cinzel 10px caps tracking 0.18em, border-b ink 60%.
- **Rows:** border-b ink 25%, numerales de posición en foil-ink (1º) o ink-faint; cifras tabulares.

## Do's and Don'ts

### Do:
- **Do** usar dobles filetes (border + inner inset 5px) para todo contenedor impreso.
- **Do** reservar el foil para lo premiado y los sellos; el resto en tinta.
- **Do** hundir los controles al pulsar (plate-press invertido + translateY(1px)).
- **Do** escribir el sabor ceremonial en francés (labels de escena, "par décision du comité") y el cuerpo en español.
- **Do** respetar prefers-reduced-motion: MotionConfig reducedMotion="user" + gate en el confeti.

### Don't:
- **Don't** usar gradientes en texto ni brillos metálicos falsos: el foil es color sólido con relieve de imprenta.
- **Don't** redondear esquinas de tarjetas, botones o marcos (solo círculos perfectos de monograma/sello).
- **Don't** mostrar papeletas individuales ni atribuir votos a nombres: el acta es solo agregada.
- **Don't** animar con más de un movimiento material por escena de ceremonia.
- **Don't** usar rojo para errores: el error es un cartucho de tinta con doble regla y nota itálica.
