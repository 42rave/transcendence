import { defineStore } from 'pinia'

export const useChannelStore = defineStore('channel', {
	state: () => ({
		// stores data
	}),
	getters: {
		// getters can access the state through the parameters
	},
	actions: {
		// actions change the state, which can be accessed with "this"
	}
})