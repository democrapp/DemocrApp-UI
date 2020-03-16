<template>
    <div class="container">
        <div class="message">
            <i class="i-main fa fa-exclamation-circle fa-5x"/>
            <h5>This session has been terminated.</h5>
            <p>The DemocrApp server has requested that your session be terminated.</p>
            <p>Reason: <code>{{reason}}</code>
            <p>
                <button type="button" @click="$emit('logout')" class="btn btn-outline-dark">Reload</button>
            </p>
            <p class="small text-muted">
                This is not a connection error.
            </p>
        </div>
    </div>
</template>

<script>
  export default {
    name: "TerminatedSession",
    props: {
      reason: String
    }
  }
</script>

<style scoped>

</style>