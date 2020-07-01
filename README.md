# EarthMC Package

Provides info on the EarthMC Minecraft server. 

## Installation
```bash
$ npm install earthmc
```

### Require the package

```js
var emc = require("earthmc")
```

## Usage Example (Discord Bot)

![ A test image](https://cdn.discordapp.com/attachments/657992790449455107/725391194192085073/emcDiscordBotExample.PNG "EarthMC Code Example")

## Methods

### Get Online Player (Promise)
```js
var player = await emc.getOnlinePlayer("PlayerName").then(player => { return player })

console.log(player)

// => { x: 0, y: 64, z: 0, isUnderground: true, nickname: 'PlayerNickname', name: 'PlayerName' } 
```

### Get Resident (Promise)
```js
var resident = await emc.getResident("ResidentName").then(resident => { return resident })

console.log(resident)

// => { name: 'ResidentName', townName: 'TownName', townNation: 'NationName', rank: 'Resident' }
// Ranks include Resident, Mayor and Nation Leader
```

### Get Town (Promise)
```js
var town = await emc.getTown("TownName").then(town => { return town })

console.log(town)

// => { area: 975, x: -352, z: -9904, name: 'TownName', nation: 'NationName', mayor: 'MayorName', residents: ['Resident', 'OtherResident', ...], pvp: false, mobs: false, public: false, explosion: false, fire: false, capital: true }
```

### Get Nation (Promise)
```js
var nation = await emc.getNation("NationName").then(nation => { return nation })

console.log(nation)

// => { name: 'NationName', residents: ['Resident', 'OtherResident', ...], towns: ['Town', 'OtherTown', ...], king: 'KingName', capitalName: 'CapitalName', capitalX: -352, capitalZ: -9904, area: 7289 }
```

### Get Townless (Promise)
```js
var townless = await emc.getTownless().then(array => { return array })

console.log(townless)

// => [{ x: 0, y: 64, z: 0, isUnderground: true, nickname: 'TownlessPlayer', name: 'TownlessPlayer' }, ...]
```

### Get Server Info (Promise)
```js
var serverInfo = await emc.getServerInfo().then(info => { return info })

console.log(serverInfo)

// => { serverOnline: true, online: 190, max: 200, towny: 139, townyOnline: true, storming: false, thundering: false, beta: 0, betaOnline: true, queue: 51 }
```

