<template>
  <v-app-bar app>
    <v-app-bar-nav-icon @click.stop="$emit('drawer:click')"></v-app-bar-nav-icon>
    <v-toolbar-title>Application</v-toolbar-title>
    {{ $auth.user.username }}
    <v-avatar id="menu-activator" class="avatar mx-4" size="40px" color="grey" dark>
      <v-img v-if="$auth.user.avatar" :src="$auth.user.avatar" cover class="avatar-menu" />
      <v-icon v-else>mdi-account</v-icon>
    </v-avatar>
    <v-menu activator="#menu-activator">
      <v-list>
        <v-list-item v-for="(item, index) in menu" :key="index" :value="index" @click="item.action">
          <v-list-item-title>
            <v-icon size="1rem">{{ item.icon }}</v-icon>
            {{ item.title }}
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </v-app-bar>
</template>

<script lang="ts">
export default defineNuxtComponent({
  props: ['socket'],
  data() {
    return {
      menu: [
        { title: 'Profile', icon: 'mdi-account', action: this.redirectToProfile },
        { title: 'Settings', icon: 'mdi-cog', action: this.redirectToSettings},
        { title: 'Logout', icon: 'mdi-logout', action: this.logout},
      ]
    };
  },
  methods: {
    redirectToProfile() {
      this.$router.push('/profile');
    },
    redirectToSettings() {
      this.$router.push('/settings');
    },
    logout() {
      this.socket?.disconnect();
      this.$auth.logout();
    },
  },
});
</script>

<style scoped>
.avatar {
  cursor: pointer;
  transition: border-color 0.3s;
  border: 3px solid #73377d; /* Adjust the border size and color as needed */
  border-spacing: 20px;
}

.avatar:hover {
  border-color: white; /* Change border color on hover */
}
</style>
