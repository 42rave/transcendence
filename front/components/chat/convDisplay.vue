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
        this.$channel.addMessage(data);
        });
  },
  
  unmounted() {
    this.socket?.off('chat:message');
  },

  methods: {
    inviteBTN() {
      console.log("invite to play");
    },

    blockBTN() {
      console.log("can't stand you prick");
    },

    kickBTN() {
      console.log("kick your butt");
    },

    banBTN() {
      console.log("go back to the shadows");
    },

    muteBTN() {
      console.log("suuuushhhhh");

    },

    profileBTN() {
      console.log("Frrrriiiiiiiend");
      this.allowedActions();
    },

// if the user is not the owner or an admin, some actions will not appear for them
    allowedActions() {
      if (this.$channel.role === "ADMIN" || this.$channel.role === "OWNER")
        return true;
      return false;
    }
  }
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

            <v-menu v-if="this.$auth.user.id != message.userId" :activator="`#author-${id}`">
              <v-card max-width="10rem">
                <v-btn @click="inviteBTN" size="small" block>Let's play !</v-btn>
                <v-divider></v-divider>
                <v-btn @click="blockBTN" size="small" block>block</v-btn>
                <v-divider></v-divider>
                <v-btn @click="profileBTN" size="small" block>Profile</v-btn>
                <v-list class="allowed_actions" v-if="allowedActions()">
                  <v-divider></v-divider>
                  <v-btn  @click="kickBTN" size="small" block>kick</v-btn>
                  <v-divider></v-divider>
                  <v-btn @click="banBTN" size="small" block>ban</v-btn>
                  <v-divider></v-divider>
                  <v-btn @click="muteBTN" size="small" block>mute</v-btn>
                </v-list>
              </v-card>
            </v-menu>

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


