<template>
    <div>
        <h1>Great, let's get started.</h1>

        <p>Please select your meeting and enter your unique voter token in the box below.</p>


        <form id="authForm">
            <select class="form-control" v-for="meeting in meetingList" v-model="meetingId">
                <option v-bind:value="meeting.id">{{meeting.name}}</option>
            </select>

            <input class="form-control" type="number" placeholder="token" v-model="authToken"/>

            <button type="button" class="btn btn-primary mx-auto btn-block" @click="authenticate">
                Submit
            </button>
        </form>

        <p class="small">If you have your paper token, you can just scan the QR code to be logged in
            automatically!</p>
    </div>
</template>

<script>
  export default {
    name: "Authentication",
    props: {
      meetingList: Array,
    },
    data: function() {
      return {
        meetingId: this.meetingList[0].id,
        authToken: ""
      }
    },
    methods: {
      authenticate: function () {
        this.$emit('authenticate', this.authToken, this.meetingId)
      }
    }
  }
</script>

<style scoped>

</style>