<script lang="ts">
export default defineNuxtComponent({
  methods: {
    login() {
      this.$auth.login();
    },
  },
})
</script>

<template>
  <div class="d-flex flex-column align-center my-12">
    <v-card class="login-box mt-12">
      <div class="d-flex flex-column align-center text-center my-4">
        <h2 class="pb-4">Login page</h2>
        <p>Bonjour, connecte-toi avec ton compte 42!</p>
      </div>
      <v-btn variant="tonal" class="text-none w-100 mx-0" @click="login">Se connecter!</v-btn>
    </v-card>
  </div>
</template>

<style scoped>
.login-box {
  width: 300px;
}
</style>