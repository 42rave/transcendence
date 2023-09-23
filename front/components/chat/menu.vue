<script lang="ts">

export default defineNuxtComponent({
  name: 'ChatMenu',
  props: ['socket'],
  data: () => ({
	config: useRuntimeConfig(),
    input: '',
  }),

  methods: {
    },

})
</script>

<template>
  <div class="menu">
	<v-icon icon="mdi-forum" hide-details @click.stop="$emit('drawer:click')"/>
  </div>

</template>

<style>

.menu {
	padding: 15px;
	margin: 5px;
	align-self: center;
	border-radius: 50%;
	background-color: purple;
}
</style>