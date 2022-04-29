// @ts-nocheck
const Aurora = require("./aurora"),
      Nova = require("./nova"),
      endpoint = require("./endpoint")

async function getServerData() {
    var Minecraft = require("minecraft-lib"),
        serverData = await Minecraft.servers.get("play.earthmc.net").catch(err => { return err })
    
    return {
        serverOnline: !serverData ? false : true,
        online: !serverData?.players ? 0 : serverData.players.online,
        max: !serverData?.players ? 0 : serverData.players.max
    }
}
    
async function getServerInfo() {
    let serverData = await getServerData(),
        novaData = await endpoint.playerData("nova"),
        auroraData = await endpoint.playerData("aurora")

    if (novaData != null) {
        serverData["nova"] = novaData.currentcount
        serverData["storming"] = novaData.hasStorm
        serverData["thundering"] = novaData.isThundering
    }

    if (auroraData != null) {
        serverData["aurora"] = auroraData.currentcount
        serverData["storming"] = auroraData.hasStorm
        serverData["thundering"] = auroraData.isThundering
    }
        
    if (serverData["online"] == 0 || !serverData["online"]) serverData["queue"] = 0
    else serverData["queue"] = serverData["online"] - serverData["nova"] - serverData["aurora"]

    return serverData
}

module.exports = {
    getServerInfo,
    Aurora,
    Nova
}