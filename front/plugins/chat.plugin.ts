import { useChatStore } from '~/stores/chat.store';

export default defineNuxtPlugin((nuxtApp: any) => {
  const chatStore = useChatStore(nuxtApp.store);
  nuxtApp.provide('chat', chatStore);

});