<script lang="ts">
import type { User } from '~/types/user';

enum Status {
  OFFLINE = 'offline',
  ONLINE = 'online',
  IN_GAME = 'in game',
}

export default defineNuxtComponent({
  props: ['id', 'socket'],
  data: () => ({
    user: null as User & { status: Status } | null,
    status: Status.OFFLINE,
    tab: 0,
  }),
  async beforeMount() {
    const data = await this.$api.get(`/user/${this.id}`);
    if (!data) {
      if (this.$auth.user.id !== this.id)
        return this.$router.push('/profile');
      return ;
    }
    this.user = data;
    this.status = this.user!.status;
    this.socket.on(`user:${this.id}:status`, (data: { status: Status }) => {
      this.status = data.status;
    });
  },
  async unmounted() {
    this.socket.off(`user:${this.id}:status`);
  },
  methods: {
    editable() {
      return this.user && this.user.id === this.$auth.user.id;
    },
    onUpdateUser(user: User & { status: Status }) {
      this.user = user;
    },
    getStatusColor() {
      if (this.status === Status.OFFLINE)
        return '#be4545';
      if (this.status === Status.ONLINE)
        return '#62de62';
      if (this.status === Status.IN_GAME)
        return '#6161c9';
    }
  }
})
</script>

<template>
  <v-card class="profile-box mx-auto" prepend-icon="mdi-account-circle">
    <template v-slot:title>Profile</template>
    <div v-if="this.user" class="profile-content overflow-hidden d-flex flex-column w-100">
      <div class="d-flex flex-column h-100 overflow-auto align-center">
        <ProfileAvatar :user="this.user" :editable="this.editable()" @user:updated="this.onUpdateUser" />
        <ProfileUsername :user="this.user" :editable="this.editable()" @user:updated="this.onUpdateUser" />
        <p :style="{'color': this.getStatusColor()}">{{ this.status }}</p>
        <v-divider thickness="3" class='my-5 w-100'></v-divider>
        <div class="d-flex w-100" style="flex-direction: column">
          <v-tabs v-model="tab" class="w-100">
            <v-tab>Stats</v-tab>
            <v-tab>Games</v-tab>
            <v-tab v-if="!this.editable()">Social</v-tab>
          </v-tabs>
          <v-window v-model="tab" class="my-4">
            <v-window-item> Stats </v-window-item>
            <v-window-item> Games </v-window-item>
            <v-window-item v-if="!this.editable()">
              <ProfileSocial :user="this.user" />
            </v-window-item>
          </v-window>
        </div>

      </div>
    </div>
    <div v-else class="d-flex w-100 h-100">
      <div class="ma-auto" style="gap: 0.5rem">
        <v-progress-circular indeterminate size="64" color="purple" class="ma-auto" />
        <p class="ma-auto">Loading...</p>
      </div>
    </div>
  </v-card>
</template>

<style scoped>
.profile-box {
  width: min(700px, 100%);
  height: min(762px, 100%);
  transition-duration: 0.25s;
}
.profile-content {
  background-color: #282828;
  height: calc(100% - 4rem);
  max-height: calc(100% - 4rem);
  padding: 0 1rem 1rem 1rem;
}
</style>