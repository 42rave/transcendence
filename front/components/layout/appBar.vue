<template>
  <v-app-bar app>
    <v-app-bar-nav-icon @click.stop="$emit('drawer:click')"></v-app-bar-nav-icon>
    <v-toolbar-title>Application</v-toolbar-title>

    {{ $auth.user.login }}
    <v-avatar id="menu-activator" class="avatar mx-4" size="40px" color="grey" dark>
      <v-img v-if="$auth.user.avatar" :src="$auth.user.avatar"></v-img>
      <v-icon v-else>mdi-account</v-icon>
    </v-avatar>
    <v-menu activator="#menu-activator">
      <v-list>
        <v-list-item
            v-for="(item, index) in menu"
            :key="index"
            :value="index"
        >
          <v-list-item-title @click="item.action">
            <v-icon size="1rem">{{ item.icon }}</v-icon>
            {{ item.title }}
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </v-app-bar>
</template>

<script>
export default {
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
      this.$auth.logout();
    },
  },
};
</script>

<style scoped>
.avatar {
  cursor: pointer;
  transition: border-color 0.3s;
  border: 3px solid grey; /* Adjust the border size and color as needed */
  border-spacing: 20px;
}

.avatar:hover {
  border-color: white; /* Change border color on hover */
}
</style>
