<script lang='ts'>
import { Relationship, RelationKind } from '~/types/relation';
export default defineNuxtComponent({
  props: ["user"],
  data: () => ({
    relation: null as Relationship | null,
    loading: false,
    RelationKind,
  }),
  async beforeMount() {
    await this.fetchRelation();
    this.relation = null;
  },
  methods: {
    async fetchRelation() {
      this.loading = true;
      this.relation = await this.$api.get('/relationship/' + this.user.id);
      this.loading = false;
    },
    canAddFriend() {
      return !this.relation || this.relation.kind === RelationKind.BLOCKED;
    },
    async onAddFriend() {
      this.relation = await this.$api.post(`/relationship/${this.user.id}/add`);
    },
    async onBlock() {
      this.relation = await this.$api.post(`/relationship/${this.user.id}/block`);
    },
    async onDelete() {
      this.relation = await this.$api.delete(`/relationship/${this.user.id}`);
      if (this.relation)
        this.relation = '';
    }
  }
})
</script>

<template>
  <v-card width="100%" class="overflow-visible" prepend-icon="mdi-account-group">
    <template v-slot:title>
      Social
    </template>
    <div v-if="!this.loading && this.relation !== undefined" class="friends-content">
      <v-btn v-if="this.canAddFriend()" class="mx-auto" color="primary" @click.prevent="this.onAddFriend" prepend-icon="mdi-account-plus">
        Add to friends
      </v-btn>
      <v-btn v-else-if="this.relation && this.relation.kind === this.RelationKind.FRIEND" color="red" @click.prevent="this.onDelete" prepend-icon="mdi-account-minus">
        Remove friend
      </v-btn>
      <v-btn v-if="this.relation && this.relation.kind === this.RelationKind.BLOCKED" class="ml-2" color="red" @click.prevent="this.onDelete" prepend-icon="mdi-account-check">
        Unblock
      </v-btn>
      <v-btn v-else class="ml-2" color="primary" @click.prevent="this.onBlock" prepend-icon="mdi-account-off">
        Block
      </v-btn>
    </div>
    <div v-else-if="this.loading" class="w-100 pb-4">
      <div class="mx-auto d-flex flex-column">
        <v-progress-circular class="mx-auto" indeterminate size="75" color="primary" />
        <h4 class="mx-auto">Loading...</h4>
      </div>
    </div>
    <div v-else class="d-flex flex-column w-100 pb-4 px-4">
      <v-alert type="error" color="red" icon="mdi-alert">
        <span class="mx-auto">Woops something went wrong</span>
        <v-icon class="reload-btn mx-2" @click="this.fetchRelation">mdi-reload</v-icon>
      </v-alert>
    </div>
  </v-card>
</template>

<style scoped>
.friends-content {
  padding: 0 1rem 1rem 1rem;
  gap: 10px;
}
.reload-btn {
  cursor: pointer;
}
.reload-btn:hover {
  color: #f0c1c1;
}
</style>