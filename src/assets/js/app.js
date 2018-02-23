var currentPage = null;
var cast = null;
var castState = "closed";
var sessionState = "new";
var sessionToken;
var meetingName;
var voters;

// Routing
var routes = {
  "_description": "This file is used to define routing of the application.",
  "/": "landing",
  "#/": "landing",
  "": "landing",
  "#/auth": "auth",
  "#/stv": "stv",
  "#/blank": "blank",
  "#/credits": "credits",
  "#/loading": "loading"
};

function translateHash(hash) {
  if (hash === "") { return translateHash("/"); }
  if (routes[hash] != null) { return routes[hash]; }
  return "404";
}

function replacePage(id) {
  $('#page').fadeOut();
  $('#loader').fadeIn();
  $.ajax({
    method: 'GET',
    url: '/pages/' + id + '.html',
    success: function(data) { $('#page').html(data); },
    error: function(textStatus) { alert("AJAX failure: " + textStatus + ". Please try again."); },
    dataType: 'html'
  })
  currentPage = id;
  $('#loader').fadeOut();
  $('#page').fadeIn();
}

function addBallotCard(html) {
  $('#message-connected').fadeOut();
  $(html).hide().prependTo("#stream").fadeIn();
}

// auth page scripts
function checkToken() {
  $.ajax({
    url: 'http://democrapp.eutc.org.uk:8000/1/checktoken',
    method: 'POST',
    data: {
      "token": $('#authToken').val()
    },
    success: function(data) {
      console.log(data);
      if (data.success == true) {
        tokenValid(data);
        return;
      }
      alert("That voter token is invalid. Please try again.");
    }
  })
}

function tokenValid(data) {
  Cookies.set("session_token", data.session_token, { expires: 1 });
  sessionToken = data.session_token;
  openSocket();
}

function ballotRecieved(msg) {
  switch (msg.method){
    case "STV":
      console.log("[BALLOT] New using STV");
      var v = {
        ballot_id: msg.ballot_id,
        title: msg.title,
        desc: msg.desc,
        options: msg.options
      }
      voters.forEach(voter => {
        if ((voter.type != "proxy") || msg.proxies){
          v.proxy = (voter.type == "proxy");
          v.voter_id = voter.token;
          $.get("/templates/stv-card.mustache", function(template) {
            addBallotCard(Mustache.render(template, v));
          });
        }
      });
      break;
    case "YNA":
      console.log("[BALLOT] New using Y/N/A");
      var v = {
        ballot_id: msg.ballot_id,
        title: msg.title,
        desc: msg.desc,
        yes_id: "foo",
        no_id: "bar",
        abs_id: "zip"
      }
      voters.forEach(voter => {
        if ((voter.type != "proxy") || msg.proxies){
          v.proxy = (voter.type == "proxy");
          v.voter_id = voter.token;
          $.get("/templates/yna-card.mustache", function(template) {
            addBallotCard(Mustache.render(template, v));
          });
        }
      });
      break;
    default:
      console.error("[BALLOT] Unsupported method: \"" + msg.method + "\"");
      break;
  }
}

function submitSTVBallot(cardId) {
  var form = $('#' + cardId);
  form.addClass('disabled');
  var options = form.serializeArray();
  options.sort((a, b) => { return a.value > b.value; });
  var currentpref = 1;
  var out = {}
  options.forEach(option => {
    if (option.value == "") { /* ignore */ }
    else if (option.value % 1 != 0) { currentpref = -1; return;}
    else if (option.value == currentpref) { currentpref++; out[option.name] = option.value; }
    else { currentpref = -1; return; }
  })
  if (currentpref == -1) {
    alert("Please double check your preference entries, use consecutive whole numbers");
    return;
  }
  var message = {
    type: "ballot_form",
    ballot_id: form.attr('data-ballot'),
    session_token: sessionToken,
    votes: {}
    }
  message.votes[form.attr('data-voter')] = out;
  console.log("[BALLOT] Submitting ballot for " + cardId);
  console.log(message);
  cast.send(JSON.stringify(message));
}

// Websocket things
function castRecieved(msg) {
  console.log("[CAST] Recieved " + msg.type);
  console.log(msg);
  switch (msg.type) {
    case "auth_response":
      castState = "open";
      meetingName = msg.meeting_name;
      voters = msg.voters;
      appState = "connected";
      replacePage('main');
      break;
    case "ballot":
      ballotRecieved(msg);
      break;
    case "ballot_receipt":
      ballotReceipt(msg);
      break;
    case "ballot_closed":
      ballotClosed(msg);
      break;
    default:
      alert("There has been a communications error.");
      break;
  }
}

function openSocket() {
  cast = new WebSocket("ws://democrapp.eutc.org.uk:8000/");
  castState = "connecting";
  replacePage('loading');
  var hs = {
    "type": "auth_request",
    "session_token": Cookies.get("session_token")
  }
  console.log(hs);
  cast.onopen = function() {
    cast.send(JSON.stringify(hs));
    castState = "open/handshaking";
  }
  cast.onmessage = function(msg) { castRecieved(JSON.parse(msg.data)); } ;
  cast.onerror = function(e) { alert(e) };
  cast.onclose = function(e) { console.log(e); alert(e); };
}

// Page initialisation
function pageLoad() {
  if (Cookies.get("session_token") != undefined) {
    console.log("[INIT] Found existing session token.");
    sessionToken = Cookies.get("session_token");
    openSocket();
  }
}

$(document).ready(function() { replacePage(translateHash(window.location.hash)) });