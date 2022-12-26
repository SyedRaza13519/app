var playerWin = false;
var userId = undefined;
var users = undefined;
var myinterval = undefined;
var myinterval2 = undefined;
var posts = undefined;
var gameId = undefined;
var postId = undefined;
var authToken = getCookie("auth-Token");
var btnIds = undefined;
var authUser = undefined;
var emailPattern = /^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/;
var passwordPattern = /^[A-Za-z]\w{4,14}$/;

function setCookie(cname, cvalue, exdays) {
  const d = new Date();
  d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
  let expires = "expires=" + d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

var getLogedInUser = async () => {
  if (!!authToken) {
    var tbody = document.getElementById("users");
    const data = await fetch(`/profile`, {
      headers: {
        "content-type": "application/json",
        Authorization: "Bearer " + authToken,
      },
    });
    const user = await data.json();

    if (user) {
      authUser = user;
      tbody.innerHTML = "";

      tbody.innerHTML += `<tr>
    <td>${user.name}</td></tr><tr>
    <td>${user.email}</td></tr><tr>
    <td>${user.password}</td></tr><tr>
    <td>${user.userName}</td></tr>
    ${
      user.id === authUser?.id
        ? `<tr><td><button class="btn btn-danger" onclick="deleteUser('${user.id}')"  data-dismiss="modal" >Delete</button></td></tr><tr>
        <td><button class="btn btn-primary" onclick="showEditUser()"   data-toggle="modal"
        data-target="#updateuser" >Edit</button></td>
        `
        : `<td></td><td></td>`
    }
    

    </tr>`;
    }
  } else {
    logout();
    authUser = undefined;
  }
};

var login = async () => {
  let email = document.getElementById("email-login").value;
  let password = document.getElementById("password-login").value;
  let msgLogin = document.getElementById("msg-login");
  document.getElementById("email-login").value = "";
  document.getElementById("password-login").value = "";

  document.getElementById("msg-login").innerHTML = "";
  if (password != "" && email != "") {
    const data = await fetch(`/login/`, {
      method: "post",
      headers: {
        "content-type": "application/json",
        Authorization: "Bearer " + authToken,
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const res = await data.json();
    const token = res?.token;
    if (token) {
      setCookie("auth-Token", token);
      authToken = token;
      game();

      removeFromIfLogedIn();
    } else {
      msgLogin.innerHTML = "wrong input";
    }
  } else if (password == "" && email == "") {
    msgLogin.innerHTML = "Entere email and  Password";
  } else if (password == "") {
    msgLogin.innerHTML = "Entere   Password";
  } else if (email == "") {
    msgLogin.innerHTML = "Entere email";
  }
};

var logout = async () => {
  setCookie("auth-Token", "");
  authToken = undefined;
  if ((authToken = undefined)) {
  }
  welcome.innerHTML = "";

  removeFromIfLogedIn();
};
var saveUser = async () => {
  let name = document.getElementById("name").value;
  let email = document.getElementById("email").value;

  let password = document.getElementById("password").value;
  let userName = document.getElementById("userName").value;

  let msg = document.getElementById("msg");
  msg.innerHTML = "";
  document.getElementById("name").value = "";
  document.getElementById("email").value = "";
  document.getElementById("password").value = "";
  document.getElementById("userName").value = "";

  if (name != "" && email != "" && password != "" && userName != "") {
    if (emailPattern.test(email)) {
      if (passwordPattern.test(password)) {
        if (!userId) {
          await fetch(`/users/`, {
            method: "post",

            headers: {
              "content-type": "application/json",
            },

            body: JSON.stringify({ name, email, password, userName }),
          });
          msg.innerHTML = `<h4 class="text-success">Sign Up SuccessFully</h4>`;
        }
      } else {
        msg.innerHTML = "password must have at least 5 characters";
      }
    } else {
      msg.innerHTML = "email is invalid";
    }
  } else if (name == "" && email == "" && password == "" && userName == "") {
    msg.innerHTML = "Entere your data in the following input fields";
  } else if (name == "") {
    msg.innerHTML = "Entere Name";
  } else if (email == "") {
    msg.innerHTML = "Entere email";
  } else if (userName == "") {
    msg.innerHTML = "Entere UserName";
  } else if (password == "") {
    msg.innerHTML = "Entere   Password";
  }

  userId = undefined;
};

var showEditUser = () => {
  document.getElementById("name-update").value = authUser?.name;
  document.getElementById("email-update").value = authUser?.email;
  document.getElementById("userName-update").value = authUser?.userName;

  document.getElementById("password-update").value = authUser?.password;
};

var updateUser = async () => {
  if (!!authToken) {
    let name = document.getElementById("name-update").value;
    let email = document.getElementById("email-update").value;
    let password = document.getElementById("password-update").value;
    let userName = document.getElementById("userName-update").value;
    document.getElementById("name-update").value = "";
    document.getElementById("email-update").value = "";
    document.getElementById("password-update").value = "";
    document.getElementById("userName-update").value = "";
    if (name != "" && email != "" && password != "" && userName != "") {
      if (emailPattern.test(email)) {
        await fetch(`/update-account`, {
          method: "put",

          headers: {
            "content-type": "application/json",
            Authorization: "Bearer " + authToken,
          },

          body: JSON.stringify({ name, email, password, userName }),
        });
      } else {
        window.alert("email in formate is required");
      }
    } else if (name == "" || email == "" || password == "" || userName == "") {
      window.alert("All input fields must be provided");
    }
  }
  userId = undefined;
  getLogedInUser();
};

var deleteUser = async (userId) => {
  if (!!authToken) {
    await fetch(`/remove-account/`, {
      method: "delete",
      headers: {
        "content-type": "application/json",
        Authorization: "Bearer " + authToken,
      },
    });
    logout();

    removeFromIfLogedIn();
  }
};
var game = async () => {
  const welcome = document.getElementById("welcome");
  const player2Id = document.getElementById("player2Id");

  if (authUser?.name) {
    welcome.innerHTML = authUser?.name;
  } else {
    welcome.innerHTML = "";
  }

  if (!!authToken) {
    const data = await fetch("/users/", {
      headers: {
        Authorization: "Bearer " + authToken,
      },
    });

    const users = await data.json();
    player2Id.innerHTML = "";
    users.forEach((user) => {
      player2Id.innerHTML += `
      <div class="d-flex mt-3 ">
      <input type="hidden" id="turn" value="player2" >
          <input type="hidden" id="status" value="Pending">
          <input type="hidden" id="winner" value="No">
          <input class="text" value="${user.name}">
          <button class="" onclick="selectUser(${user.id})">Sent Request</button>
         
        
        
        `;
    });
  }
  getGameId();
  notification();
};

var getGameId = async () => {
  if (!!authToken) {
    const data = await fetch("/getGameId/", {
      headers: {
        Authorization: "Bearer " + authToken,
      },
    });

    const games = await data.json();
    const player1Id = document.getElementById("myReq");
    const completed = document.getElementById("completed");
    games.forEach((game) => {
      if (game?.status != "Complete") {
        player1Id.innerHTML += `
      <div class="d-flex  mt-3"><input class="" value="${game.Player2.name}">
      
              <button class="" onclick="gameBoard(${game.id}); ">Start Game</button>
              </div>
            
            
            `;
      }
      if (game?.status == "Complete") {
        completed.innerHTML += `<div class="d-flex mt-3 col-10"><input class="col-5" type="text" id="status" value="${game.status}" > <input class="col-5" value=" ${game.Player1.name}">
        <button class="" onclick="gameBoard(${game.id} ); ">Start</button> </div>`;
      }
    });
  }
};
var notification = async () => {
  const submiter = document.getElementById("myReq");

  if (!!authToken) {
    const data = await fetch("/game-notification/", {
      headers: {
        Authorization: "Bearer " + authToken,
      },
    });

    const games = await data.json();

    const completed = document.getElementById("completed");
    games.forEach((game) => {
      if (game?.status != "Complete") {
        submiter.innerHTML += `
          
          <div class="d-flex mt-3 col-4"><input type="hidden" id="status" value="${game.status}" > <input value=" ${game.Player1.name}">
          <button class="" onclick="updateStatus(${game.Player1.id},${game.id} ); ">Start</button></div>
          
        
        `;
      }
      if (game?.status == "Complete") {
        completed.innerHTML += `<div class="d-flex mt-3 col-10"><input class="col-5" type="text" id="status" value="${game.status}" > <input class="col-5" value=" ${game.Player1.name}">
        <button class="" onclick="gameBoard(${game.id} ); ">Start</button></div>`;
      }
    });
  }
};
var selectUser = async (userId) => {
  if (!!authToken) {
    const status = document.getElementById("status").value;
    const turn = document.getElementById("turn").value;
    const winner = document.getElementById("winner").value;

    await fetch(`/game/${userId}`, {
      method: "post",

      headers: {
        "content-type": "application/json",
        Authorization: "Bearer " + authToken,
      },

      body: JSON.stringify({ status, turn, winner }),
    });
    notification();
    setInterval(notification, 3000);
  }
};

var updateStatus = async (pId, nId) => {
  userId = pId;
  gameId = nId;

  if (!!authToken) {
    const status = document.getElementById("status").value;
    status.value = "";
    await fetch(`/inprocess/${userId}`, {
      method: "put",

      headers: {
        "content-type": "application/json",
        Authorization: "Bearer " + authToken,
      },

      body: JSON.stringify({ status: "Inprocess" }),
    });
    gameBoard(gameId);
  }
};

var gameBoard = async (gameId) => {
  document.getElementById("data-request").style.display = "none";
  document.getElementById("data-Game").style.display = "block";
  if (!!authToken) {
    document.getElementById("data-Game").innerHTML = `
    <div class="container">
          <h3>WELCOME TO MY GAME</h3>
          <h4>Designed By: Syed Raza</h4>
          <div id="playerTurn"><h4></h4></div>
        </div>
    <div class="container ">
      <div class="d-flex gap-2" id="shows" >
        <div class="group ">
          <button id="b1" onclick=" btn('b1',${gameId});" name="b1"></button>
        </div>
        <div class="group">
          <button id="b2" onclick=" btn('b2',${gameId});" name="b2"></button>
        </div>
        <div class="group">
          <button id="b3" onclick="btn('b3',${gameId});" name="b3"></button>
        </div>
      </div>
      <div class="d-flex gap-2">
        <div class="group">
          <button id="b4" onclick="btn('b4',${gameId});" name="b4"></button>
        </div>
        <div class="group">
          <button id="b5" onclick="btn('b5',${gameId});" name="b5"></button>
        </div>
        <div class="group">
          <button id="b6" onclick="btn('b6',${gameId});" name="b6"></button>
        </div>
      </div>
      <div class="d-flex gap-2">
        <div class="group">
          <button id="b7" onclick="btn('b7',${gameId});" name="b7"></button>
        </div>
        <div class="group">
          <button id="b8" onclick="btn('b8',${gameId});" name="b8"></button>
        </div>
        <div class="group">
          <button id="b9" onclick="btn('b9',${gameId});" name="b9"></button>
        </div>
      </div>
    </div>
    <div class="container">
      <h3 id="win">Try to be a Winner</h3>
      
    </div>`;

    const data = await fetch(`/gameBoard/${gameId}`, {
      headers: {
        Authorization: "Bearer " + authToken,
      },
    });

    const games = await data.json();

    const playerTurn = document.getElementById("playerTurn");

    if (games?.turn) {
      playerTurn.innerHTML = games.turn;
    }
    if (games?.winner != "No") {
      window.alert(games?.winner);
      disableAll();
    }
  }

  showValues(gameId);
  myinterval = setInterval(function () {
    showValues(gameId);
  }, 2000);
};

var btn = async (id, gameId) => {
  let btnName = document.getElementById(id).name;
  let btnValue = document.getElementById(id);

  let btnvalue = btnValue.innerText;
  if (!!authToken) {
    await fetch(`/turnPlayer/${gameId}`, {
      method: "post",

      headers: {
        "content-type": "application/json",
        Authorization: "Bearer " + authToken,
      },

      body: JSON.stringify({ btnName, btnvalue }),
    });
  }
  showValues(gameId);
};

var showValues = async (gameId) => {
  if (authUser?.name) {
    welcome.innerHTML = authUser?.name;
  } else {
    welcome.innerHTML = "";
  }

  if (!!authToken) {
    const data = await fetch(`/getAllValues/${gameId}`, {
      headers: {
        Authorization: "Bearer " + authToken,
      },
    });

    const moves = await data.json();

    moves.forEach((move) => {
      const btn = document.getElementById(move.btnName);
      document.getElementById("playerTurn").innerHTML = move.Game.turn;
      if (btn) {
        btn.innerText = move.btnValue;
        btn.disabled = true;
      }
    });
    checkWinner(gameId);
  }
};

var checkWinner = async (gameId) => {
  cocsole.log("wwww");
  if (authUser?.name) {
    welcome.innerHTML = authUser?.name;
  } else {
    welcome.innerHTML = "";
  }
  const result = document.getElementById("win");
  const status = undefined;
  const winner = undefined;
  if (!!authToken) {
    const data = await fetch(`/checkWinner/${gameId}`, {
      method: "put",

      headers: {
        "content-type": "application/json",
        Authorization: "Bearer " + authToken,
      },

      body: JSON.stringify({ status, winner }),
    });

    const wons = await data.json();

    if (wons?.a == "X") {
      window.alert(wons.game.player2.name + " " + "Player Won");
      result.innerHTML = `${wons.a} Player Is Winner`;

      disableAll();
      myStop();
    }
  }
};

function myStop() {
  clearInterval(myinterval);
  clearInterval(notification);
}
function disableAll() {
  document.getElementById("b1").disabled = true;
  document.getElementById("b2").disabled = true;
  document.getElementById("b3").disabled = true;
  document.getElementById("b4").disabled = true;
  document.getElementById("b5").disabled = true;
  document.getElementById("b6").disabled = true;
  document.getElementById("b7").disabled = true;
  document.getElementById("b8").disabled = true;
  document.getElementById("b9").disabled = true;
}

var deleteGameState = async (gameId) => {
  if (!!authToken) {
    await fetch(`/getAllValues/${gameId}`, {
      method: "delete",
      headers: {
        "content-type": "application/json",
        Authorization: "Bearer " + authToken,
      },
    });

    gameBoard(gameId);
  }
};
var removeFromIfLogedIn = async () => {
  msg.innerHTML = "";
  if (!!authToken) {
    await getLogedInUser();

    game();

    document.getElementById("btn-login").style.display = "none";
    document.getElementById("login").style.display = "none";
    document.getElementById("btn-logout").style.display = "block";
    document.getElementById("welcm").style.display = "block";
    document.getElementById("btn-signup").style.display = "none";
    document.getElementById("game").style.display = "none";
    document.getElementById("profile").style.display = "block";

    document.getElementById("data-request").style.display = "block";
  } else {
    document.getElementById("btn-login").style.display = "block";
    document.getElementById("btn-logout").style.display = "none";
    document.getElementById("btn-signup").style.display = "block";
    document.getElementById("profile").style.display = "none";
    document.getElementById("welcm").style.display = "none";
    document.getElementById("game").style.display = "none";

    document.getElementById("data-request").style.display = "none";
  }
};

removeFromIfLogedIn();
