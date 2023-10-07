<script lang="ts">

export default defineNuxtComponent({
  name: 'ChatActionMenu',
  props: ['socket', 'message', 'id'],
  data: () => ({
   	config: useRuntimeConfig()
 }),

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
    },

// if the user is not the owner or an admin, some actions will not appear for them
    allowedActions() {
      if (this.$channel.userRole === "ADMIN" || this.$channel.userRole === "OWNER")
        return true;
      return false;
    }
  }
})
</script>



<template>

            <v-menu v-if="this.$auth.user.id != message.userId" :activator="`#author-${id}`">
              <v-card max-width="10rem">
                <v-btn @click="inviteBTN" size="small" block>Let's play !</v-btn>
                <v-divider></v-divider>
                <v-btn @click="blockBTN" size="small" block>block</v-btn>
                <v-divider></v-divider>
                <v-btn @click="profileBTN" size="small" block>Profile</v-btn>
                <v-list class="allowed_actions" v-if="allowedActions()">
                  <v-divider></v-divider>
                  <v-btn  @click="kickBTN(message.userId)" size="small" block>kick</v-btn>
                  <v-divider></v-divider>
                  <v-btn @click="banBTN" size="small" block>ban</v-btn>
                  <v-divider></v-divider>
                  <v-btn @click="muteBTN" size="small" block>mute</v-btn>
                </v-list>
              </v-card>
            </v-menu>

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


