"use strict"

const localhost = process.env.MONGODB_PORT_27017_TCP_ADDR || 'localhost'
const port = process.env.MONGODB_PORT_27017_TCP_PORT || '27017'

module.exports = {
  mongo: localhost + ':' + port + '/wechatlook'
}