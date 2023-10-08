<script lang="ts">

export default defineNuxtComponent({
  name: 'ChatConvDisplay',
  props: ['socket'],
  data: () => ({
   	config: useRuntimeConfig()
 }),

  beforeMount() {
        this.$channel.getMessages();
        this.socket?.on('chat:message', (data: any) => {
        const sender = this.$userChat.relationships.get(data.userId);
        if ((sender && sender.kind === 'BLOCKED'))
          return ;
        this.$channel.addMessage(data);
        });
  },
  
  unmounted() {
    this.socket?.off('chat:message');
  },

  methods: { }
  
})
</script>


<template>
    <v-container class="fill-height" style="max-width: 100%; flex-direction: column-reverse; overflow: auto">
      <v-row class="d-flex flex-column w-100">
          <v-list-item v-for="[id, message] in this.$channel.messages" :key="message.createdAt"  style="max-width: 85%" :class="this.$auth.user.id === message.userId ? 'ml-auto' : 'mr-auto'">
            <div class="d-flex author" :class="this.$auth.user.id === message.userId ? 'flex-row-reverse' : 'flex-row'" :id="`author-${id}`">
              <v-avatar size="1.2rem" :image="message.user.avatar"></v-avatar>
              <span class="text">{{message.user.username}}</span>
            </div>

            <ChatActionMenu :message="message" :id="id"/>

            <v-card :color="message.userId != this.$auth.user.id ? 'primary' : 'success'" style="width: fit-content;">
              <v-card-text class="white--text pa-2 d-flex flex-column" style="word-break: break-word;">
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

.author {
  gap: 0.5rem;
  font-size: small;
  padding: 0.2rem;
  cursor: pointer;
}

.allowed_actions {
  padding: 0;
}



</style>


