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
            <CardStream v-bind:meeting-name="meetingName"
                        v-bind:ballots="ballots"
                        @ballot_submit="submitBallot"
                        @ballot_close="closeBallot"/>
        </div>
        <div v-else key="error" class="container">
            <div class="message">
                <i class="i-main fa fa-plug fa-5x"/>
                <h5>You've been disconnected.</h5>
                <p>Your websocket to the DemocrApp server has failed. Please check your internet
                    connection and then reconnect.</p>
                <p>Disconnect reason: <code>Code: {{code}} {{reason}}</code>
                <p>
                    <button type="button" @click="$emit('reload')" class="btn btn-outline-dark">Reload
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
  import CardStream from "./CardStream";

  export default {
    name: "ActiveSession",
    components: {CardStream},
    props: {
      sessionToken: true,
      KIOSK_MODE: false,
    },
    data: function () {
      return {
        cast: null,
        sessionState: "new",
        code: "",
        reason: "",
        voters: [],
        meetingName: "",
        ballots: [],
        alerts: [],
        unfilledBallots: 0,
        API_HOST: location.host,
        API_WS_PROTOCOL: location.protocol == "https:" ? "wss://" : "ws://",
      }
    },
    mounted() {
      let self = this;
      this.cast = new WebSocket(this.API_WS_PROTOCOL + this.API_HOST +"/cast");
      let hs = {
        "type": "auth_request",
        "session_token": this.$cookies.get("session_token")
      };
      console.log(hs);
      this.cast.onopen = function () {
        self.cast.send(JSON.stringify(hs));
      };
      this.cast.onmessage = function (msg) {
        self.castReceived(JSON.parse(msg.data));
      };
      this.cast.onerror = (e) => {
        self.sessionState = "failed";
        console.log("[CAST] Unable to create Websocket.");
        console.log(e);
        self.code = "WS_INIT_FAIL";
        self.reason = "Unable to create Websocket.";
      };
      this.cast.onclose = (e) => {
        if (self.sessionState == "terminated") {
          return;
        }
        self.sessionState = "failed";
        console.log("[CAST] Websocket failed.");
        self.code = e.code;
        self.reason = e.reason;
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
            this.ballotReceived(msg);
            break;
          case "ballot_receipt":
            this.ballotReceipt(msg);
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
      },
      ballotReceived: function (msg) {
        if (msg.existing_ballots) {
          this.alerts.push({ballot_name: msg.title})
        }
        let self = this;
        this.voters.forEach(function (voter) {
          let ballot = Object.assign({}, msg);
          let xvoter = Object.assign({}, voter);
          ballot.voter = xvoter;
          ballot.submitted = false;
          self.ballots.push(ballot);
          self.unfilledBallots++;
        });
        /*switch (msg.method) {
          case "STV":
            console.log("[BALLOT] New using STV");
            voters.forEach(voter => {
              var v = {
                ballot_id: msg.ballot_id,
                title: msg.title,
                desc: msg.desc,
                options: msg.options,
              }
              if ((voter.type != "proxy") || msg.proxies) {
                v.proxy = (voter.type == "proxy");
                v.voter_id = voter.token;
                $.get("/templates/stv-card.mustache", function (template) {
                  addBallotCard(Mustache.render(template, v));
                });
              }
            });
            break;
          case "YNA":
            console.log("[BALLOT] New using Y/N/A");
            voters.forEach(voter => {
              if ((voter.type != "proxy") || msg.proxies) {
                var v = {
                  ballot_id: msg.ballot_id,
                  title: msg.title,
                  desc: msg.desc,
                  yes_id: "foo",
                  no_id: "bar",
                  abs_id: "zip"
                }
                msg.options.forEach(option => {
                  switch (option.name) {
                    case "yes":
                      v.yes_id = option.id;
                      break;
                    case "no":
                      v.no_id = option.id;
                      break;
                    case "abs":
                      v.abs_id = option.id;
                      break;
                    default:
                      console.log("[BALLOT] Unexpected YNA option name " + option.name + " - ignoring");
                      break;
                  }
                })
                if (v.yes_id == undefined || v.no_id == undefined || v.abs_id == undefined) {
                  console.error("[BALLOT] Incomplete YNA option ID set. Unable to render.");
                  return;
                }
                v.proxy = (voter.type == "proxy");
                v.voter_id = voter.token;
                $.get("/templates/yna-card.mustache", function (template) {
                  addBallotCard(Mustache.render(template, v));
                });
              }
            });
            break;
          default:
            console.error("[BALLOT] Unsupported method: \"" + msg.method + "\"");
            break;
         */
      },
      submitBallot: function (ballot_id, votes) {
        let message = {
          type: "ballot_form",
          ballot_id: ballot_id,
          session_token: this.sessionToken,
          votes: votes
        };
        this.cast.send(JSON.stringify(message));
      },
      closeBallot: function (ballot_id, voter_token) {
        let self = this;
        this.ballots.forEach(function (ballot, index) {
            if (ballot.ballot_id == ballot_id && ballot.voter.token == voter_token) {
              self.ballots.splice(index,1);
            }
          });
      },
      ballotReceipt: function (msg) {
        let self = this;

        if (msg.result == "failure") {
          let matching_indices = [];
          this.ballots.forEach(function (ballot, index) {
            if (ballot.ballot_id == msg.ballot_id) {
              matching_indices.unshift(index);
            }
          });
          matching_indices.forEach(function (ballot_index) {
            let new_obj = Object.assign(self.ballots[ballot_index], {method: "failure_notice", desc: msg.reason});
            self.$set(self.ballots, ballot_index, new_obj);
          });
          return;
        }

        msg.voter_token.forEach(voter => {
          //set submitted for each received receipt
          self.ballots.forEach(function (ballot, index) {
            if (ballot.ballot_id == msg.ballot_id && ballot.voter.token == voter) {
              let new_obj = Object.assign(self.ballots[index], {submitted: true});
              self.$set(self.ballots, index, new_obj);
            }
          });

          //auto logout if no ballots left
          self.unfilledBallots--;
          if (self.unfilledBallots == 0 && self.KIOSK_MODE) {
            setTimeout(userEndSession, 1000);
          }
        })
      }
    },
  }
</script>

<style scoped>

</style>