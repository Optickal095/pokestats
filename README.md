# PokéStats

Dashboard interactivo con datos de los 1.025 Pokémon: tipos, estadísticas base, generaciones y efectividad entre tipos. En español e inglés.

> En construcción. Fase 1 lista: pipeline de datos.

## Stack

- **React 19 + TypeScript**, con Vite
- **Apache ECharts** para los gráficos
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
- [ ] Fase 2: dashboard (indicadores, filtros y gráficos)
- [ ] Fase 3: comparador y ficha de cada Pokémon
- [ ] Fase 4: español e inglés, diseño responsive y publicación en GitHub Pages

---

Pokémon y sus nombres son marcas de Nintendo, Game Freak y The Pokémon Company. Proyecto personal sin fines comerciales.
