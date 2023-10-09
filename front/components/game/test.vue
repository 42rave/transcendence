<script lang='ts'>
export default defineNuxtComponent({
  props: ['socket'],
});
</script>

<template>
  <v-btn @click="this.socket.emit('test', 'test')">test</v-btn>
</template>

<style scoped>

</style>