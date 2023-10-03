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
    <v-container class="fill-height overflow-auto" style="max-width: 100%; align-content: end">
      <v-row class="d-flex flex-column">
          <v-list-item v-for="[id, message] in this.$channel.messages" :key="message.createdAt" style="">
              <v-card :color="message.userId != this.$auth.user.id ? 'primary' : 'success'" style="width: fit-content;" :class="{'ml-auto': this.$auth.user.id == message.userId}">
                <v-card-text class="white--text pa-2 d-flex flex-column">
                  <span class="text-subtitle-1">
                  {{ message.body}}</span>
                  <span class="text-caption font-italic">
                  {{message.createdAt}}</span> 
                </v-card-text>
              </v-card>
            </v-list-item>
      </v-row>
    </v-container>
</template>

<style scoped>


</style>


