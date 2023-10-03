<script lang="ts">

export default defineNuxtComponent({
  name: 'Message',
  props: ['socket'],
  data: () => ({
    config: useRuntimeConfig(),
    
  }),

  methods: {

  }
})
</script>

<template>
	<v-card color="success">
	</v-card>

</template>

<style scoped>


</style>