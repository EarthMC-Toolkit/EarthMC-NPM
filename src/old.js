async function getJoinableNations(townName) {
    let town = await getTown(townName)
    if (!town || town == "That town does not exist!") return town
    
    let nations = await getNations()
    if (!nations) return null

    function joinable(n) { return Math.hypot(n.capitalX - town.x, n.capitalZ - town.z) <= 3500 && town.nation == "No Nation" }
    return nations.filter(nation => joinable(nation))
}