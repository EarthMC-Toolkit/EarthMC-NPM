const Map = require('./Map'),
      endpoint = require("../utils/endpoint"),
      fn = require("../utils/functions"),
      { MCAPI } = require("mojang-lib"),
      OfficialAPI = require('../utils/api')

async function getServerData() {
    const serverData = await MCAPI.servers.get("play.earthmc.net").catch(err => console.error(err))
    
    return {
        serverOnline: !!serverData,
        online: serverData?.players?.online ?? 0,
        max: serverData?.players?.max ?? 0
    }
}

async function getServerInfo() {
    const serverData = await getServerData(),
          novaData = await endpoint.playerData("nova"),
          auroraData = await endpoint.playerData("aurora")

    const info = {
        ...serverData,
        nova: novaData.currentcount ?? 0,
        aurora: auroraData.currentcount ?? 0
    }
    
    return {
        queue: info.online < 1 ? 0 : info.online - info.aurora - info.nova,
        ...info
    }
}

module.exports = {
    formatString: fn.formatString,
    OfficialAPI, endpoint, getServerInfo,
    Errors: require('../utils/Errors'),
    Aurora: new Map('aurora'),
    Nova: new Map('nova')
}