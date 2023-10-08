import { defineStore } from 'pinia';

interface IUser {
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
  userList: Map<number, IUser>;
}

export const useChannelStore = defineStore('channel', {
	state: ():IChannel => ({
		name: '',
		id: 0,
		userRole: '',
		messages: new Map<number, IMessage>(),
		userList: new Map<number, IUser>(),

	}),
	getters: {
		// getters can access the state through the parameters
		getChannelName(state) {
			return state.name
		}
	},
	actions: {
		// actions change the state, which can be accessed with "this"
		async getCurrentChannel(name: string, id:number, role: string) {
			const config = useRuntimeConfig();
			this.name = name;
			this.id = id;
			this.userRole = role;
			await this.getMessages();
			await this.getUserList();
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

		async getUserList () {
			const config = useRuntimeConfig();
			const loadUsers = await $fetch<IUser[]>(`http://localhost:3000/chat/channel/${this.id}/connection`, {
				credentials: 'include',
			}).catch((err) => {
				console.log(err.response._data.err);	
			});
	
			if (loadUsers)
			{
				this.userList = new Map(loadUsers.map((user: IUser) => [user.userId, user]));
				
			}
		},

		async addnewUser(newUser: IUser) {
			this.userList.set(newUser.userId, newUser);
		},

		async removeUser(newUser: IUser) {
			this.userList.delete(newUser.userId);
		},

		async updateUserRole(userToUpdate: IUser) {
			this.userList.set(userToUpdate.userId, userToUpdate);
		},

		addMessage(input: IMessage) {
			this.messages.set(input.id, input);
		},

		clearMessages() {
			this.messages.clear();
		}
	}
})