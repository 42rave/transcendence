<script  lang='ts'>
export default defineNuxtComponent({
  props: ['win'],
  data: () => ({
    winText: 'You win!',
    loseText: 'You lose!',
  }),
})
</script>

<template>
  {{ this.win ? this.winText : this.loseText }};
</template>

<style scoped>

</style>