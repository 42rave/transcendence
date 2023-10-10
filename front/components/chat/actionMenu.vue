<script lang="ts">

export default defineNuxtComponent({
  name: 'ChatActionMenu',
  props: ['socket', 'gameSocket', 'message', 'id'],
  data: () => ({
   	config: useRuntimeConfig(),
    timer: 1,
 }),

  methods: {
    inviteBTN( userId: number) {
      this.gameSocket.emit('game:invite', {targetUserId: userId});
    },

    async blockBTN(targetUserId: number) {
     const res = await this.$api.post(`relationship/${targetUserId}/block`);
      this.$userChat.updateRelationship(
        {
          receiverId: targetUserId,
	        kind: 'BLOCKED',
        }
      )
    },

    async unblockBTN(targetUserId: number) {
      this.$userChat.removeRelationship(this.$userChat.relationships.get(targetUserId));;
      await this.$api.delete(`relationship/${targetUserId}`);
    },

    async kickBTN(targetUserId: number) {
      await this.$api.post(`chat/channel/${this.$channel.id}/kick/${targetUserId}`);
    },

    async banBTN(targetUserId: number) {
    await this.$api.post(`chat/channel/${this.$channel.id}/ban/${targetUserId}`);
      this.$channel.updateUserRole(
        {
          userId: targetUserId,
          role: 'BANNED'
        }
      );
    },

    async unbanBTN(targetUserId: number) {
    await this.$api.post(`chat/channel/${this.$channel.id}/unban/${targetUserId}`);
      this.$channel.updateUserRole(
      {
          userId: targetUserId,
          role: 'DEFAULT'
      }
      );
    },

    async muteBTN(targetUserId: number) {
      await this.$api.post(`chat/channel/${this.$channel.id}/mute/${targetUserId}`, {
        body: {
          time: parseInt(this.timer),
        }
      });
      this.$refs.timer.reset();
    },

    profileBTN(targetUserId: number) {
      this.$router.push(`/profile/${targetUserId}`);
    },

// if the user is not the owner or an admin, some actions will not appear for them
    allowedActions() { 
      if (this.$channel.userRole === "ADMIN" || this.$channel.userRole === "OWNER")
        return true;
      return false;
    },

    isUserBanned(targetUserId: number) {
      const user = this.$channel.userList.get(targetUserId);
      if (user && user.role === 'BANNED')
      {
        return true;
      }
      return false;
    },

    isUserBlocked(targetUserId: number) {
      const user = this.$userChat.relationships.get(targetUserId);
      if (user && user.kind === 'BLOCKED')
      {
        return true;
      }
      return false;
    },

  }
})
</script>



<template>
  <v-menu v-if="this.$auth.user.id != message.userId" :activator="`#author-${id}`" :close-on-content-click=false>
    <v-card max-width="10rem">
      <v-btn @click="inviteBTN(message.userId)" size="small" block>Let's play !</v-btn>
      <v-divider></v-divider>
      <v-btn v-if="isUserBlocked(message.userId)" @click="unblockBTN(message.userId)" size="small" block>unblock</v-btn>
      <v-btn v-else @click="blockBTN(message.userId)" size="small" block>block</v-btn>
      <v-divider></v-divider>
      <v-btn @click="profileBTN(message.userId)" size="small" block>Profile</v-btn>
      <v-list class="allowed_actions" v-if="allowedActions()">
        <v-divider></v-divider>
        <v-btn @click="kickBTN(message.userId)" size="small" block>kick</v-btn>
        <v-divider></v-divider>
        <v-btn v-if="isUserBanned(message.userId)" @click="unbanBTN(message.userId)" size="small" block>unban</v-btn>
        <v-btn v-else @click="banBTN(message.userId)" size="small" block>ban</v-btn>
        <v-divider></v-divider>
        <v-menu open-on-hover :close-on-content-click=false>
          <template v-slot:activator="{ props }">
            <v-btn :active=false size="small" block v-bind="props">mute</v-btn>
          </template>
          <v-text-field ref=timer v-model="timer" label="minutes" hide-details type="number" :focused="true" style="width: 10rem; background: #1b1b1b;" density="compact" @keyup.enter="muteBTN(message.userId)">
          </v-text-field>
        </v-menu>
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


