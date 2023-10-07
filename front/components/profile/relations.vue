<script lang='ts'>
import { Relationship } from '~/types/relation';

export default defineNuxtComponent({
  props: ["kind", "socket"],
  data: () => ({
    connectionsList: null as Relationship[] | null,
    loading: true,
  }),
  async beforeMount() {
    await this.fetchRelations();
    if (this.socket) {
      this.socket.on('relation:update', (data: Relationship) => {
        if (data.kind === this.getKind())
          this.addRelation(data);
        else
          this.removeRelation(data);
      });
      this.socket.on(['relation:remove'], (data: { receiverId: number }) => {
        this.removeRelation(data);
      });
    }
  },
  unmounted() {
    for (const connection of this.connectionsList!) {
      this.removeWsHook(connection);
    }
    if (!this.socket) return;
    this.socket.off('relation:update');
    this.socket.off('relation:remove');
  },
  methods: {
    getIcon() {
      return this.kind === 'Blocked' ? 'mdi-account-off' : 'mdi-account-group';
    },
    getInfoMessage() {
      return this.kind === 'Blocked' ? 'You have no blocked users' : 'You have no friends';
    },
    getKind() {
      return this.kind === 'Friends' ? 'FRIEND' : 'BLOCKED';
    },
    async fetchRelations() {
      this.loading = true;
      this.connectionsList = this.sortConnections(await this.$api.get(`/relationship/${this.kind.toLowerCase()}`));
      for (const connection of this.connectionsList) {
        this.addWsHook(connection);
      }
      this.loading = false;
    },
    addRelation(connection: Relationship) {
      const _i = this.connectionsList!.findIndex((c: Relationship) => c.receiverId === connection.receiverId);
      if (_i !== -1) {
        this.connectionsList[_i] = connection;
        return ;
      }
      this.connectionsList!.push(connection);
      this.connectionsList = this.sortConnections(this.connectionsList!);
      this.addWsHook(connection);
    },
    removeRelation(connection: Relationship) {
      const _i =this.connectionsList?.findIndex((c: Relationship) => c.receiverId === connection.receiverId)
      if (_i === -1) return ;
      this.removeWsHook(this.connectionsList![_i]);
      this.connectionsList!.splice(_i, 1);
    },
    async onDelete(connectionId: number) {
      this.$api.delete(`/relationship/${connectionId}`);
    },
    sortConnections(connections: Relationship[]) {
      if (this.kind === 'Friends') {
        return connections.sort((a: Relationship, b: Relationship) => {
          const cmp = a.status.localeCompare(b.status);
          return !!cmp ? -cmp : a.receiver.username.localeCompare(b.receiver.username);
        });
      } else
      return connections.sort((a, b) => a.receiver.username.localeCompare(b.receiver.username));
    },
    addWsHook(connection: Relationship) {
      if (this.socket) {
        this.socket.on(`user:${connection.receiverId}:status`, (data: { status: string }) => {
          connection.status = data.status;
          this.connectionsList = this.sortConnections(this.connectionsList!);
        });
      }
    },
    removeWsHook(connection: Relationship) {
      if (this.socket) {
        this.socket.off(`user:${connection.receiverId}:status`);
      }
    }
  }
})
</script>

<template>
  <v-card width="100%" class="overflow-hidden" :prepend-icon="this.getIcon()">
    <template v-slot:title>
      {{ this.kind }}
    </template>
    <div v-if="this.loading" class="w-100 pb-4">
      <div class="mx-auto d-flex flex-column">
        <v-progress-circular class="mx-auto" indeterminate size="75" color="primary" />
        <h4 class="mx-auto">Loading...</h4>
      </div>
    </div>
    <div v-else-if="this.connectionsList === undefined" class="d-flex flex-column w-100 pb-4 px-4">
      <v-alert type="error" color="red" icon="mdi-alert">
        <span class="mx-auto">Woops something went wrong</span>
      </v-alert>
    </div>
    <div v-else class="relations-content overflow-auto">
      <div v-if="this.connectionsList.length === 0" class="d-flex flex-column w-100">
        <v-alert type="info" color="blue" icon="mdi-information">
          <span class="mx-auto">{{ this.getInfoMessage() }}</span>
        </v-alert>
      </div>
      <v-list v-else>
        <v-list-item v-for="(connection, i) in this.connectionsList" :list="connection">
          <template v-slot:prepend>
            <v-avatar :image="connection.receiver.avatar" />
          </template>
          <div class='d-flex flex-row'>
            <v-list-item-title>
              <div class="d-flex flex-column">
                <p>{{ connection.receiver.username }}</p>
                <p
                  v-if="this.kind === 'Friends'"
                  class="status text-caption font-italic"
                  :class="{'online': connection.status === 'online'}"
                >
                  {{connection.status}}
                </p>
              </div>
            </v-list-item-title>
            <v-spacer />
            <div v-if="this.kind === 'Friends'">
              <v-icon color="red" @click.prevent="this.onDelete(connection.receiverId)" class="mx-2">mdi-minus</v-icon>
            </div>
            <div v-else>
              <v-icon color="red" @click.prevent="this.onDelete(connection.receiverId)" class="mx-2">mdi-minus</v-icon>
            </div>
          </div>
        </v-list-item>
      </v-list>
    </div>
  </v-card>
</template>

<style scoped>
.relations-content {
  display: flex;
  flex-direction: column;
  padding: 0 1rem 1rem 1rem;
  height: 100%;
  max-height: 20rem;
  overflow: auto;
}

.status {
  color: #a73d3d;
}

.status.online {
  color: #3da73d;
}
</style>