<template>
    <form ref="form">
        <div class="card ballot">
            <transition-group name="fade">
                <div class="card-header" key="head">
                    <div class="ballot-badges">
                        <span class="badge badge-secondary">STV</span>
                        <span class="badge badge-info" v-if="voter.type=='proxy'">PROXY</span>
                    </div>
                    <h5 class="card-title">{{title}}</h5>
                </div>
                <div class="card-body" key="desc">
                    <p class="card-text">
                        {{desc}}
                    </p>
                </div>
                <ul class="list-group list-group-flush" v-if="!submitting&&!submitted" key="voting_options">
                    <li v-for="option in options" class="list-group-item">
                        {{option.name}}
                        <input v-bind:name="option.id" class="ballot-preference-field" type="number" placeholder="0"/>
                    </li>
                </ul>
                <div class="card-footer" v-if="!submitting && !submitted" key="controls">
                    <button type="button" @click="submit"
                            class="btn btn-primary">Submit vote
                    </button>
                    <button type="reset" class="btn btn-secondary">Reset</button>
                </div>
                <div class="loader" style="" v-if="submitting && !submitted" key="loader">
                    <i class="fa fa-circle-o-notch fa-spin fa-3x fa-fw"></i>
                    <p>Submitting...</p>
                </div>
                <div class="success" v-if="submitted" key="confirmation">
                    <i class="fa fa-check fa-4x"></i>
                    <h6>Great! Your vote has been recieved.</h6>
                    <button class="btn btn-outline-dark" type="button"
                            @click="$emit('ballot_close', ballot_id, voter.token)">Dismiss
                    </button>
                </div>
            </transition-group>
        </div>
    </form>
</template>

<script>
  export default {
    name: "STVBallot",
    props: {
      voter: Object,
      ballot_id: Number,
      title: String,
      desc: String,
      options: Array,
      submitted: Boolean
    },
    data: function() {
      return {
        submitting: false
      }
    },
    methods: {
      submit: function () {
        let xoptions = this.$refs.form.elements;
        let options = [];
        xoptions.forEach(o => options.push(o));
        options.sort((a, b) => {
          return a.value - b.value;
        });
        let currentpref = 1;
        let out = {};
        options.forEach(option => {
          if (!option.value) { /* ignore */
          } else if (option.value % 1 != 0) {
            currentpref = -1;
            return;
          } else if (option.value == currentpref) {
            currentpref++;
            out[option.name] = option.value;
          } else {
            currentpref = -1;
            return;
          }
        });
        if (currentpref == -1) {
          alert("Please double check your preference entries, use consecutive whole numbers");
          return;
        }
        this.submitting = true;
        let votes = {};
        votes[this.voter.token] = out;
        this.$emit('ballot_submit', this.ballot_id, votes)
        /*
        $('#' + cardId + ' .card-footer button').fadeOut();
        $('#' + cardId + ' .list-group').fadeOut(() => {
          $('#' + cardId + " .loader").fadeIn(() => {
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
          })
        });
        */
      }
    }
  }
</script>

<style scoped>

</style>