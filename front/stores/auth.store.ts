import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
    state: () => ({
      user: null,
    }),
    getters: {
      isAuthenticated: (state) => !!state.user,
    },
    actions: {
      login() {
        const config = useRuntimeConfig();
        window.location.href = new URL('/auth/login', config.app.API_URL as string).toString();
      },
      async logout() {
        const config = useRuntimeConfig();
        await $fetch(new URL('/auth/logout', config.app.API_URL as string).toString(), {
            credentials: 'include',
        }).then(() => {
          this.user = null;
        }).catch(() => {});
      },
      async fetchUser() {
        const config = useRuntimeConfig();
        await $fetch(new URL('/auth/me', config.app.API_URL).toString(), {
            credentials: 'include',
        }).then((res) => {
            this.user = res as any;
        }).catch(() => {});
      }
    },
});