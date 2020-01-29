<template>
    <transition name="fade">
        <div v-if="sessionState == 'new'" key="connecting" class="container">
            <div class="message">
                <i class="i-main fa fa-user-circle-o fa-3x"></i>
                <h5>Hold on a second - we're just getting you connected.</h5>
                <ul class="fa-ul">
                    <li><i class="fa fa-li fa-check-square"></i> Verifying token</li>
                    <li><i class="fa fa-li fa-circle-o-notch fa-spin"></i> Starting session</li>
                    <li><i class="fa fa-li fa-square"></i> Loading meeting data</li>
                </ul>
            </div>
        </div>
        <div v-else-if="sessionState == 'connected'" key="working" class="container">
            <h1>{{meetingName}}</h1>

            <div id="alerts" class="container"></div>

            <div id="stream" class="container">
                <div id="message-connected" class="message">
                    <img src="/assets/img/ballot_paper.svg"/>
                    <h5>You're connected.</h5>
                    <p>Ballot papers will appear here when the vote is opened.</p>
                    <p class="small text-muted">
                        You can leave this page and come back later - we've remembered your token.
                        Otherwise, hang around and
                        we'll push content to this page as you need it.
                    </p>
                </div>

            </div>
        </div>
        <div key="error" class="container">
            <div class="message">
                <i class="i-main fa fa-plug fa-5x"/>
                <h5>You've been disconnected.</h5>
                <p>Your websocket to the DemocrApp server has failed. Please check your internet
                    connection and then reconnect.</p>
                <p>Disconnect reason: <code>Code: {{code}} {{reason}}</code>
                <p>
                    <button type="button" onClick="$emit('reload')" class="btn btn-outline-dark">Reload
                    </button>
                </p>
                <p class="small text-muted">
                    If this is happening a lot, please try on another device, and let one of the
                    event team know so that we can
                    look into the issue.
                </p>
            </div>
        </div>
    </transition>
</template>

<script>
  export default {
    name: "ActiveSession",
    props: {
      sessionToken: true
    },
    data: function () {
      return {
        cast: null,
        sessionState: "new",
        code: "",
        reason: "",
        voters: [],
        meetingName: "",
      }
    },
    mounted() {
      this.cast = new WebSocket("/cast");
      var hs = {
        "type": "auth_request",
        "session_token": this.$cookies.get("session_token")
      };
      console.log(hs);
      this.cast.onopen = function () {
        this.cast.send(JSON.stringify(hs));
      };
      this.cast.onmessage = function (msg) {
        this.castReceived(JSON.parse(msg.data));
      };
      this.cast.onerror = (e) => {
        this.sessionState = "failed";
        console.log("[CAST] Unable to create Websocket.");
        console.log(e);
        this.code = "WS_INIT_FAIL";
        this.reason = "Unable to create Websocket.";
      };
      this.cast.onclose = (e) => {
        if (this.sessionState == "terminated") {
          return;
        }
        this.sessionState = "failed";
        console.log("[CAST] Websocket failed.");
        this.code = e.code;
        this.reason = e.reason;
      };
    },
    methods: {
      castReceived: function (msg) {
        console.log("[CAST] Recieved " + msg.type);
        console.log(msg);
        switch (msg.type) {
          case "auth_response":
            if (msg.result == "success") {
              console.log("[CAST] Authentication success.");
              $('#logoutButton').show();
              this.meetingName = msg.meeting_name;
              this.voters = msg.voters;
              this.sessionState = "connected";
            } else {
              console.log("[CAST] Authentication failed.");
              this.sessionState = "terminated";
              this.closeSocket();
              this.reason = msg.reason;
              this.$cookies.remove("session_token");
            }
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
          case "terminate_session":
            terminateSession(msg);
            break;
          case "announcement":
            var id = "a-" + (annId++);
            $.get("/templates/message-card.mustache", function (template) {
              $('#stream').hide().prepend(Mustache.render(template, {
                id: id,
                message: msg.message
              })).fadeIn();
              if (visibleCards == 0) {
                $('#message-connected').fadeOut();
              }
              visibleCards++;
            });
            break;
          default:
            alert("There has been a communications error.");
            break;
        }
      },
      closeSocket: function () {
        if (this.cast != undefined) {
          if (this.cast.readyState == 1) {
            console.log("[CAST] Closing websocket");
            this.cast.close();
          }
        }
      }
    }
  }
</script>

<style scoped>

</style>