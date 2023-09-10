import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
    state: () => ({
      user: null,
    }),
    getters: {
      isAuthenticated: (state) => !!state.user,
    },
    actions: {
      login(data: any) {
        window.location.href = 'http://localhost:3000/auth/login';
      },
      async logout() {
        await $fetch('http://localhost:3000/auth/logout', { credentials: 'include' }).then((res) => {
          this.user = null;
        }).catch(() => {});
      },
      async fetchUser() {
        await $fetch('http://localhost:3000/auth/me', { credentials: 'include' }).then((res) => {
          this.user = res;
        }).catch(() => {});
      }
    },
});