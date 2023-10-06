<script lang="ts">
export default defineNuxtComponent({
  props: ['socket'],
})
</script>

<template>
  <div class="profile-page d-flex align-center justify-center">
    <Profile :socket="this.socket" :id="this.$auth.user.id" />
  </div>
</template>

<style scoped>
.profile-page {
  height: calc(100vh - 4rem);
}
</style>