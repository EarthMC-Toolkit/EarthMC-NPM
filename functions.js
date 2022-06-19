var striptags = require("striptags"),
    Diacritics = require("diacritic")

const removeDuplicates = array => array.filter((a, b) => array.indexOf(a) === b),
      removeStyleCharacters = string => string.replace(/(&amp;.|&[0-9kmnola-z])/g, "")

function formatString(str, removeAccents = false) {
    str = removeStyleCharacters(str) 
    return removeAccents ? Diacritics.clean(str) : str
}

function editPlayerProps(playerObjOrArray) {
    if (!playerObjOrArray) throw Error("Can't edit player props! The parameter is null or undefined.")

    if (playerObjOrArray instanceof Array) {
        if (playerObjOrArray.length === 0) return playerObjOrArray

        playerObjOrArray.forEach(player => { editPlayerProp(player) })

        return playerObjOrArray
    }
    else if (playerObjOrArray instanceof Object) {
        if (Object.keys(playerObjOrArray).length === 0) return playerObjOrArray
        return editPlayerProp(playerObjOrArray)
    }
    else throw Error("Can't edit player props! The type isn't an object or array.")
}

function editPlayerProp(player) {
    if (player.world == "-some-other-bogus-world-") player["isUnderground"] = true
    else player["isUnderground"] = false

    player['nickname'] = striptags(player['name'])
    delete player.name

    player['name'] = player['account']
    delete player.account

    delete player.world
    delete player.sort
    delete player.armor
    delete player.health
    delete player.type
}

function calcPolygonArea(X, Z, numPoints) { 
    let i = area = 0, j = numPoints-1		

    for (; i < numPoints; i++) { 
        area = area + (X[j] + X[i]) * (Z[j] - Z[i]) 
        j = i						
    }

    return Math.abs(area/2)
}

module.exports = {
    formatString,
    editPlayerProps,
    calcPolygonArea,
    removeDuplicates,
    removeStyleCharacters
}