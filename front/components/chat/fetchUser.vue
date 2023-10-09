<script lang="ts">
import { User } from "~/types/user";

export default defineNuxtComponent({
  data: () => ({
    user: null as User | null,
    username: '',
    loading: false,
    error_message: '',
  }),
  methods: {
    async fetchUser() {
      this.loading = true;
      this.user = await this.$api.get(`/user/name/${this.username}`, null, (err: any) => {
        if (err.statusCode === 418) {
          this.error_message = 'User not found';
          setTimeout(() => {
            this.error_message = '';
          }, 3000);
        }
        else if (err.statusCode === 401)
          this.$auth.logout();
        else
          this.$emit('alert:error', {title: 'Error', message: err.message});
      });
      this.loading = false;
    },
    isOwner() {
      return this.$channel.userRole === 'OWNER';
    },
    isAdmin() {
      return this.$channel.userRole === 'ADMIN';
    },
    isOwnerOrAdmin() {
      return this.isOwner() || this.isAdmin();
    },

    async promoteUser(userId) {
      const promoted = await this.$api.post(`/chat/channel/${this.$channel.id}/promote/${userId}`);
      if (promoted)
      {
        this.$channel.role = promoted.role;
      }
    },
    
    async demoteUser(userId) {
      const demoted = await this.$api.post(`/chat/channel/${this.$channel.id}/demote/${userId}`);
      if (demoted)
      {
        this.$channel.role = demoted.role;
      }
    },

    async transferOwnership(userId) {
      const newOwner = await this.$api.post(`/chat/channel/${this.$channel.id}/transfer/${userId}`);
      if (newOwner)
      {
        this.$channel.role = newOwner.role;
      }
    },

  }
})
</script>

<template>
  <v-text-field
    v-model="this.username"
    label="Username"
    append-inner-icon="mdi-account-search"
    @keyup.enter="this.fetchUser()"
    :error-messages="this.error_message"
  />
  <div v-if="this.loading" class="d-flex justify-center">
    <v-progress-circular indeterminate color="primary"></v-progress-circular>
  </div>
  <v-list-item v-else-if="this.user" @click="console.log('redirect to profile...')">
    <template v-slot:prepend>
      <v-avatar :image="user.avatar" />
    </template>
    <div class='d-flex flex-row'>
      <v-list-item-title>
        <div class="d-flex flex-column">
          <p>{{ user.username }}</p>
          <p
              class="status text-caption font-italic"
              :class="{'online': user.status === 'online'}"
          >
            {{user.status}}
          </p>
          <div class="d-flex flex-row">
            <div class="my-auto remove-zone" @click.prevent="promoteUser(user.id)">
              <v-icon color="red" class="btn">mdi-chevron-up</v-icon>
            </div>
            <div class="my-auto remove-zone" @click.prevent="demoteUser(user.id)">
              <v-icon color="red" class="btn">mdi-chevron-down</v-icon>
            </div>
            <div class="my-auto remove-zone" @click.prevent="transferOwnership(user.id)">
              <v-icon color="red" class="btn">mdi-plus</v-icon>
            </div>
          </div>
        </div>
      </v-list-item-title>
      <v-spacer />

    </div>
  </v-list-item>
</template>

<style scoped>
.status {
  color: #a73d3d;
}

.status.online {
  color: #3da73d;
}
.remove-zone:hover .btn {
  background-color: #4b3434;
  border-radius: 50%;
}
</style>