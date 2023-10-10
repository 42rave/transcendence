import { defineStore } from 'pinia';

export const useWsStore = defineStore('ws', {
    state: () => ({
        chatConnected: false,
        gameConnected: false,
    }),
    getters: {
        isChatConnected: (state) => state.chatConnected,
        isGameConnected: (state) => state.gameConnected,
    },
})
