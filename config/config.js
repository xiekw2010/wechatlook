const devConfig = require('./config.local')

let config = Object.assign({}, devConfig)

// TODO: env judge
module.exports = config