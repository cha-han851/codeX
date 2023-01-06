const fs = require('fs');

module.exports = {
  development: {
    "username": "root",
    "password": "OTw#}mrq5Br-UR)",
    "database": "knowledge_tank",
    "host": "127.0.0.1",
    "dialect": "mysql"
  },
  production: {
    "use_env_variable": 'DB_CONNECTION_URI',
    dialect: 'postgres',
    dialectOptions: {
      bigNumberStrings: true,
      ssl: {
        require: 'true'
      }
    },
    dialect: 'postgres'
  }
};

