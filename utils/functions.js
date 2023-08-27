var striptags = require("striptags"),
    Diacritics = require("diacritic"),
    { NotFound } = require("./Errors")

const removeDuplicates = arr => [...new Set(arr)]

const stripInvalidChars = string => {
    return string.replace(/((&#34)|(&\w[a-z0-9].|&[0-9kmnola-z]));/g, "")
        .replace(/&quot;|&#039;/g, '"')
}

function formatString(str, removeAccents = false) {
    str = stripInvalidChars(str) 
    return removeAccents ? Diacritics.clean(str) : str
}

function editPlayerProps(props) {
    if (!props) return Error("Can't edit player props! The parameter is null or undefined.")

    if (props instanceof Array) return props.length > 0 ? props.map(p => editPlayerProp(p)) : []
    if (props instanceof Object) return Object.keys(props).length >= 6 ? editPlayerProp(props) : {}

    return new TypeError("Can't edit player props! Type isn't of object or array.")
}

const editPlayerProp = player => ({
    name: player.account,
    nickname: striptags(player.name),
    x: player.x, y: player.y, z: player.z,
    underground: player.world != 'earth'
})

function calcArea(X, Z, numPoints, divisor = 256) { 
    let i = 0, j = numPoints - 1,
        area = 0
    
    for (; i < numPoints; i++) { 
        area += (X[j] + X[i]) * (Z[j] - Z[i]) 
        j = i
    }

    return Math.abs(area / 2) / divisor
}

function averageNationPos(name, towns) {
    const nationTowns = towns.filter(t => t.nation?.toLowerCase() == name.toLowerCase())
    return getAveragePos(nationTowns)
}

function getAveragePos(arr) {
    if (!arr) return "Error getting average position: 'towns' parameter not defined!"
    
    return {
        x: average(arr, 'x'),
        z: average(arr, 'z')
    } 
}

const asBool = str => str == "true",
      range = args => Math.round((Math.max(...args) + Math.min(...args)) / 2),
      average = (arr, key) => arr.map(obj => obj[key]).reduce((a, b) => a+b) / arr.length,
      sqr = (a, b, range) => Math.hypot(a.x - b.x, a.z - b.z) <= range

const getExisting = (a1, a2, key) => {
    const filter = x => a1.find(e => x?.toLowerCase() == e[key]?.toLowerCase()) ?? NotFound(x),
          arr = a2.flat().map(x => filter(x))

    return arr.length > 1 ? arr : arr[0] 
}

const hypot = (num, args) => {
    let [input, radius] = args
    return num <= (input + radius) && num >= (input - radius)
}

const manhattan = (x1, z1, x2, z2) => Math.abs(x2 - x1) + Math.abs(z2 - z1)
const euclidean = (x1, z1, x2, z2) => 
    Math.sqrt(Math.pow(x2 - x1, 2) + 
    Math.pow(z2 - z1, 2))

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
    stripInvalidChars,
    getAveragePos,
    averageNationPos,
    euclidean, 
    manhattan
}