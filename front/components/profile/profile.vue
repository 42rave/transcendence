<script lang="ts">
import type { User } from '~/types/user';

export default defineNuxtComponent({
  props: ['id'],
  data: () => ({
    user: null as User | null,
  }),
  async beforeMount() {
    const data = await this.$api.get(`/user/${this.id}`);
    if (!data) {
      if (this.$auth.user.id !== this.id)
        return this.$router.push('/profile');
      return ;
    }
    this.user = data;
  },
  methods: {
    editable() {
      return this.user && this.user.id === this.$auth.user.id;
    },
    uploadFile: async (e: any) => {
      console.log(typeof e);
    },
    onUpdateUser(user: User) {
      console.log(user);
      this.user = user;
    }
  }
})
</script>

<template>
  <v-card class="profile-box mx-auto" prepend-icon="mdi-account-circle">
    <template v-slot:title>Profile</template>
    <div v-if="this.user" class="profile-content overflow-hidden d-flex flex-column w-100">
      <div class="d-flex flex-column h-100 overflow-auto align-center">
        <ProfileAvatar :user="this.user" :editable="this.editable()" @user:updated="onUpdateUser" />
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