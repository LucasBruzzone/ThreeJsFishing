# Portfolio Lucas Bruzzone — Diseño

**Fecha:** 2026-06-12  
**Estado:** Aprobado por el dueño

---

## Concepto

Un viaje continuo scroll-driven por 5 ambientes naturales, de lo cálido y visible hacia lo oscuro y profundo. La narrativa visual es una metáfora de conocer a una persona: empezás en la superficie (el atardecer, el primer impacto) y bajás hasta el fondo (lo más técnico, lo más íntimo).

**Regla de oro:** ningún ambiente se anuncia — se siente. El visitante no lee "soy calmo y detallista", lo experimenta navegando el sitio.

### Rasgos a transmitir
- **Calmo** — ritmo pausado, transiciones suaves, espacio en blanco generoso
- **Attention to detail** — microinteracciones, alineaciones exactas, cero elementos rotos
- **Creativo** — concepto propio, no template
- **Profundo** — la metáfora del descenso habla de autoconocimiento sin decirlo

---

## Los 5 ambientes

### 1. 🌅 Atardecer — Hero
**Paleta:** naranjas `#e8952a`, dorados `#f5a623`, violeta oscuro `#1a0820`, crema `#fde8c0`  
**Atmósfera:** cielo al caer el sol, partículas de luz cálida flotando lentas  
**Contenido:**
- Nombre: "Hola, soy Lucas."
- Subtítulo en su voz: "Construyo software, lidero equipos y hago velas en mi tiempo libre."
- Hint de scroll sutil
- Partículas Three.js: puntos cálidos, movimiento muy lento, como polvo en la luz

**Visual 3D:** horizonte con niebla dorada, sol hundido bajo el plano, rayos volumétricos suaves

---

### 2. 🌿 Bosque / Jardín — About
**Paleta:** verdes profundos `#162e0c`, musgo `#2d5a1b`, acento verde claro `#6abf45`  
**Atmósfera:** bosque nocturno, rayos de luz filtrados entre hojas, partículas de polvo orgánico  
**Contenido:**
- Quién es Lucas como persona (no CV): ambición tranquila, meditación, autoconocimiento, 1% mejor cada día
- Hobbies tejidos en la voz: pesca, plantas, fútbol, velas

**Visual 3D:** plantas y helechos 3D con movimiento de viento suave (shader de viento), rayos de luz entre troncos, partículas flotando hacia arriba

---

### 3. 🎣 Orilla — Work / Proyectos
**Paleta:** azul noche `#0d2840`, arena oscura, reflejo de agua `#5aaed4`, estrellas  
**Atmósfera:** orilla nocturna bajo estrellas, agua que llega y se va, guiño sutil a la pesca  
**Contenido:**
- **Kompass** — proyecto tech (descripción a completar)
- **Pausa** — emprendimiento de velas, marca propia
- Cards que aparecen con el scroll como cosas que el mar trae a la orilla

**Visual 3D:** plano de agua con reflejo, orilla con arena, partículas de espuma, estrellas en el cielo, cañita de pescar apoyada (elemento sutil, no protagonista)

---

### 4. 📝 Mar Poco Profundo — Writing
**Paleta:** azul profundo `#040c1a`, destellos `#4080c0`, negro con transparencias  
**Atmósfera:** bajo el agua, todavía con algo de luz desde la superficie, calma total  
**Contenido:**
- Artículos y notas de Lucas (engineering, liderazgo, reflexiones personales)
- Arranca vacío o con un placeholder, crece con él

**Visual 3D:** primeras partículas bioluminiscentes suaves, corales pequeños, agua turbia con luz que entra desde arriba

---

### 5. 🌊 Mar Profundo — Skills + Contacto
**Paleta:** negro abismal `#000408`, bioluminiscencia `#00aaff`, azul profundo `#2a6090`  
**Atmósfera:** fondo del océano, oscuro, partículas que brillan, vida que existe en la oscuridad  
**Contenido:**
- Skills técnicas: TypeScript, React, Ruby on Rails, Node.js, AWS, System Design, Mentoring
- Email y links (GitHub, LinkedIn)

**Visual 3D:** partículas bioluminiscentes animadas, corales oscuros con luz propia, niebla volumétrica azul, fondo invisible

---

## Navegación y scroll

- **Un solo canvas R3F** corre durante todo el viaje. La cámara se mueve con el scroll.
- **GSAP ScrollTrigger** controla el progreso de la cámara y las transiciones de ambiente.
- Cada ambiente es una "zona" en el espacio 3D. Al scrollear, la cámara avanza y la escena cambia (fog color, luces, partículas).
- **Indicador de profundidad:** 5 puntos fijos en el lado derecho de la pantalla, el punto activo cambia de color según el ambiente actual.
- Sin menú de navegación tradicional — el scroll es la única forma de moverse. Los links de contacto son la excepción.

---

## Stack técnico

| Capa | Tecnología | Razón |
|---|---|---|
| Framework | Vite + React + TypeScript | Rápido, bundle liviano, strict mode |
| 3D | react-three-fiber + @react-three/drei | 3D declarativo, ecosistema maduro |
| Smooth scroll | **Lenis** | Scroll butter-smooth, base del feel premium |
| Animación scroll | GSAP + ScrollTrigger | Orquesta cámara y transiciones con el scroll |
| Post-processing | @react-three/postprocessing | Bloom, chromatic aberration, film grain, DoF |
| Partículas | maath + custom GLSL shaders | GPU-friendly, performance, look único |
| Tipografía | Fuente custom (serif elegante) | Personalidad visual, no system font |
| Audio | Howler.js | Ambient audio por zona, fade entre ambientes |
| Estilos | CSS Modules + variables CSS | Sin framework pesado, control total |
| Deploy | Vercel | Zero config, preview automático |

### Decisiones técnicas clave

**Lenis como base del scroll:** Lenis reemplaza el scroll nativo y da el feel cinematográfico que distingue a los portfolios premium. GSAP ScrollTrigger se conecta a Lenis en lugar del scroll del browser.

**Un canvas, múltiples zonas:** toda la escena 3D vive en un `<Canvas>`. El scroll actualiza un `ref` de progreso (0–1). No se usa `useState` dentro del loop de render — solo refs mutados en `useFrame`.

**Shaders GLSL custom:** materiales propios para agua (caustics, reflejo), viento en plantas (desplazamiento por vértice según altura), niebla volumétrica, bioluminiscencia. Nada de materiales default de Three.js donde el efecto importa.

**Intro / loading screen:** experiencia de carga propia — no un spinner. Una animación que ya mete al visitante en el mundo antes de que cargue la escena completa.

**Audio ambiente por zona:** Howler.js maneja 5 tracks (atardecer, bosque, orilla, mar poco profundo, mar profundo). Fade cruzado suave al transitar entre zonas. El usuario puede silenciar.

**Tipografía:** una serif elegante (ej. Playfair Display, Cormorant, o similar) para nombres y títulos. Sans-serif limpia para cuerpo. Ambas con variable font si es posible para animaciones de peso.

**Post-processing por zona:** bloom intensidad baja en atardecer (luz cálida), casi nulo en bosque, moderado en orilla (estrellas), fuerte en mar profundo (bioluminiscencia). Chromatic aberration muy sutil en transiciones. Film grain permanente pero casi invisible.

**Performance:** `dpr` limitado a `[1, 1.5]`, geometrías instanced, texturas comprimidas KTX2, `Suspense` + `useGLTF.preload`, partículas de zonas lejanas desactivadas.

---

## Estructura de carpetas

```
src/
  main.tsx
  App.tsx
  sections/
    Hero.tsx          # Atardecer
    About.tsx         # Bosque
    Work.tsx          # Orilla
    Writing.tsx       # Mar poco profundo
    Contact.tsx       # Mar profundo
  three/
    scenes/
      WorldScene.tsx  # Canvas principal, orquesta zonas
    objects/
      SunsetParticles.tsx
      ForestPlants.tsx
      ShoreWater.tsx
      BioParticles.tsx
    config/
      lighting.ts
      postprocessing.ts
      zones.ts        # definición de zonas: posición cámara, fog, paleta
    hooks/
      useScrollProgress.ts
      useZoneTransition.ts
  components/
    DepthIndicator.tsx
    ProjectCard.tsx
    Nav.tsx
  hooks/
    useScrollProgress.ts  # GSAP scroll → progreso 0-1
  styles/
    variables.css
    reset.css
  content/
    projects.ts
    skills.ts
    writing.ts
  assets/
    models/           # GLTF de plantas, corales
    fonts/
    audio/            # ambient tracks por zona
```

---

## Secciones y contenido

### Hero (Atardecer)
```
Hola, soy Lucas.
Construyo software, lidero equipos y hago velas en mi tiempo libre.
↓ Scrolleá para conocerme
```

### About (Bosque)
*Texto a escribir por Lucas en su voz — no bullets, párrafos.*
Guía: ambición tranquila, 1% cada día, meditación, autoconocimiento, pesca/plantas/fútbol.

### Work (Orilla)
- **Kompass** — descripción a completar
- **Pausa** — marca de velas, emprendimiento propio

### Writing (Mar poco profundo)
Arranca con placeholder. Soporte MDX para el futuro.

### Contact (Mar profundo)
- lucasbruzzone97@gmail.com
- GitHub + LinkedIn

---

## Lo que NO entra (por ahora)

- Case studies técnicos largos
- Filosofía de management
- Diagramas de arquitectura
- CV descargable (puede sumarse después)
- Internacionalización

---

## Criterio de éxito

El visitante llega, scrollea hasta el fondo, y sale pensando "entendí quién es esta persona" — no "vi un portfolio bonito". El sitio prueba los rasgos de Lucas sin declararlos.
