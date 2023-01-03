'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Question extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Question.hasMany(models.Answer, {as: 'children', foreignKey: 'questionId'});
    }
  }
  Question.init({
    userId: DataTypes.STRING,
    question: DataTypes.STRING,
    isSolved: DataTypes.BOOLEAN,
  }, {
    sequelize,
    modelName: 'Question',
  });
  return Question;
};