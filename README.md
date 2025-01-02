# [**EarthMC-NPM**](https://www.npmjs.com/package/earthmc)
An **unofficial** wrapper library for interacting with the **EarthMC** map APIs.<br>
This package is part of the [EarthMC Toolkit](https://emctoolkit.vercel.app) and provides extensive info on people, places and more.

## Install
```bash
bun add earthmc
```

While I recommend [Bun](https://bun.sh) for its speed, you can also install the package with any other package manager.

PNPM ➜ `pnpm add earthmc`\
Yarn ➜ `yarn add earthmc`\
NPM (ew) ➜ `npm i earthmc`

## Import
By default, the available maps are exported and can be used like so:
```ts
import { Aurora } from 'earthmc' // ESM
const { Aurora } = require('earthmc') // CJS
```

However, you may want to create your own map instance to customize the expiry time of the cache.
```ts
import { Squaremap } from 'earthmc'

const Aurora = new Squaremap('aurora') // Defaults to `5000` (or 5s).
const Aurora = new Squaremap('aurora', 30 * 1000) // Keep cached for half a minute.
```

## Basic Usage
Visit the [documentation](https://emctoolkit.vercel.app/docs/npm) to use this library to its full potential.

```ts
const towns = await Aurora.Towns.all().catch(console.error)
console.log(towns.length)

// These calls are instant since the previous call to `all()` populated the cache.
const single = await Aurora.Towns.get('exampleName')
const many = await Aurora.Towns.get('town1', 'town2', 'town3', ...)
```

### GPS
In addition to the four main classes (Towns, Nations, Residents, Players), both maps also provide a GPS.
Here is an example of how you could use it.
```ts
// To avoid PVP, call `safestRoute` instead.
const route = await Aurora.GPS.fastestRoute({ x: town.x, z: town.z })
const desc = `Type **/n spawn ${route.nation.name}** and head **${route.direction}** for **${route.distance}** blocks.`
```

To continuously track a player, you can use the `track` method.
  - First parameter (player name) is **required**, but case insensitive.
  - Second parameter (interval) is optional. Defaults to `3000` milliseconds.
  - Third parameter (route) is optional. Defaults to `FASTEST`.
```ts
// Start tracking a player, with 5s delay, outputting the safest route.
const tracker = await Aurora.GPS.track("PlayerName", 5000, Routes.SAFEST).catch(e => {
    console.error("Error fetching player: " + e)
})

// Listen for any errors that may occur.
tracker.on('error', e => {
    console.error("An error occurred: " + e)
})

tracker.on('underground', (playerInfo) => {
    console.log("Player went underground - " + playerInfo)
})

tracker.on('locationUpdate', (routeInfo) => {
    console.log("Player's location updated - " + routeInfo)
})
```
