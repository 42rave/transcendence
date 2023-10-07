import { defineStore } from 'pinia';

interface ICurrentConnections {
	userId: number;
	role: string;
}

interface IMessage {
  id: number;
  body: string;
  createdAt: Date;
  userId: number;
}

interface IChannel {
  name: string;
  id: number;
  messages: Map<number, IMessage>;
  userRole: string;
  currentConnections: Map<number, ICurrentConnections>;
}

export const useChannelStore = defineStore('channel', {
	state: ():IChannel => ({
		name: '',
		id: 0,
		userRole: '',
		messages: new Map<number, IMessage>(),
		currentConnections: new Map<number, ICurrentConnections>(),

	}),
	getters: {
		// getters can access the state through the parameters
		getChannelName(state) {
			return state.name
		}
	},
	actions: {
		// actions change the state, which can be accessed with "this"
		async currentChannel(name: string, id:number, role: string) {
			const config = useRuntimeConfig();
			this.name = name;
			this.id = id;
			this.userRole = role;
			await this.getMessages();
			await this.getCurrentConnections();
		},

		async getMessages() {
			const config = useRuntimeConfig();
			if (this.id === 0)
				return;
			const loadMessages = await $fetch<IMessage[]>(`${config.app.API_URL}/chat/channel/${this.id}/message`, {
				credentials: 'include',
			}).catch((err) => {
				console.log(err.response._data.message);
			});
			if (loadMessages)
			{
				this.messages = new Map(loadMessages.map(message => [message.id, message]));
			}
		},

		async getCurrentConnections () {
			const config = useRuntimeConfig();
			const loadUsers = await $fetch<ICurrentConnections[]>(`http://localhost:3000/chat/channel/${this.id}/connection`, {
				credentials: 'include',
			}).catch((err) => {
				console.log(err.response._data.err);	
			});
	
			if (loadUsers)
			{
				this.currentConnections = new Map(loadUsers.map((currentConnection: ICurrentConnections) => [currentConnection.userId, currentConnection]));
				
			}
		},

		async addUser(currentConnection: ICurrentConnections) {
			this.currentConnections.set(currentConnection.userId, currentConnection);
		},

		async removeConnection(currentConnection: ICurrentConnections) {
			this.currentConnections.delete(currentConnection.userId);
		},

		addMessage(input: IMessage) {
			this.messages.set(input.id, input);
		},

		clearMessages() {
			this.messages.clear();
		}
	}
})