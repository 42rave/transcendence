<script lang='ts'>
import { GameStats } from '~/types/game';

export default defineNuxtComponent({
  props: ['user'],
  data: () => ({
    loading: false,
    stats: null as GameStats | null,
    error: true
  }),
  mounted() {
    this.fetchStats();
  },
  methods: {
    async fetchStats() {
      this.loading = true;
      this.stats = await this.$api.get(`/game/stats/${this.user.id}`);
      this.loading = false;
    }
  }
})
</script>

<template>
  <v-card width="100%" class="overflow-visible" prepend-icon="mdi-chart-line">
    <template v-slot:title>
      <div class="d-flex flex-row justify-center align-center">
        <span>Stats</span>
        <v-spacer />
        <v-btn icon size="2rem" class="my-1" @click="this.fetchStats">
          <v-icon size="1rem">mdi-reload</v-icon>
        </v-btn>
      </div>
    </template>
    <div v-if="!this.loading && this.stats" class="stats-content">
      <div class="d-flex flex-column">
        <span>total games: {{ this.stats.gameNb || 0 }}</span>
        <span>total win: {{ this.stats.wonNb || 0 }}</span>
        <span>total lost: {{ this.stats.lostNb || 0 }}</span>
        <span>total draw: {{ this.stats.drawNb || 0 }}</span>
        <span>win rate: {{ this.stats.winRatio || 0 }}</span>
        <span>goal scored: {{ this.stats.goalScored || 0 }}</span>
        <span>goal taken: {{ this.stats.goalTaken || 0}}</span>
        <span>goal ratio: {{ this.stats.goalRatio || 0}}</span>
      </div>
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
        <v-icon class="reload-btn mx-2" @click="this.fetchStats">mdi-reload</v-icon>
      </v-alert>
    </div>
  </v-card>
</template>

<style scoped>
.stats-content {
  padding: 0 1rem 1rem 1rem;
  gap: 10px;
}
</style>