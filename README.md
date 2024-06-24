# [**EarthMC-NPM**](https://www.npmjs.com/package/earthmc)
An **unofficial** wrapper library for interacting with the [EarthMC Dynmap](https://earthmc.net/map/aurora/) API.<br>
This package is part of the [EarthMC Toolkit](https://emctoolkit.vercel.app) and provides extensive info on people, places and more.

## Install
```bash
bun add earthmc
```

While I recommend [Bun](https://bun.sh) for its speed, you can also install the package with any other package manager.

PNPM ➜ `pnpm add earthmc`\
Yarn ➜ `yarn add earthmc`\
NPM (ew) ➜ `npm i earthmc`

## Basic Usage
View the full documentation [here](https://emctoolkit.vercel.app/docs/npm).

```ts
import { Aurora } from 'earthmc' // ESM
const { Aurora } = require('earthmc') // CJS

const towns = await Aurora.Towns.all().catch(console.error)
console.log(towns.length)
```