<template>
  <div v-if="this.editable" class="placeholder my-2">
    <v-avatar size="150" class="avatar avatar-blur" :image="this.user.avatar"></v-avatar>
    <v-avatar size="150" class="avatar" :image="this.user.avatar" />
    <div class="avatar-prevent" />
  </div>
  <v-avatar v-else size="150" class="avatar my-2" :image="this.user.avatar" />
  <h2>{{ this.user.username }}</h2>
</template>

<script lang="ts">
export default defineNuxtComponent({
  props: ["user", "editable"]
});
</script>

<style scoped>
.placeholder {
  position: relative;
  cursor: pointer;
}

.avatar-blur, .avatar-prevent {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  transition: filter 0.25s ease;
}

.placeholder:hover .avatar-blur {
  -webkit-filter: blur(2rem);
  -moz-filter: blur(2rem);
  -o-filter: blur(2rem);
  -ms-filter: blur(2rem);
  filter: blur(2rem);
}
</style>

