const Map = require('./Map'),
      endpoint = require("../utils/endpoint"),
      fn = require("../utils/functions")

async function getServerData() {
    let Minecraft = require("minecraft-lib"),
        serverData = await Minecraft.servers.get("play.earthmc.net").catch(console.error)
    
    return {
        serverOnline: !serverData ? false : true,
        online: serverData?.players?.online ?? 0,
        max: serverData?.players?.max ?? 0
    }
}

async function getServerInfo() {
    let serverData = await getServerData(),
        novaData = await endpoint.playerData("nova"),
        auroraData = await endpoint.playerData("aurora")

    let info = {
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
    endpoint, getServerInfo,
    Errors: require('../utils/Errors'),
    Aurora: new Map('aurora'),
    Nova: new Map('nova')
}