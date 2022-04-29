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
        townyData = endpoint.mapData("nova")

    if (townyData != null) {
        serverData["towny"] = townyData.currentcount
        serverData["storming"] = townyData.hasStorm
        serverData["thundering"] = townyData.isThundering
    }
        
    if (serverData["online"] == 0 || !serverData["online"]) serverData["queue"] = 0
    else serverData["queue"] = serverData["online"] - serverData["towny"]

    return serverData
}

module.exports = {
    getServerInfo,
    Aurora,
    Nova
}