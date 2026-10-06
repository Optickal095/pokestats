# PokéStats

Dashboard interactivo con datos de los 1.025 Pokémon: tipos, estadísticas base, generaciones y efectividad entre tipos. En español e inglés.

![Dashboard de PokéStats](docs/screenshot.png)

## Qué muestra

- **Indicadores:** cantidad de Pokémon, promedio de estadísticas totales, tipo más común, el más poderoso y el más rápido.
- **Filtros** por generación, tipo y categoría (legendarios y míticos o el resto). Todos los gráficos y números se actualizan juntos, y hacer clic en una barra de tipo también filtra.
- **Pokémon por tipo**, **poder por tipo** (diagrama de caja), **poder por generación** (con y sin legendarios), **legendarios vs. el resto**, **altura vs. peso** (escalas logarítmicas) y la **tabla de efectividad** entre los 18 tipos.
- **Cada gráfico tiene su vista de tabla**, para leer los datos sin depender del color ni del mouse.
- **Español e inglés**, con los nombres oficiales de Pokémon y tipos, y **modo claro y oscuro** según el sistema.

### Decisiones de visualización

- **Paleta validada** para daltonismo y contraste en ambos modos. Los gráficos usan dos colores como máximo, más gris de contexto.
- **Los colores tradicionales de los tipos solo aparecen junto al nombre del tipo** (filtros e indicadores). Con 18 tipos, el color por sí solo no permite distinguirlos.
- **Sin gráficos de doble eje:** "poder por generación" compara dos promedios en la misma escala.
- **La tabla de efectividad usa una escala divergente** centrada en ×1 (gris): azul para resistencias e inmunidades, rojo para súper eficaz, con el multiplicador escrito en cada celda.

## Stack

- **React 19 + TypeScript**, con Vite
- **Apache ECharts** para los gráficos, con un componente React propio (sin wrapper) y solo los módulos usados
- **react-i18next** para español e inglés
- **Vitest** para los tests

## Datos

Los datos vienen de [PokeAPI](https://pokeapi.co). La app no consulta la API en cada visita: un script descarga todo una vez y genera `public/data/pokedex.json` (~320 KB), como pide la [política de uso justo](https://pokeapi.co/docs/v2#fairuse) de PokeAPI. Así el dashboard carga rápido y no depende de que la API esté disponible.

```
PokeAPI (GraphQL, 1 consulta) → scripts/fetch-data.ts → src/data/transform.ts → public/data/pokedex.json → app
```

La limpieza (`src/data/transform.ts`) son funciones puras con tests:

- Una entrada por especie: se descartan las formas alternativas (ids desde 10001), aunque PokeAPI marque algunas como "por defecto", como Ursaluna Luna Sangrienta.
- Unidades convertidas: decímetros → metros y hectogramos → kilos.
- Nombres de Pokémon, tipos y generaciones en español e inglés.
- Tabla de efectividad entre los 18 tipos de combate, guardando solo los multiplicadores distintos de ×1.

## Desarrollo

```bash
npm install
npm run dev     # http://localhost:5173
npm run data    # vuelve a descargar los datos (solo cuando sale una generación nueva)
npm test
npm run build
```

## Hoja de ruta

- [x] Fase 1: pipeline de datos
- [x] Fase 2: dashboard (indicadores, filtros y gráficos), en español e inglés
- [ ] Fase 3: comparador y ficha de cada Pokémon
- [ ] Fase 4: publicación en GitHub Pages y tarjeta en el portfolio

---

Pokémon y sus nombres son marcas de Nintendo, Game Freak y The Pokémon Company. Proyecto personal sin fines comerciales.
