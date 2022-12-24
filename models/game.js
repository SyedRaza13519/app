"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Game extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Game.init(
    {
      status: DataTypes.STRING,
      turn: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Game",
    }
  );

  Game.associate = function (models) {
    Game.belongsTo(models.User, { as: "Player1", foreignKey: "player1Id" });
    Game.belongsTo(models.User, { as: "Player2", foreignKey: "player2Id" });
    Game.hasMany(models.GameState, { foreignKey: "gameId" });
  };

  return Game;
};
