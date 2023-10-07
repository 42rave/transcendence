<script lang='ts'>
import type { HistoryDisplay } from '~/types/game';

export default defineNuxtComponent({
  props: ["user"],
  data: () => ({
    history: null as HistoryDisplay[] | null,
    loading: false,
  }),
  async beforeMount() {
    await this.fetchMatchHistory();
  },
  methods: {
    async fetchMatchHistory() {
      this.loading = true;
      this.history = await this.$api.get(`/game/history/${this.user.id}`);
      if (this.history && this.history.length > 0)
        this.history = this.history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      this.loading = false;
    },
    getColor(match: HistoryDisplay) {
      switch (match.state) {
        case 'WON':
          return 'green';
        case 'LOST':
          return 'red';
        case 'DRAW':
          return 'orange';
        default:
          return 'grey';
      }

    },
    formatDate(date: string) {
      return new Date(date).toLocaleString();
    },
    showProfile(id: number) {
      this.$router.push(`/profile/${id}`);
    },
    getPlayerState(match: HistoryDisplay, id: number) {
      switch (match.state) {
        case 'WON':
          return id === match.player_1.id ? 'won' : 'lost';
        case 'LOST':
          return id === match.player_1.id ? 'lost' : 'won';
        default:
          return 'draw';
      }
    }
  }
})
</script>

<template>
<v-card width="100%" class="overflow-visible" prepend-icon="mdi-account-group">
  <template v-slot:title>
    <div class="d-flex flex-row justify-center align-center">
      <span>Match history</span>
      <v-spacer />
      <v-btn icon size="2rem" class="my-1" @click="this.fetchMatchHistory">
        <v-icon size="1rem">mdi-reload</v-icon>
      </v-btn>
    </div>
  </template>
  <div v-if="this.loading" class="w-100 pb-4">
    <div class="mx-auto d-flex flex-column">
      <v-progress-circular class="mx-auto" indeterminate size="75" color="primary" />
      <h4 class="mx-auto">Loading...</h4>
    </div>
  </div>
  <div v-else class="history-content">
    <div v-if="this.history === undefined" class="d-flex flex-column w-100 pb-4 px-4">
      <v-alert type="error" color="red" icon="mdi-alert">
        <span class="mx-auto">Woops something went wrong</span>
        <v-icon class="reload-btn mx-2" @click="this.fetchMatchHistory">mdi-reload</v-icon>
      </v-alert>
    </div>
    <div v-else class="friends-content">
      <div v-if="!this.history || this.history.length === 0" class="d-flex flex-column w-100">
        <v-alert type="info" color="blue" icon="mdi-information">
          <span class="mx-auto">This user no have match history</span>
        </v-alert>
      </div>
      <v-list v-else>
        <v-list-item v-for="match in this.history" :list="match" :color='getColor(match)' :active='true' class='my-2'>
          <div class="d-flex flex-column align-baseline">
            <b>{{ match.state }}</b>
            <div class="d-flex flex-row mx-auto w-100" style="gap: 1rem">
              <v-spacer style="flex-basis: 100%;"/>
              <div class="player left" :class="getPlayerState(match, match.player_1.id)" @click="this.showProfile(match.player_1.id)">
                <span class="ml-auto">
                  {{ match.player_1.username }} -
                  <span class="score">{{ match.player_1.score }}</span>
                </span>
              </div>
              <p style="color: gainsboro">-VS-</p>
              <div class="player right" :class="getPlayerState(match, match.player_2.id)"  @click="this.showProfile(match.player_2.id)">
                <span class="mr-auto">
                  <span class="score">{{ match.player_2.score }}</span>
                   - {{ match.player_2.username }}
                </span>
              </div>
              <v-spacer style="flex-basis: 100%;"/>
            </div>
            <span class="mx-auto" style="font-size: 0.75rem; color: #ababab"><i>{{ formatDate(match.date) }}</i></span>
          </div>
        </v-list-item>
      </v-list>
    </div>
  </div>
</v-card>
</template>

<style scoped>
.history-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 0 1rem 1rem 1rem;
}
.player {
  flex-basis: 100%;
  display: flex;
  cursor: pointer;
  padding: 0.25rem;
  margin: auto;
  color: white;
  font-weight: 600;
  background-color: rgba(91, 84, 84, 0.37);
  border-radius: 0.5rem;
}
.player:hover {
  background-color: rgba(128, 118, 118, 0.5);
}
.player.won .score {
  color: #3da73d;
}
.player.lost .score {
  color: #f16464;
}
.score.draw {
  color: orange;
}
</style>