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
    <v-container class="fill-height">
      <v-row>
		    <v-card 
          v-for="[id, message] in this.$channel.messages" 
          :key="message.createdAt">
          <v-list-item
            :key="message.createdAt"
            v-if="message.userId != this.$auth.user.id">
              <v-card color="success" class="flex-none received-message">
                <v-card-text class="white--text pa-2 d-flex flex-column">
                  <span class="align-self-start text-subtitle-1">
                  {{ message.body}}</span>
                  <span class="text-caption font-italic align-self-end">
                  {{message.createdAt}}</span> 
                </v-card-text>
              </v-card>
            </v-list-item>
             <v-list-item v-else :key="message.createdAt">
                <v-card color="primary" class="flex-none">
                  <v-card-text class="white--text pa-2 d-flex flex-column">                                                                           
                    <span class="text-subtitle-1 chat-message">
                      {{ message.body }}</span>
                    <span class="text-caption font-italic align-self-start">
                    {{message.createdAt}}</span> 
                  </v-card-text>
                </v-card>
          </v-list-item> 
   		  </v-card>
      </v-row>
    </v-container>
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


