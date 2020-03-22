<template>
    <div class="home">
        <div class="header">
            <img id='logo' src="/assets/img/EUTCredonwhite.png"/>
        </div>
        <template v-if="wsSupport">
            <div v-if="sessionToken">
                <ActiveSession v-bind:session-token="sessionToken"
                               v-bind:k-i-o-s-k_-m-o-d-e="KIOSK_MODE"
                               @reload="init"
                               @logout="userEndSession"
                               :key="initCount"/>
            </div>
            <div v-else-if="message">
                {{message}}
            </div>
            <div v-else>
                <Landing v-bind:meetingList="meetingList"
                         v-bind:captchaKey="GRC_SITEKEY"
                         @authenticate="authenticate"/>
            </div>
        </template>
        <template v-else>
            <h1>Sorry!</h1>
            <p>
                Your browser or device does not support WebSockets. This app relies on WebSockets for
                communication to the server, so unfortunately we cannot load the app here.
            </p>

            <p>
                Please check your web browser is up to date, try a new modern browser like Chrome, Firefox or Safari,
                or try on another device.
            </p>

            <p>
                Alternatively, you may find it easier to use one of the e-voting kiosks.
            </p>
        </template>
        <div id="footer">
            <button type="button" class="btn btn-secondary" @click="userEndSession" v-if="sessionToken">Logout
            </button>
            <p>
                Created in the pursuit of simpler democracy. @rphi &amp; @saty9. <a
                    href="https://github.com/EdinburghUniversityTheatreCompany/DemocrApp">GitHub</a>.
            </p>
        </div>
    </div>
</template>

<script>
  import Landing from "../components/Landing";
  import ActiveSession from "../components/ActiveSession";
  let GRC_SITEKEY = "6LfeMuMUAAAAAKtZ1SDwcijqOUgtYPsdcR2ricw7";

  export default {
    name: 'home',
    components: {
      Landing,
      ActiveSession
    },
    data: function () {
      return {
        KIOSK_MODE: this.$route.query.k == "true",
        message: null,
        meetingId: null,
        sessionToken: null,
        meetingList: null,
        cast: null,
        initCount: 0,
        wsSupport: true,
        GRC_SITEKEY: GRC_SITEKEY
      }
    },
    mounted() {
      console.log("[INIT] Checking for WebSocket support");
      if (window.WebSocket) {
        console.log("[INIT] WebSocket support found");
        this.init();
      } else {
        console.error("[INIT] WebSocket support not found. Unable to launch app.");
        this.wsSupport = false;
      }
    },
    methods: {
      init: function () {
        this.initCount++;
        this.sessionToken = null;
        this.axios.get('/api/list')
          .then(response => (
            this.meetingList = response.data.meetings
          ));
        if (this.KIOSK_MODE) {
          this.$cookies.remove("session_token");
          if (!this.$route.query.m) {
            this.message = "Malformed request: kiosk mode requires m parameter to be set"
          }
          this.meetingId = this.$route.query.m;
          //loadKioskLanding();
          return;
        }
        if (this.$cookies.get("session_token") != undefined) {
          console.log("[INIT] Found existing session token.");
          this.sessionToken = this.$cookies.get("session_token");
        } else {
          if (this.$route.query.t) {
            this.authenticate(this.$route.query.t, this.$route.query.m);
          }
        }
      },
      authenticate: function (token, meetingId, captchaTokenResponse) {
        const params = new URLSearchParams();
        params.append("token", token);
        params.append("recaptcha", captchaTokenResponse);
        this.axios.post("/api/" + meetingId + "/checktoken", params)
          .then(response => {
            console.log(response.data);
            if (response.data.success) {
              this.$cookies.set("session_token", response.data.session_token, 0);
              this.sessionToken = response.data.session_token;
            } else {
              grecaptcha.reset();
              alert("That voter token is invalid. Please try again.");
            }
          }).catch(error => {
          alert("There was an issue communicating with the DemocrApp API. Please try again.");
        });
      },
      userEndSession: function () {
        console.log("[SESSION] User terminated session.");
        this.sessionToken = null;
        this.$cookies.remove("session_token");
        this.init()
      }
    }
  }
</script>
