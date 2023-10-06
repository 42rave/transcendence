export enum RelationKind {
	FRIEND = 'FRIEND',
	BLOCKED = 'BLOCKED'
}

export interface Relationship {
	senderId: number;
	receiverId: number;
	kind: RelationKind;
}