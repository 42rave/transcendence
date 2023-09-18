import { useWsStore } from '~/stores/websockets.store';

export default defineNuxtPlugin((nuxtApp: any) => {
  const wsStore = useWsStore(nuxtApp.store);
  nuxtApp.provide('sockets', wsStore);
});