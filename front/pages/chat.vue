<script lang="ts">
interface IChannel {
  name: string;
  owner: string;
}
export default defineNuxtComponent({
  props: ['socket'],
  data: () => ({
    rail: true,
    tab: "channels",
    channelList: Array<IChannel>(),
     config: useRuntimeConfig(),
  }),
  mounted () {
    this.displayChannels();
  },
  methods: {
    async displayChannels() {
      console.log("bouh");
      
      const channels = await $fetch(new URL('/chat/channel', this.config.app.API_URL).toString(), {
        credentials: 'include',
        method: 'GET',
      }).catch();
      this.channelList = channels;
      console.log(channels);
      
    }
  }
})
</script>

<template>
  <div class="parent">
    <ChatBox v-if="$sockets.isChatConnected" :socket="socket" />
    <div class="ma-auto d-flex flex-column" v-else>
      <v-progress-circular class="ma-auto" indeterminate size="64" color="purple" />
        Connecting
    </div>
    <v-navigation-drawer  location="right" fixed app>
    <div class="d-flex flex-row">
      <v-tabs v-model="tab" direction="vertical">
        <v-tab prepend-icon="mdi-forum" value="channels"></v-tab>
        <v-tab prepend-icon="mdi-chat" value="private_messages"></v-tab>
      </v-tabs>
      <v-window v-model="tab">
        <v-window-item value="channels">
          <v-card flat>
            <v-card-text>
              <p>liste des channels dispo</p>
            </v-card-text>
          </v-card>
        </v-window-item>
        <v-window-item value="private_messages">
          <v-card flat>
            <v-card-text>
              <p>liste des conversations privées</p>
            </v-card-text>
          </v-card>
        </v-window-item>
      </v-window>

    </div>
    </v-navigation-drawer>

  </div>
</template>

    <!-- <v-navigation-drawer>
      <v-list>
        <li v-for="channel in channelList" :key="channel.id">
        {{channel.name}}
        </li>
      </v-list>
    </v-navigation-drawer> -->

<style>
.drawer__icon {
  align-item: end;
  width: 50px;

}
</style>