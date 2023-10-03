import { defineStore } from 'pinia'

interface IMessage {
  id: number;
  body: string;
  createdAt: Date;
  userId: number;
}


interface IChannel {
  name: string;
  id: number;
  messages: Map<number, IMessage>
}

export const useChannelStore = defineStore('channel', {
	state: ():IChannel => ({
		name: '',
		id: 0,
		messages: new Map<number, IMessage>(),

	}),
	getters: {
		// getters can access the state through the parameters
		getChannelName(state) {
			return state.name
		}
	},
	actions: {
		// actions change the state, which can be accessed with "this"
		async currentChannel(name: string, id:number) {
			this.name = name;
			this.id = id;
			const loadMessages = await $fetch<IMessage[]>(`http://localhost:3000/chat/channel/${this.id}/message`, {
				credentials: 'include',
			}).catch((err) => {
				console.log(err);
				
			})
			if (loadMessages)
			{
				this.messages = new Map(loadMessages.map(message => [message.id, message]));
			}
		},

		addMessage(input: IMessage) {
			this.messages.set(input.id, input);
			console.log(this.messages);
		},


		clearMessages() {
			this.messages.clear();
		}
	}
})