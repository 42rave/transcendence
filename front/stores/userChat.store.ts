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

export const useUserChatStore = defineStore('userChat', {
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
			}
		},

		async removeConnection(connection: IChannelConnection) {
			this.channelConnections.delete(connection.channelId);
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
		updateRelationship (relationship: IRelationship) {
			const relationToUpdate = this.relationships.get(relationship.receiverId);
			if (!relationToUpdate)
			{
				this.relationships.set(relationship.receiverId, relationship);
				return;
			}
			relationToUpdate.kind = relationship.kind;
		},

		removeRelationship (relationship: IRelationship) {
			if (!relationship)
				return;
			this.relationships.delete(relationship.receiverId);
		}
	}
})