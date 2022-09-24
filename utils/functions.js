var striptags = require("striptags"),
    Diacritics = require("diacritic"),
    { NotFound } = require("./Errors")

const removeDuplicates = arr => [...new Set(arr)],
      removeStyleCharacters = string => string.replace(/(&amp;.|&[0-9kmnola-z])/g, "")

function formatString(str, removeAccents = false) {
    str = removeStyleCharacters(str) 
    return removeAccents ? Diacritics.clean(str) : str
}

function editPlayerProps(props) {
    if (!props) return Error("Can't edit player props! The parameter is null or undefined.")

    if (props instanceof Array) return props.length > 0 ? props.map(p => editPlayerProp(p)) : []
    if (props instanceof Object) return Object.keys(props).length == 0 ? editPlayerProp(props) : {}

    return new TypeError("Can't edit player props! Type isn't of object or array.")
}

const editPlayerProp = player => ({
    name: player.account,
    nickname: striptags(player.name),
    x: player.x, y: player.y, z: player.z,
    underground: player.world != 'earth'
})

function calcArea(X, Z, numPoints, divisor = 256) { 
    let i = area = 0, j = numPoints-1		
    for (; i < numPoints; i++) { 
        area += (X[j] + X[i]) * (Z[j] - Z[i]) 
        j = i						
    }

    return Math.abs(area / 2) / divisor
}

async function getAveragePos(nationName, towns) {
    if (!towns) return "Error getting average position: 'towns' parameter not defined!"

    let nationTowns = towns.filter(t => t.nation?.toLowerCase() == nationName.toLowerCase())
    const average = (arr, key) => arr.map(obj => obj[key]).reduce((a, b) => a+b) / arr.length
    
    return {
        x: average(nationTowns, 'x'),
        z: average(nationTowns, 'z')
    } 
}

const asBool = str => str == "true" ? true : false,
      range = args => Math.round((Math.max(args) + Math.min(args)) / 2),
      sqr = (a, b, range) => Math.hypot(a.x - b.x, a.z - b.z) <= range

const getExisting = (a1, a2) => {
    const filter = x => a1.find(e => x.toLowerCase() == e.name.toLowerCase()) ?? NotFound(x)
    let arr = a2.flat().map(x => filter(x))

    return arr.length > 1 ? arr : arr[0] 
}

const hypot = (num, args) => {
    let [input, radius] = args
    return num <= (input + radius) && num >= (input - radius)
}

module.exports = {
    sqr,
    range,
    hypot,
    asBool,
    getExisting,
    formatString,
    editPlayerProps,
    calcArea,
    removeDuplicates,
    removeStyleCharacters,
    getAveragePos,
}