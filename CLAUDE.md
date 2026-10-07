# PokéStats

Dashboard React + TypeScript (Vite) con datos de los 1.025 Pokémon de PokeAPI. Eduardo lo pidió en React a propósito (su portfolio es Angular).

## Arquitectura (obligatoria)

Clean Architecture; ver la sección "Arquitectura" del README.

- `src/domain/`: TypeScript puro (tipos, filtros, cálculos). Sin React, ECharts, i18n ni `fetch`.
- `src/application/`: puertos (`ports/`) y casos de uso (`use-cases/`). Clases planas.
- `src/infrastructure/`: adaptadores. `node/` usa `fs` y está excluido de `tsconfig.app.json` (lo revisa `tsconfig.node.json` a través del script).
- `src/presentation/`: React. Los componentes no hacen `fetch` ni calculan agregados: piden datos al dominio, arman la configuración con funciones de `charts/options/` y dibujan.
- Raíces de composición: `src/main.tsx` (app) y `scripts/fetch-data.ts` (pipeline). Ningún otro archivo instancia adaptadores.

Estilo: sin punto y coma, comillas simples. `erasableSyntaxOnly` está activo: nada de propiedades en el constructor (`constructor(private x)`), ni enums, ni namespaces; declara los campos explícitamente.

## Visualización

Sigue la skill `dataviz`: paleta de 2 colores validada (más gris de contexto), los 18 colores de tipo solo junto al nombre del tipo, sin doble eje, vista de tabla en cada gráfico, modo claro/oscuro.

## Comandos

```bash
npm run dev
npm run data     # vuelve a generar public/data/pokedex.json desde PokeAPI (1 consulta GraphQL)
npm test
npm run lint
npm run build
```

Las capturas con puppeteer de página completa salen "aplastadas" (ECharts se redimensiona con animación durante la captura): usa una ventana alta en vez de `fullPage`.
