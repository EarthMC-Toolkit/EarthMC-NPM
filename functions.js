var striptags = require("striptags")

function calcPolygonArea(X, Y, numPoints) 
{ 
    let area = 0					
    let j = numPoints-1		

    for (let i = 0; i < numPoints; i++)
    { 
        area = area +	(X[j]+X[i]) * (Y[j]-Y[i]) 
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

function editPlayerPropsArray(array)
{
    array.forEach(player => 
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

    return array
}

function editPlayerProps(player)
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

    return player
}

module.exports = 
{
    editPlayerProps,
    editPlayerPropsArray,
    calcPolygonArea,
    removeDuplicates,
    removeStyleCharacters
}