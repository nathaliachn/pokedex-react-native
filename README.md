# Pokédex

Aplicación Pokédex desarrollada con React Native, Expo y TypeScript. Usa PokeAPI
para consultar Pokémon.

## Requisitos

- Node.js 20 o superior.
- npm.

## Instalación

```sh
git clone https://github.com/nathaliachn/pokedex-react-native.git
cd pokedex-react-native
npm install
```

Para una instalación reproducible también se puede usar `npm ci`.

## Ejecutar el proyecto

Expo gestiona el desarrollo y la ejecución en dispositivos o simuladores.

```sh
npm start
npm run android
npm run ios
```

`npm start` inicia Expo. Los otros comandos inician Expo directamente con el
destino Android o iOS correspondiente y requieren el entorno local de desarrollo
con el simulador o emulador de esa plataforma.

## Pruebas

```sh
npm test
```

El proyecto cuenta con **35 pruebas unitarias distribuidas en 9 suites**, ejecutadas
con el test runner nativo de Node.js. Esta decisión mantiene la estrategia de
testing liviana y sin dependencias adicionales, en línea con la indicación del
challenge de minimizar el uso de librerías externas.

Las pruebas cubren casos de uso, integración con PokeAPI, transformación de datos,
paginación, persistencia y fallback offline, búsqueda exacta y filtrado local.

## Calidad de código

```sh
npm run typecheck
npm run lint
npm run format:check
npm run format
```

- `typecheck` verifica los tipos con TypeScript.
- `lint` ejecuta ESLint con la configuración de Expo.
- `format:check` comprueba el formato con Prettier sin modificar archivos.
- `format` aplica el formato de Prettier.

## CI

GitHub Actions ejecuta automáticamente las comprobaciones de calidad en cada
push y pull request.

## Estructura

```text
src/
  domain/
  data/
  features/
  navigation/
  shared/
```

La arquitectura técnica y las decisiones de diseño se documentan por separado
como parte de la entrega de la evaluación.

## Fuente de datos

Los datos provienen de [PokeAPI](https://pokeapi.co/). Su documentación está
disponible en [pokeapi.co/docs/v2](https://pokeapi.co/docs/v2).
