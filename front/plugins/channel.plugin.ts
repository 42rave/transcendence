import { useChannelStore } from '~/stores/channel.store';

export default defineNuxtPlugin((nuxtApp: any) => {
  const channelStore = useChannelStore(nuxtApp.store);
  nuxtApp.provide('channel', channelStore);

});