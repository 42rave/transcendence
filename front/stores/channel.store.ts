import { defineStore } from 'pinia'

export const useChannelStore = defineStore('channel', {
	state: () => ({
		name: '',
		id: 0,
		messages: new Array<string>()
	}),
	getters: {
		// getters can access the state through the parameters
		getChannelName(state) {
			return state.name
		}
	},
	actions: {
		// actions change the state, which can be accessed with "this"
		currentChannel(name: string, id:number) {
			this.name = name;
			this.id = id;
		},

		addMessage(message: string) {
			this.messages.push(message);
		}
	}
})