<template>
    <div>
        <h1>{{meetingName}}</h1>

        <div id="alerts" class="container" v-for="alert in alerts">
            <div class="alert alert-warning alert-dismissable fade show">
                <strong>Heads up!</strong> We've already recieved at least one vote for the ballot titled
                "{{alert.ballot_name}}"
                from this session. Any further votes will replace those previously submitted.
                <p class="small">We've pulled any currently open ballots back when the page reloaded in case something
                    went
                    wrong. Feel free to submit them again.</p>
                <button type="button" class="btn btn-outline-dark btn-sm" data-dismiss="alert" aria-label="Close">
                    Dismiss
                </button>
            </div>
        </div>

        <div id="stream" class="container">
            <transition-group name="fade">
                <template v-for="ballot in ballots">
                    <div v-bind:key="ballot.ballot_id + '-' + ballot.voter.token">
                        <STVBallot v-bind="ballot" v-if="ballot.method=='STV'"
                                   v-bubble.ballot_submit.ballot_close/>
                        <FailureNotice v-bind="ballot" v-if="ballot.method=='failure_notice'"
                                       v-bubble.ballot_close/>
                    </div>
                </template>
            </transition-group>
        </div>
        <div class="container" v-if="!ballots.length">
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
</template>

<script>
  import STVBallot from "./STVBallot";
  import FailureNotice from "./FailureNotice";

  export default {
    name: "CardStream",
    components: {FailureNotice, STVBallot},
    props: {
      meetingName: {type: String, required: true},
      ballots: Array,
      alerts: Array,
    }
  }
</script>

<style scoped>

</style>