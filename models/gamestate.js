"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class GameState extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  GameState.init(
    {
      btnName: DataTypes.STRING,
      btnValue: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "GameState",
    }
  );

  GameState.associate = function (models) {
    GameState.belongsTo(models.Game, { foreignKey: "gameId" });
  };

  return GameState;
};
