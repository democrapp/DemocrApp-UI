<template>
    <transition name="fade">
        <div v-if="has_token" key="auth">
            <Authentication v-bind:meeting-list="meetingList"
                            v-bind:captchaKey="captchaKey"
                            v-bubble:authenticate/>
        </div>
        <div v-else key="landing">
            <div v-if="!meetingList">
                Loading Meetings...
            </div>
            <div v-else-if="meetingList.length > 0">
                <h3>Welcome to</h3>
                <h1>DemocrApp [RC1]</h1>

                <p>
                    This site provides online voting functionality for general meetings. In order
                    to access the site you will need to use the anonymous access token that you were
                    given
                    when you registered into the meeting by the meeting secretary.
                </p>

                <p>
                    If you have not yet registered, please see the company secretary/meeting chair
                    to request a token.
                </p>

                <h5>FAQs:</h5>
                <ul>
                    <li>
                        <strong>What if I leave?</strong> You can only access DemocrApp from within
                        the
                        Bedlam
                        WiFi network.
                        This site will stop working once you leave Bedlam's WiFi range.
                    </li>
                    <li>
                        <strong>What if my device doesn't work properly?</strong> Take your token to
                        one
                        of
                        the
                        e-voting kiosks
                        and place your votes there.
                    </li>
                    <li>
                        <strong>What if my device stops working?</strong> You can re-authenticate on
                        any
                        compatible device, or move
                        to using one of the aforementioned e-voting kiosks.
                    </li>
                </ul>

                <button class="btn btn-lg btn-primary btn-block" @click="has_token=true">I've got my
                    token!
                </button>

                <p class="small muted">
                    To help us squash any bugs, if your device encounters an error while running
                    DemocrApp, it will send a an anonymous report to <a
                        href="https://sentry.io/for/javascript/"
                        target="_blank">Sentry</a>
                    with a little more info about what happened.
                </p>
            </div>
            <div v-else>
                <h1>Sorry!</h1>

                <p>
                    There aren't any meetings live in the system at the moment.
                </p>
            </div>
        </div>
    </transition>
</template>

<script>
  import Authentication from "./Authentication";

  export default {
    name: "Landing",
    components: {
      Authentication,
    },
    props: {
      meetingList: null,
      captchaKey: null
    },
    data: function () {
      return {
        has_token: false
      }
    },
  }
</script>

<style scoped>

</style>