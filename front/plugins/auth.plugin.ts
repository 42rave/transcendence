import { useAuthStore } from '~/stores/auth.store';

export default defineNuxtPlugin((nuxtApp: any) => {
  const authStore = useAuthStore(nuxtApp.store);
  nuxtApp.provide('auth', authStore);
  authStore.fetchUser();
});