<script lang="ts">
export default defineNuxtComponent({
  data() {
    return {
      login: '',
      avatar: '',
    }
  },
  methods: {
    signIn() {
      this.$auth.login({
        login: this.login,
        avatar: this.avatar,
      })
    },
  },
})
</script>

<template>
  <div class="d-flex flex-column align-center my-12">
    <div class="d-flex flex-column align-center">
      <h1>Login page</h1>
      <p>bonjour, connecte-toi!</p>
    </div>
    <v-card class="login-box mt-12">
      <v-text-field v-model="login" label="Login" hide-details></v-text-field>
      <v-text-field v-model="avatar" label="Avatar" hide-details></v-text-field>
      <v-btn variant="tonal" class="text-none w-100 mx-0" @click="signIn">Se connecter!</v-btn>
    </v-card>
  </div>
</template>

<style scoped>
.login-box {
  width: 300px;
}
</style>