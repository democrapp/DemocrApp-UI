<template>
    <div>
        <h1>Great, let's get started.</h1>

        <p>Please select your meeting and enter your unique voter token in the box below.</p>


        <form id="authForm">
            <select class="form-control" v-model="meetingId">
                <option v-bind:value="meeting.id" v-for="meeting in meetingList">{{meeting.name}}</option>
            </select>

            <input class="form-control" type="number" placeholder="token" v-model="authToken"/>

            <div id="captcha"></div>

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
      captchaKey: String
    },
    data: function() {
      return {
        meetingId: this.meetingList[0].id,
        authToken: ""
      }
    },
    methods: {
      authenticate: function () {
        this.$emit('authenticate', this.authToken, this.meetingId, grecaptcha.getResponse() )
      }
    },
    mounted() {
      grecaptcha.render('captcha', {
          'sitekey' : this.captchaKey
        });

    }
  }
</script>

<style scoped>

</style>