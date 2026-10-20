# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js 16 (App Router, TypeScript, Tailwind v4, Turbopack) + Drizzle ORM sobre Postgres (Neon en producción vía `DATABASE_URL`, PGlite embebido en desarrollo local), autenticación por cookies JWT firmadas (jose), desplegado en Vercel.

## Users

Un grupo cerrado de ~7 amigos (chinparley: César, Carlos, Fiume, Gabriel, Manuel, Vargas, Anfitrión) que entran desde el móvil a través de un enlace compartido por WhatsApp, más un solo administrador (el anfitrión, "capitán") que dirige el evento desde un panel privado.

## Product Purpose

Chin Ballon d'Or es la gala anual de parodia del grupo: los amigos votan en categorías que premian los momentos del año (Balón de Oro, Puskas de mensaje más gracioso, Olivada del mensaje fantasma/fastameada, Mejor 5) y luego cada uno reproduce solo una ceremonia cinematográfica que revela los resultados con suspenso, además de dos premios ceremoniales de podio fijo (Mr Parley, Entrenadores). El éxito es que se sienta como un evento exclusivo de lujo — no como una encuesta — y que se repita cada año.

## Positioning

Es una "gala" completa, no una encuesta: flujo de dos actos (votación sellada y ciega → ceremonia con revelación dramática por reproducción individual), papeletas anónimas con acta estadística, premios ceremoniales no votados y un panel de dirección del evento. Ninguna herramienta de encuestas produce una noche de gala.

## Operating Context

- Acto 1: el capitán abre la votación desde el admin; los amigos entran con un código de grupo compartido por WhatsApp y eligen su nombre; la papeleta es ciega (sin resultados) y blindada (un voto por categoría, sin edición).
- Acto 2: el capitán cierra la votación y activa la gala; cada amigo reproduce la ceremonia en su dispositivo cuando quiera; al final accede al Acta Oficial con estadísticas anónimas.
- La voz del producto es español con acentos ceremoniales en francés; tono paródico de gala de lujo.

## Capabilities and Constraints

- Votadas: Balón de Oro (top-3 con puntos 5-3-1, todos nominados, auto-voto permitido), Puskas y Olivada (4 mensajes nominados cada una, mismo top-3 5-3-1), Mejor 5 (marcar 5 sin orden, 1 punto c/u; empate en el 5º → equipo de 6).
- Ceremoniales (sin voto, podio fijado por el capitán): Mr Parley (César > Fiume > Vargas > Gabriel > Anfitrión) y Entrenadores (Carlos > Manuel > César > Fiume).
- Desempates: más 1er-puestos → más 2º-puestos → premio compartido.
- Orden de la ceremonia: Olivada → Puskas → Mejor 5 → Entrenadores → Mr Parley → Balón de Oro (gran final).
- Panel admin (contraseña propia del capitán): gestión de miembros/fotos, textos de mensajes, podios ceremoniales, código de grupo, abrir/cerrar votación, votos en vivo, activar gala, ver resultados.
- Restricciones: papeletas individuales nunca públicas (solo estadísticas agregadas); los mensajes nominados se re-crean como burbujas de chat elegantes (no capturas); fotos de nominados opcionales con monograma dorado de respaldo; sin edición de votos tras sellar.

## Brand Commitments

- Nombre oficial: "Chin Ballon d'Or" (en francés, snob).
- La estética es parte del producto: elegante, de gala, exclusiva — el usuario lo declaró requisito central, no decoración.

## Evidence on Hand

- Repositorio con backend completo ya implementado (schema Drizzle, seed con categorías y podios, APIs de sesión/votación/admin) y datos sembrados en PGlite local.
- Los 8 mensajes reales nominados (Puskas/Olivada) aún no existen: el capitán los pegará desde el admin. No fabricarlos.
- Fotos de los amigos: aún no hay; el sistema muestra monogramas hasta que el capitán las suba.

## Product Principles

1. La gala manda: cada decisión de producto sirve al drama y al prestigio de la ceremonia, no a la eficiencia de una encuesta.
2. Mobile-first: la experiencia real es un teléfono compartiendo pantalla de WhatsApp.
3. Un solo capitán: el admin es la oficina de producción del evento — control total, fricción cero para los invitados.
4. Anonimato de papeleta: los recibos personales no existen; las estadísticas agregadas son el acta pública.
5. Repetible anualmente: nada de one-offs; categorías y nominados son datos, no código.

## Accessibility & Inclusion

Público de amigos jóvenes sin requisitos formales; aún así, contraste y tamaños táctiles generosos porque todo ocurre en el móvil.
