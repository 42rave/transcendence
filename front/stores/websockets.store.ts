import { defineStore } from 'pinia';

export const useWsStore = defineStore('ws', {
    state: () => ({
        chatConnected: false,
    }),
    getters: {
        isChatConnected: (state) => state.chatConnected,
    },
})
