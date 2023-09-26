import { defineStore } from 'pinia';
import type { User } from '~/types/user';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
  }),
  getters: {
    isAuthenticated: (state) => !!state.user,
  },
  actions: {
    async login() {
      const config = useRuntimeConfig();
      window.location.href = `${config.app.API_URL}/auth/login`;
    },
    async logout() {
      const config = useRuntimeConfig();
      await $fetch(`${config.app.API_URL}/auth/logout`, {
          credentials: 'include',
      }).then(() => {
        this.user = null;
      }).catch(() => {});
    },
    async fetchUser() {
      const config = useRuntimeConfig();
      await $fetch(`${config.app.API_URL}/auth/me`, {
          credentials: 'include',
      }).then((res) => {
          this.user = res as User;
      }).catch(() => {});
    },
    async verifyTotp(code: string) {
      const config = useRuntimeConfig();

      return await $fetch(`${config.app.API_URL}/auth/totp/verify?code=${code}`, {
        method: 'POST',
        credentials: 'include',
      }).then((res) => {
        console.log(res);
        this.user = res as User;
        return true;
      }).catch(() => {
        return false;
      });
    },
    async disableTotp(code: string) {
      const config = useRuntimeConfig();

      return await $fetch(`${config.app.API_URL}/auth/totp?code=${code}`, {
        method: 'DELETE',
        credentials: 'include',
      }).then((res) => {
        this.user = res as User;
        return true;
      }).catch(() => {
        return false;
      });
    }
  },
});