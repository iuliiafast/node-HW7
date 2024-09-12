'use strict';

import fs from 'fs';
import path from 'path';
import { Sequelize, DataTypes } from 'sequelize';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = import(`${__dirname}/../config/config.json`).then(config => config[env]);

const db = {};

let sequelize;
config.then(conf => {
  if (conf.use_env_variable) {
    sequelize = new Sequelize(process.env[conf.use_env_variable], conf);
  } else {
    sequelize = new Sequelize(conf.database, conf.username, conf.password, conf);
  }

  fs
    .readdirSync(__dirname)
    .filter(file => {
      return (
        file.indexOf('.') !== 0 &&
        file !== basename &&
        file.slice(-3) === '.js' &&
        file.indexOf('.test.js') === -1
      );
    })
    .forEach(file => {
      import(path.join(__dirname, file)).then(modelModule => {
        const model = modelModule.default(sequelize, DataTypes);
        db[model.name] = model;
      });
    });

  Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
      db[modelName].associate(db);
    }
  });

  db.sequelize = sequelize;
  db.Sequelize = Sequelize;
});

export default db;
