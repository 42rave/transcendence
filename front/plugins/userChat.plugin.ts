import { useUserChatStore } from '~/stores/userChat.store';

export default defineNuxtPlugin((nuxtApp: any) => {
  const userChatStore = useUserChatStore(nuxtApp.store);
  nuxtApp.provide('userChat', userChatStore);

});