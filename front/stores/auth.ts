import { defineStore } from 'pinia';

/* TODO: Use api route to fetch user instead of localStorage
 * The uses of localStorage is only for demo purpose
 */
export const useAuthStore = defineStore('auth', {
    state: () => ({
      user: null,
    }),
    getters: {
      isAuthenticated: (state) => !!state.user,
    },
    actions: {
      login(data: any) {
        console.log('login action: ', data);
        this.user = data;
        localStorage.setItem('user', JSON.stringify(data));
      },
      logout() {
        console.log('logout action');
        this.user = null;
        localStorage.removeItem('user');
      },
      fetchUser() {
        console.log('fetchUser action');
        const user = localStorage.getItem('user');
        if (user) {
          this.user = JSON.parse(user);
        }
      }
    },
});