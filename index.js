// @ts-nocheck
const Aurora = require("./aurora"),
      Nova = require("./nova"),
      endpoint = require("./endpoint")

async function getServerData() {
    var Minecraft = require("minecraft-lib"),
        serverData = await Minecraft.servers.get("play.earthmc.net").catch(err => { return err })
    
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

    if (novaData != null) serverData["nova"] = novaData.currentcount
    if (auroraData != null) serverData["aurora"] = auroraData.currentcount
    
    if (serverData["online"] == 0 || !serverData["online"]) serverData["queue"] = 0
    else serverData["queue"] = serverData["online"] - serverData["nova"] - serverData["aurora"]

    return serverData
}

module.exports = {
    getServerInfo,
    Aurora,
    Nova
}