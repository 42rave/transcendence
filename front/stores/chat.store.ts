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
			const currentConnections = await $fetch<IChannelConnection[]>(`${config.app.API_URL}/chat/channel/connection`, {
				credentials: 'include'
			}).catch((err: any) => {
				console.log(err.response._data.message);
			})
			if (currentConnections)
			{
				this.channelConnections = new Map(currentConnections.map((connection: IChannelConnection) => [connection.channelId, connection]))
				console.log(this.channelConnections);
			}
		},

		async currentRelationships () {
			const config = useRuntimeConfig();
			const currentRelationships = await $fetch<IRelationship[]>(`${config.app.API_URL}/relationship`, {
				credentials: 'include'
			}).catch((err: any) => {
				console.log(err.response._data.message);
			})
			if (currentRelationships)
			{
				this.relationships = new Map(currentRelationships.map((relationship: IRelationship) => [relationship.receiverId, relationship]))
			}
		},
		async updateRelationship (relationship: IRelationship) {
			this.relationships.set(relationship.receiverId, relationship);
		},
		async removeRelationship (relationship: IRelationship) {
			this.relationships.delete(relationship.receiverId);
		}
	}
})