<template>
    <div class="message">
        <i class="i-main fa fa-clock-o fa-3x"/>
        <h5>The ballot titled "{{title}}" has now closed.</h5>
        <p>{{reason}}</p>
        <p>
            <button type="button" @click="$emit('ballot_close', ballot_id, voter.token)" class="btn btn-outline-dark">Dismiss</button>
        </p>
        <p class="small text-muted">
            No further votes can be submitted.
        </p>
    </div>
</template>

<script>
  export default {
    name: "BallotClosed",
    props: {
      title: String,
      reason: String,
      ballot_id: Number,
      voter: Object
    }
  }
</script>

<style scoped>

</style>