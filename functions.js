var striptags = require("striptags")

function calcPolygonArea(X, Z, numPoints) 
{ 
    let area = 0					
    let j = numPoints-1		

    for (let i = 0; i < numPoints; i++)
    { 
        area = area + (X[j]+X[i]) * (Z[j]-Z[i]) 
        j = i						
    }

    return Math.abs(area/2)
}

function removeDuplicates(array) 
{
    return array.filter((a, b) => array.indexOf(a) === b)
}

function removeStyleCharacters(string) 
{
    return string.replace(/(&amp;.|&[0-9kmnola-z])/g, "")
}

function editPlayerProps(playerObjOrArray)
{
    if (!playerObjOrArray) throw Error("Can't edit player props! The parameter is null or undefined.")

    if (playerObjOrArray instanceof Array)
    {
        // If empty array, return.
        if (playerObjOrArray.length === 0) return playerObjOrArray

        playerObjOrArray.forEach(player => 
        {
            if (player.world == "-some-other-bogus-world-")
            {
                player["isUnderground"] = true
            }
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
        })
        
        return playerObjOrArray
    }
    else if (playerObjOrArray instanceof Object)
    {
        // If empty object, return.
        if (Object.keys(playerObjOrArray).length === 0) return playerObjOrArray

        if (playerObjOrArray.world == "-some-other-bogus-world-")
        {
            playerObjOrArray["isUnderground"] = true
        }
        else playerObjOrArray["isUnderground"] = false

        playerObjOrArray['nickname'] = striptags(playerObjOrArray['name'])
        delete playerObjOrArray.name

        playerObjOrArray['name'] = playerObjOrArray['account']
        delete playerObjOrArray.account

        delete playerObjOrArray.world
        delete playerObjOrArray.sort
        delete playerObjOrArray.armor
        delete playerObjOrArray.health
        delete playerObjOrArray.type

        return playerObjOrArray
    }
    else
    {  
        throw Error("Can't edit player props! The type isn't an object or array.")
    }
}

module.exports = 
{
    editPlayerProps,
    calcPolygonArea,
    removeDuplicates,
    removeStyleCharacters
}