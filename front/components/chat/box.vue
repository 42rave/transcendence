<script lang="ts">
import { Relationship } from "~/types/relation";

interface IMessage {
  size: number;
  message: string;
}
export default defineNuxtComponent({
  name: 'ChatBox',
  props: ['socket'],
  data: () => ({
    drawer: true,
    
  }),

  mounted() {
    const {$event} = useNuxtApp();

    this.$userChat.currentConnections();
    this.$userChat.currentRelationships();
    this.socket.on('relation:update', (data: Relationship) => {
      this.$userChat.updateRelationship(data);
    });

    this.socket.on('relation:remove', (data: Relationship) => {
      this.$userChat.removeRelationship(data);
    });

/*  if the user is kicked from the channel, his connection is removed from the channel, 
    the current channel state is reset 
    and the user is redirected to channel 0 */
    this.socket?.on('chat:kicked', (data: any) => {
		  this.$userChat.removeConnection(data.id);
      $event('alert:error', {message: `You are kicked from ${data.name}`});
      if (data.id === this.$channel.id)
      {
        this.$router.push('/chat');
		    this.$channel.$reset();
      }
    });

    /*  if a user is kicked from the channel, his connection is removed from the channel */
    this.socket?.on('chat:kicking', (data: number) => {
		  this.$channel.removeUser(data);     
    });

    /*  if the user is banned from the channel, his connection is removed from the channel, 
    the current channel state is reset 
    and the user is redirected to channel 0 */
    this.socket?.on('chat:banned', (data: any) => {
		  this.$userChat.removeConnection(data);
      $event('alert:error', {message: `You are banned from ${data.channel.name}`});
      if (data.channel.id === this.$channel.id)
      {
        this.$router.push('/chat');
		    this.$channel.$reset();
      }
    });

    /*  if a user is banned from the channel, his connection is removed from the channel */
    this.socket?.on('chat:banning', (data: number) => {
		  this.$channel.removeUser(data);     
    });
  },

  unmounted() {
    this.socket.off('relation:update');
    this.socket.off('relation:remove');
    this.socket.off('chat:kicked');
    this.socket.off('chat:kicking');
    this.socket.off('chat:banned');
    this.socket.off('chat:banning');
  },

  methods: {
  }

})
</script>

<template>
    <div class="chatBox">
    <div id="title-wrapper" class="d-flex flex-row">
      <h2>{{this.$channel.name}}</h2>
      <ChatMenu @click="drawer = !drawer" :drawer="drawer"/>
    </div>
      <ChatConvDisplay :socket="socket" @drawer:click="drawer = !drawer"/>
        <div class="chatFooter">
          <ChatMessageInput :socket="socket"/>
        </div>
    </div>
    <ChatBar :socket="socket" @drawer:update="(v: boolean) => drawer = v" :drawer="drawer"/>
</template>

<style scoped>

h2 {
  text-align: center;
  width: 100%;
}

.chatBox {
  width: 100%;
  height: 100%;
  gap: 0.1rem;
  max-height: calc(100vh - 4rem);
  overflow: hidden;
  display: flex;
  flex-direction: column
;
}

.chatFooter {
  width: 100%;
  display: flex;
  padding: 0 1rem;
  gap: 1rem;
  bottom: 0;
  z-index: 1;
  justify-content: space-around;  
}
</style>