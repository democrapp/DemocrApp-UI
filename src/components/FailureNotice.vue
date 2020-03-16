<template>
    <div class="message">
        <i class="i-main fa fa-exclamation-triangle fa-3x"/>
        <h5>Your vote for the ballot was not accepted.</h5>
        <p>{{desc}}</p>
        <p>
            <button type="button" @click="$emit('ballot_close', ballot_id, voter.token)" class="btn btn-outline-dark">Dismiss</button>
        </p>
    </div>
</template>

<script>
  export default {
    name: "FailureNotice",
    props: {
      voter: Object,
      ballot_id: Number,
      desc: String
    },
  }
</script>

<style scoped>

</style>