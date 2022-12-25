const db = require("../models");
const jwt = require("jsonwebtoken");

const User = db.User;

const Game = db.Game;
const GameState = db.GameState;

const secret = "asdfasdfsadf";

class HomeController {
  constructor() {}

  static async profile(req, res, next) {
    let user = await User.findOne({
      where: { id: req?.user?.id },
    });
    return res.json(user);
  }
  // login
  static async login(req, res, next) {
    let user = await User.findOne({
      where: { email: req.body.email, password: req.body.password },
    });

    if (user?.dataValues) {
      const token = jwt.sign(user.dataValues, secret, {
        expiresIn: "5400s",
      });

      return res.json({ token });
    } else {
      return res.status(403).json({ error: "Not Allowed" });
    }
  }

  static async game(req, res, next) {
    return res.render("index");
  }

  static async index(req, res, next) {
    const result = await User.findAll({});
    return res.json(result);
  }
  static async creatUser(req, res, next) {
    let user = {
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      userName: req.body.userName,
    };
    const savedUser = await User.create(user);
    return res.json(savedUser);
  }
  static async findUser(req, res, next) {
    if (req.user.id == req.params.userId) {
      const user = await User.findOne({
        where: { id: req.params.userId },
      });

      return res.json(user);
    } else {
      return res.status(404).json({ error: "not found" });
    }
  }

  static async updateUser(req, res, next) {
    const user = req.user;
    let data = {
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      userName: req.body.userName,
    };

    const result = await User.update(data, {
      where: {
        id: user.id,
      },
    });
    return res.json(result);
  }
  static async deleteUser(req, res, next) {
    const user = req.user;
    const result = await User.destroy({
      where: {
        id: user.id,
      },
    });

    return res.json(result);
  }

  static async selectUser(req, res, next) {
    const user = req.user;
    const play = {
      player1Id: user.id,
      player2Id: req.params.userId,
      status: req.body.status,
      turn: req.body.turn,
    };

    const data = await Game.create(play);
    return res.json({ play, data });
  }
  static async gameNotification(req, res, next) {
    const user = req.user;
    const result = await Game.findAll({
      where: { player2Id: user.id },
      include: [
        { model: User, as: "Player1" },
        { model: User, as: "Player2" },
      ],
    });

    return res.json(result);
  }

  static async getGameId(req, res, next) {
    const user = req.user;
    const result = await Game.findAll({
      where: { player1Id: user.id },
      include: [
        { model: User, as: "Player1" },
        { model: User, as: "Player2" },
      ],
    });

    return res.json(result);
  }
  static async gameBoard(req, res, next) {
    const result = await Game.findOne({
      where: { id: req.params.gameId },
    });
    console.log(result);
    return res.json(result);
  }

  static async inprocesGame(req, res, next) {
    const user = req.user;
    const play = {
      player2Id: user.id,
      player1Id: req.params.userId,
      status: req.body.status,
    };
    await Game.update(play, {
      where: {
        player2Id: user.id,
      },
    });
    return res.json(play);
  }

  static async turnPlayer(req, res, next) {
    const user = req.user;
    const result = await Game.findOne({
      where: { id: req.params.gameId },
    });
    if (result?.turn == "player1") {
      if (result?.player1Id == user.id) {
        const turn = {
          turn: "player2",
        };
        await Game.update(turn, {
          where: {
            id: req.params.gameId,
          },
        });

        const move = {
          btnName: req.body.btnName,
          btnValue: "0",
          gameId: req.params.gameId,
        };
        await GameState.create(move);
        return res.json(move, turn);
      }
    } else if (result?.turn == "player2") {
      if (result?.player2Id == user.id) {
        const turn = {
          turn: "player1",
        };
        await Game.update(turn, {
          where: {
            id: req.params.gameId,
          },
        });

        const move = {
          btnName: req.body.btnName,
          btnValue: "X",
          gameId: req.params.gameId,
        };
        await GameState.create(move);
        return res.json(move, turn);
      }
    }
  }

  static async checkWinner(req, res, next) {
    const result = await GameState.findAll({
      include: Game,
      where: {
        gameId: req.params.gameId,
      },
      order: [`btnName`],
    });

    const winningConditions = [
      ["b1", "b2", "b3"],
      ["b4", "b5", "b6"],
      ["b7", "b8", "b9"],
      ["b1", "b4", "b7"],
      ["b2", "b5", "b8"],
      ["b3", "b6", "b9"],
      ["b1", "b5", "b9"],
      ["b3", "b5", "b7"],
    ];
    const gameState = {};
    result.forEach((state) => {
      gameState[state.btnName] = state.btnValue;
    });

    for (var i = 0; i < winningConditions.length; i++) {
      for (let i = 0; i <= 7; i++) {
        const winCondition = winningConditions[i];
        let a = gameState[winCondition[0]];
        let b = gameState[winCondition[1]];
        let c = gameState[winCondition[2]];

        if (a === b && b === c) {
          console.log(a);
          const play = {
            winner: a,
            status: "Complete",
          };
          console.log(play);
          await Game.update(play, {
            where: {
              id: req.params.gameId,
            },
          });

          return res.json({ a });
        }
      }
    }
  }
  catch(err) {
    console.log(err);
  }

  static async getAllValues(req, res, next) {
    const result = await GameState.findAll({
      include: Game,
      where: {
        gameId: req.params.gameId,
      },
    });

    return res.json(result);
  }

  static async deleteAllValues(req, res, next) {
    const result = await GameState.destroy({
      where: {
        gameId: req.params.gameId,
      },
    });

    return res.json(result);
  }
}

module.exports = HomeController;
