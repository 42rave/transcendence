import { defineStore } from 'pinia';

interface IRelationship {
	senderId: number,
	receiverId: number,
	kind: string,
}

interface IChannelConnection {
	userId: number,
	channelId: number,
	role: string,
	muted: Date,
	createdAt: Date
}

interface IChat {
	channelConnections: Map<number, IChannelConnection>,
	relationships: Map<number, IRelationship>
}

export const useChatStore = defineStore('chat', {
	state: (): IChat => ({
		channelConnections: new Map<number, IChannelConnection>(),
		relationships: new Map<number, IRelationship>()
	}),

	getters: {

	},

	actions: {
		async currentConnections () {
			const config = useRuntimeConfig();
			const currentConnections = await $fetch<IChannelConnection[]>(`${config.app.API_URL}chat/channel/connection`, {
				credentials: 'include'
			}).catch((err) => {
				console.log(err);
			})
			if (currentConnections)
			{
				this.channelConnections = new Map(currentConnections.map(connection => [connection.channelId, connection]))
				console.log(this.channelConnections);
			}
		},

		async currentRelationships () {
			const config = useRuntimeConfig();
			const currentRelationships = await $fetch<IRelationship[]>(`${config.app.API_URL}relationship`, {
				credentials: 'include'
			}).catch((err) => {
				console.log(err);
			})
			if (currentRelationships)
			{
				this.relationships = new Map(currentRelationships.map(relationship => [relationship.senderId, relationship]))
				console.log(this.relationships);
				
			}
		}
	}
})