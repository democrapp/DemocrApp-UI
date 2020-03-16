<template>
    <div class="message" ref="main">
        <i class="i-main fa fa-bullhorn fa-3x"/>
        <h5>Announcement</h5>
        <p>{{message}}</p>
        <p>
            <button type="button" @click="$emit('dismiss_announcement',id)" class="btn btn-outline-dark">Dismiss</button>
        </p>
        <p class="small text-muted">
            This message was sent by the event organisers.
        </p>
    </div>
</template>

<script>
  export default {
    name: "Announcement",
    props: {
      id: Number,
      message: String
    },
    mounted() {
      this.$refs.main.scrollIntoView(true)
    }
  }
</script>

<style scoped>

</style>