const Sequelize = require('sequelize')
const db = require('../db')

const UserGroup = db.define('userGroup', {
  groupId: {
    type: Sequelize.INTEGER,
  },
  displayName: {
    type: Sequelize.STRING,
  },
  urlName: {
    type: Sequelize.STRING,
  },
  members: {
    type: Sequelize.INTEGER,
  },
  nextEventId: {
    type: Sequelize.STRING,
    get(){
      const event = this.getDataValue('nextEvent')
      return event.id
    }
  },
  nextEvent: {
    type: Sequelize.JSON,
  },
})

module.exports = UserGroup
