const Aurora = require("./aurora"),
      Nova = require("./nova"),
      endpoint = require("./endpoint"),
      fn = require("./functions")

async function getServerData() {
    var Minecraft = require("minecraft-lib"),
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

    if (!!novaData) serverData["nova"] = novaData.currentcount
    if (!!auroraData) serverData["aurora"] = auroraData.currentcount
    
    if (serverData["online"] == 0 || !serverData["online"]) serverData["queue"] = 0
    else serverData["queue"] = serverData["online"] - serverData["nova"] - serverData["aurora"]

    return serverData
}

module.exports = {
    formatString: fn.formatString,
    getServerInfo,
    Aurora,
    Nova
}