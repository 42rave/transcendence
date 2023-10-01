<script lang="ts">

export default defineNuxtComponent({
  name: 'ChatConvDisplay',
  props: ['socket'],
  data: () => ({
   	config: useRuntimeConfig()
 }),

  beforeMount() {
    console.log("bouh");
    
    this.socket?.on('chat:message', (data: any) => {
	console.log("message received");
	
  //   const message = data.message;
	// this.messageList.push({message });
  //   console.log(this.messageList);
      this.$channel.addMessage(data);
      console.log('coucou', data);
    });
  },
  unmounted() {
    this.socket?.off('chat:message');
  },

  methods: {
   
  }
})
</script>



<template>
  <h2>{{this.$channel.name}}</h2>
	<div class="display__messages">
		<div v-for="[id, message] in this.$channel.messages" key="id">
      {{message.body}}
   		</div>
	</div>
</template>

<style>

h2 {
  text-align: center;
}

.display__messages {
	height: 94%;
  background: grey;
}
</style>


