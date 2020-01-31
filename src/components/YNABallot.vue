<template>
    <form ref="form">
        <div class="card ballot">
            <div class="card-header">
                <div class="ballot-badges">
                    <span class="badge badge-success">Y/N/A</span>
                    <span class="badge badge-info" v-if="voter.type=='proxy'">PROXY</span>
                </div>
                <h5 class="card-title">{{title}}</h5>
            </div>
            <div class="card-body">
                <p class="card-text">
                    {{desc}}
                </p>
                <div v-if="!submitted && !submitting" class="active-body">
                    <div class="btn-group" role="group">
                        <button type="button" class="btn btn-lg btn-success"
                                @click="ynaButtonClick('yes')" ref="yes"
                                v-bind:class="{ active: active=='yes' }">Yes
                        </button>
                        <button type="button" class="btn btn-lg btn-danger"
                                @click="ynaButtonClick('no')" ref="no"
                                v-bind:class="{ active: active=='no' }">No
                        </button>
                        <button type="button" class="btn btn-lg btn-secondary"
                                @click="ynaButtonClick('abs')" ref="abs"
                                v-bind:class="{ active: active=='abs' }">
                            Abstain
                        </button>
                    </div>
                </div>
                <div v-if="submitting && !submitted" class="loader" style="">
                    <i class="fa fa-circle-o-notch fa-spin fa-3x fa-fw"></i>
                    <p>Submitting...</p>
                </div>
                <div v-if="submitted" class="success">
                    <i class="fa fa-check fa-4x"></i>
                    <h6>Great! Your vote has been recieved.</h6>
                    <button class="btn btn-outline-dark" type="button"
                            @click="$emit('ballot_close', ballot_id, voter.token)">Dismiss
                    </button>
                </div>
            </div>
            <div v-if="!submitted && !submitting" class="card-footer">
                <p class="text-muted small">Click your selection once to select and then again to submit.</p>
            </div>
        </div>
    </form>
</template>

<script>
  export default {
    name: "YNABallot",
    props: {
      voter: Object,
      ballot_id: Number,
      title: String,
      desc: String,
      options: Array,
      submitted: Boolean
    },
    data: function () {
      return {
        submitting: false,
        active: "",
      }
    },
    methods: {
      ynaButtonClick: function (selection) {
        let self = this;
        console.log("yna button clicked");
        let button = this.$refs[selection];
        if (this.active == selection) {
          // Already clicked once, we need to submit
          console.log('ynaSubmit Fired');
          this.submitting = true;
          let votes = {};
          votes[this.voter.token] = {};
          let o_id = null;
          this.options.forEach(o => {
            if (o.name == selection) {
              o_id = o.id;
            }
          });
          votes[this.voter.token][o_id] = 1;
          this.$emit('ballot_submit', this.ballot_id, votes);
          return;
        }
        this.active = selection;
      },
    }
  }
</script>

<style scoped>

</style>