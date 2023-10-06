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
      const { $api }: any = useNuxtApp();

      window.location.href = $api.url(`/auth/login`);
    },
    async logout() {
      const { $api }: any = useNuxtApp();
      await $api.get('/auth/logout').then(() => { this.user = null; });
    },
    async fetchUser() {
      const { $api }: any = useNuxtApp();
      return await $api.get('/auth/me').then((res: User) => {
        this.user = res;
        return res;
      });
    },
    async verifyTotp(code: string) {
      const { $api }: any = useNuxtApp();

      const user = await $api.post('/auth/totp/verify', { params: { code } }, (reason: any) => undefined);
      if (!user) return false;

      this.user = user;
      return true;
    },
    async disableTotp(code: string) {
      const { $api }: any = useNuxtApp();

      const user = await $api.delete('/auth/totp', { params: { code } }, (reason: any) => undefined);
      if (!user) return false;

      this.user = user;
      return true
    },
    async setUser(user: User) {
      this.user = user;
    }
  },
});