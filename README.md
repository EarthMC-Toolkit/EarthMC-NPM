# [**EarthMC-NPM**](https://emctoolkit.vercel.app/docs/npm)
An **unofficial** wrapper library for interacting with the [EarthMC Dynmap](https://earthmc.net/map/aurora/) API.<br>
This package is part of the [EarthMC Toolkit](https://emctoolkit.vercel.app) and provides extensive info on people, places and more.

## Install
```bash
npm i earthmc
```

or 

```bash
yarn add earthmc
```

## Basic Usage
View the full documentation [here](https://emctoolkit.vercel.app/docs/npm).

### Node
```js
import { Aurora } from 'earthmc' // ESM
const { Aurora } = require('earthmc') // CJS

const towns = await Aurora.Towns.all().catch(console.error)
console.log(towns.length)
```

### Browser
```js
<button onclick="townAmount()">Show town amount</button>

<script src="https://unpkg.com/earthmc@7.2.1/dist/bundle.js"></script>
<script>
window.townAmount = async function() {
  try {
    const towns = await earthmc.Aurora.Towns.all()
    alert(towns.length)
  }
  catch(e) {
    console.error(e)
  }
}
</script>
```