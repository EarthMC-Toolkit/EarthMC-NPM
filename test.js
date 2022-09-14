const { Aurora } = require('./src/Main')

Aurora.Towns.get('Coober_Pedy').then(arr => console.log(arr))
//Nova.getTowns().then(arr => console.log(arr.length))