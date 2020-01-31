<template>
    <div class="home">
        <div v-if="sessionToken">
            <ActiveSession v-bind:session-token="sessionToken" v-bind:k-i-o-s-k_-m-o-d-e="KIOSK_MODE" @reload="init"/>
        </div>
        <div v-else-if="message">
            {{message}}
        </div>
        <div v-else>
            <Landing v-bind:meetingList="meetingList" @authenticate="authenticate"/>
        </div>
    </div>
</template>

<script>
  import Landing from "../components/Landing";
  import ActiveSession from "../components/ActiveSession";

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
        cast: null
      }
    },
    mounted() {
      this.init();
    },
    methods: {
      init: function () {
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
          //replacePage('landing');
          //if ($.urlParam('t')) {
          //  //checkToken($.urlParam('t'), $.urlParam('m'));
          //}
        }
      },
      authenticate: function (token, meetingId) {
        const params = new URLSearchParams();
        params.append("token", token);
        this.axios.post("/api/" + meetingId + "/checktoken", params)
          .then(response => {
            console.log(response.data);
            if (response.data.success) {
              this.$cookies.set("session_token", response.data.session_token, 1);
              this.sessionToken = response.data.session_token;
            } else {
              alert("That voter token is invalid. Please try again.");
            }
          }).catch(error => {
          alert("There was an issue communicating with the DemocrApp API. Please try again.");
        });
      },
    }
  }
</script>
