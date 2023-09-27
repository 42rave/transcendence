<script lang='ts'>
// nuxt component fetching POST data to /auth/totp, which is handled by the backend
// use of suspense in order to display a loading screen while the data is being fetched

export default defineNuxtComponent({
  name: 'WidgetTotpEnable',
  emits: ['totp:hide'],
  data: () => ({
    code: '',
    config: useRuntimeConfig(),
    error_qr: false,
    loading_qr: true,
    error_totp: false,
    data: {},
  }),
  async beforeMount() {
    await $fetch(new URL('/auth/totp', useRuntimeConfig().app.API_URL).toString(), {
      credentials: 'include',
    }).then((data) => {
      this.data = data;
      this.loading_qr = false;
      this.error_qr = false;
    }).catch(() => {
      this.error_qr = true;
    });
  },
  methods: {
    async regenerate() {
      this.loading_qr = true;
      await $fetch(new URL('/auth/totp', useRuntimeConfig().app.API_URL).toString(), {
        method: 'POST',
        credentials: 'include',
      }).then((data) => {
        this.data = data;
        this.loading_qr = false;
        this.error_qr = false;
      }).catch(() => {
        this.error_qr = true;
      });
    },
    async verify() {
      const ret = await this.$auth.verifyTotp(this.code);

      if (!ret) {
        this.error_totp = true;
        setTimeout(() => {
          this.error_totp = false;
          this.code = '';
        }, 500);
      }
      else {
        this.$emit('totp:hide', true);
      }
    }
  }
})
</script>

<template>
  <v-alert v-if="error_qr" dense type="error" color="red" class="mx-auto">
    <template v-slot:title>Error while fetching QR code.</template>
    <template v-slot:text>Please use the button below to try to generate a new one.</template>
  </v-alert>
  <div v-else id="qr-container" class="mx-auto">
    <v-progress-circular id="spinner" v-if="loading_qr" class="mx-auto" size="75" indeterminate color="purple" style='height: 200px' />
    <v-img id="qr-code" v-else :src="data?.qr_code" class="qr-code mx-auto"></v-img>
  </div>

  <v-btn @click="regenerate" class="mx-auto" color="purple">Regenerate</v-btn>
  <div class="w-100" :class="{ 'error-shake': error_totp }">
    <h4 class="mx-auto" style="width: fit-content">Vérifie le code!</h4>
    <v-text-field v-model="code" label="code" variant="underlined" class="mx-auto w-50" @keydown.prevent.enter="verify"/>
    <div style="width: fit-content" class="mx-auto">
      <v-btn class="mx-4" color="red" @click.prevent="$emit('totp:hide')">
        <v-icon icon="mdi-close" />
      </v-btn>
      <v-btn class="mx-4" color="success" @click.prevent="verify">
        <v-icon icon="mdi-check" />
      </v-btn>
    </div>
  </div>
</template>

<style scoped>
#qr-container {
  width: fit-content;
  height: 200px;
}
#qr-code {
  width: 200px;
  border-radius: 1rem;
}
.error-shake {
  color: #f16464;
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