<script lang='ts'>
import { Relationship } from '~/types/relation';

export default defineNuxtComponent({
  props: ["kind"],
  data: () => ({
    connectionsList: null as Relationship[] | null,
    loading: true,
  }),
  beforeMount() {
    this.fetchRelations();
  },
  methods: {
    getIcon() {
      return this.kind === 'Blocked' ? 'mdi-account-off' : 'mdi-account-group';
    },
    getInfoMessage() {
      return this.kind === 'Blocked' ? 'You have no blocked users' : 'You have no friends';
    },
    async fetchRelations() {
      this.loading = true;
      this.connectionsList = await this.$api.get(`/relationship/${this.kind.toLowerCase()}`);
      if (this.connectionsList) {
        this.connectionsList = this.sortConnections(this.connectionsList);
      }
      this.loading = false;
    },
    async onDelete(connectionId: number) {
      this.$api.delete(`/relationship/${connectionId}`);
      this.connectionsList = this.connectionsList!.filter((connection) => connection.receiverId !== connectionId);
    },
    sortConnections(connections: Relationship[]) {
      if (this.kind === 'Friends') {
        connections.sort((a: Relationship, b: Relationship) => {
          const cmp = a.status.localeCompare(b.status);
          return !!cmp ? -cmp : a.receiver.username.localeCompare(b.receiver.username);
        });
      }
      else connections.sort((a, b) => a.receiver.username.localeCompare(b.receiver.username));
      return connections;
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
        <v-list-item v-for="connection of this.connectionsList" :key="connection.receiverId">
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