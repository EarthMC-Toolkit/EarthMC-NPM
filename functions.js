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
        if (playerObjOrArray.length > 0) 
            return playerObjOrArray.map(p => editPlayerProp(p))
    }
    else return Object.keys(playerObjOrArray).length == 0 ? {} : editPlayerProp(playerObjOrArray)

    throw Error("Can't edit player props! The type isn't an object or array.")
}

const editPlayerProp = player => ({
    name: player.account,
    nickname: striptags(player.name),
    x: player.x, y: player.y, z: player.z,
    underground: player.world == 'earth' ? false : true
})

/**
 * Get the average position of all towns in a nation.
 * @param  {String} nationName Name of the nation.
 * @param  {Object[]} towns An array of towns.
 * @return {Object} Object with x, z keys.
 */
function calcArea(X, Z, numPoints, divisor = 256) { 
    let i = area = 0, j = numPoints-1		

    for (; i < numPoints; i++) { 
        area += (X[j] + X[i]) * (Z[j] - Z[i]) 
        j = i						
    }

    return Math.abs(area/2) / divisor
}

/**
 * Get the average position of all towns in a nation.
 * @param  {String} nationName Name of the nation.
 * @param  {Object[]} towns An array of towns.
 * @return {Object} Object with x, z keys.
 */
async function getAveragePos(nationName, towns) {
    if (!towns) return "Error getting average position: 'towns' parameter not defined!"

    let nationTowns = towns.filter(t => t.nation?.toLowerCase() == nationName.toLowerCase())
    const average = (arr, key) => arr.map(obj => obj[key]).reduce((a, b) => a+b) / arr.length
    
    return {
        x: average(nationTowns, 'x'),
        z: average(nationTowns, 'z')
    } 
}

module.exports = {
    formatString,
    editPlayerProps,
    calcArea,
    removeDuplicates,
    removeStyleCharacters,
    getAveragePos
}