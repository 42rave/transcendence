<script lang="ts">
export enum TotpDrawer {
  NONE,
  QR,
  DISABLE,
  PROMPT_DISABLE,
}
export default defineNuxtComponent({
  name: 'WidgetTotpSettings',
  data: () => ({
    totp: false,
    error: false,
    show: TotpDrawer.NONE,
    TotpDrawer,
    code: '',
  }),
  beforeMount() {
    this.totp = this.$auth.user.twoFAEnabled;
  },
  methods: {
    onTotpShow() {
      if (this.show != TotpDrawer.NONE) {
        this.show = TotpDrawer.NONE;
        return ;
      }
      switch (this.$auth.user.twoFAEnabled) {
        case true:
          this.show = TotpDrawer.PROMPT_DISABLE;
          break;
        case false:
          this.show = TotpDrawer.QR;
          break;
      }
    },
    onTotpHide() {
      this.show = TotpDrawer.NONE;
    },
    async disableTotp() {
      const ret = await this.$auth.disableTotp(this.code);
      if (!ret) {
        this.error = true;
        setTimeout(() => {
          this.error = false;
          this.code = '';
        }, 500);
      }
      else {
        this.totp = this.$auth.user.twoFAEnabled;
        this.code = '';
        this.show = TotpDrawer.NONE;
      }
    }
  }
})
</script>

<template>
  <div class="totp-box d-flex flex-column">
    <div class="d-flex d-flex-row">
      <div class="description my-auto px-4 h-20 font-weight-black">Activer la 2FA</div>
      <div class="w-100 px-2 h-20">
        <v-checkbox-btn v-model="totp" :label="totp ? 'Activé' : 'Désactivé'" @click.prevent="onTotpShow" />
      </div>
    </div>
    <div class="mx-auto w-100 px-8">
      <div v-if="show === TotpDrawer.DISABLE || show === TotpDrawer.PROMPT_DISABLE" class="mt-2 mb-4">
        <v-divider class="my-3 w-100" thickness="3"></v-divider>
        <div v-if="show === TotpDrawer.PROMPT_DISABLE">
          <h4 class="mx-auto" style="width: fit-content">Êtes-vous sûr de vouloir désactiver la 2FA ?</h4>
          <div class="mx-auto mt-4" style="width: fit-content">
            <v-btn class="mx-4" color="red" @click.prevent="onTotpHide">
              <v-icon icon="mdi-close" />
            </v-btn>
            <v-btn class="mx-4" color="success" @click.prevent="show = TotpDrawer.DISABLE">
              <v-icon icon="mdi-check" />
            </v-btn>
          </div>
        </div>
        <div v-else class="w-100" :class="{ 'error-shake': error }">
          <h4 class="mx-auto" style="width: fit-content">Vérifie ton identité!</h4>
          <v-text-field v-model="code" label="code" variant="underlined" class="mx-auto w-50" @keydown.prevent.enter="disableTotp"/>
          <div class="mx-auto" style="width: fit-content">
            <v-btn class="mx-4" color="red" @click.prevent="onTotpHide">
              <v-icon icon="mdi-close" />
            </v-btn>
            <v-btn class="mx-4" color="success" @click.prevent="disableTotp">
              <v-icon icon="mdi-check" />
            </v-btn>
          </div>
        </div>
      </div>
      <div v-else-if="show === TotpDrawer.QR" class="mt-2 mb-4">
        <v-divider class="my-3 w-100" thickness="3"></v-divider>
        <!-- TODO: Implement the QR code here -->
        Wonderful QR code
      </div>
    </div>
  </div>
</template>

<style scoped>
.totp-box {
  background-color: #212121;
  border-radius: 0.5rem;
}
.description {
  width: 40%;
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