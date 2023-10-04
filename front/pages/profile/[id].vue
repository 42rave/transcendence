<script setup lang="ts">

</script>

<template>
  <div class="profile-page d-flex align-center justify-center">
    <Profile :id="this.$route.params.id" />
  </div>
</template>

<style scoped>
.profile-page {
  height: calc(100vh - 4rem);
}
</style>