<script lang="ts">

export default defineNuxtComponent({
  name: 'ChatConvDisplay',
  props: ['socket', 'messageList'],
  data: () => ({
   	config: useRuntimeConfig()
 }),
  beforeMount() {
    this.socket?.on('test:message', (data: { message: string }) => {
	console.log("message received");
	
    const message = data.message;
	this.messageList.push({message });
    console.log(this.messageList);
    });
  },
  unmounted() {
    this.socket?.off('test:message');
  },

  methods: {
   
  }
})
</script>



<template>
	<div class="display__messages">
		<div v-for="message in this.messageList" :key="message.id">
      {{message.message}}
   		</div>
	</div>
</template>

<style>

.display__messages {
	height: 95%;
}
</style>


