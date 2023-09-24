<template>
  <div class="d-flex flex-column align-center my-12">
    <v-card class="login-box mt-12" :class="{ 'error-shake': error }">
      <div class="d-flex flex-column align-center text-center my-4">
        <h2 class="pb-4">TOTP</h2>
        <p>Entre ton code!</p>
      </div>
      <v-text-field
          v-model="code"
          @keydown.enter.prevent="submit"
          label="code"
          :counter="6"
          :maxlength="6"
          type="password"
          hide-details
      />
    </v-card>
  </div>
</template>

<script lang="ts">
export default defineNuxtComponent({
  name: 'Index',
  props: ['socket'],
  data: () => ({
    code: '',
    config: useRuntimeConfig(),
    error: false,
  }),
  methods: {
    async submit() {
      const ret = await this.$auth.verifyTotp(this.code);
      if (!ret) {
        this.error = true;
        setTimeout(() => {
          this.error = false;
          this.code = '';
        }, 500);
      }
      else {
        this.socket?.connect();
      }
    },
  },
})
</script>

<style scoped>
.login-box {
  width: min(300px, 100%);
  transition-duration: 0.25s;
}

.error-shake {
  box-shadow: 0 0 120px #801b1bb2;
  color: #f16464;
  transition-duration: 0.25s;
  animation: shake 0.3s; /* Apply shake animation on error */
}

@keyframes shake {
  0% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  50% { transform: translateX(5px); }
  75% { transform: translateX(-5px); }
  100% { transform: translateX(5px); }
}
</style>