<script lang="ts">
interface IChannel {
  name: string;
  owner: string;
}
export default defineNuxtComponent({
  props: ['socket', 'drawer'],
  data: () => ({
    _drawer: true,
    tab: "channels",
    channelList: Array<IChannel>(),
    config: useRuntimeConfig(),
  }),
  mounted () {
    this.displayChannels();
  },
  methods: {
    async displayChannels() {
      const channels = await $fetch(new URL('/chat/channel', this.config.app.API_URL).toString(), {
        credentials: 'include',
        method: 'GET',
      }).catch();
      this.channelList = channels;
    }
  },
    watch: {
    drawer: {
      immediate: true,
      handler(val) {
        this._drawer = val;
      },
    },
    _drawer: {
      immediate: true,
      handler(val) {
        this.$emit('drawer:update', val);
      },
    }
  }
})
</script>

<template>
  <v-navigation-drawer v-model=_drawer location="right">
    <div class="d-flex flex-row">
      <v-tabs v-model="tab" direction="vertical">
      	<v-tab prepend-icon="mdi-forum" value="channels"></v-tab>
        <v-tab prepend-icon="mdi-chat" value="private_messages"></v-tab>
      </v-tabs>
      <v-divider :thickness="2" inset vertical></v-divider>
      <v-window v-model="tab">
      	<v-window-item value="channels">
          <v-card flat>
            <v-card-text>
              <v-list>
                <li v-for="channel in channelList" :key="channel.id">
                  {{channel.name}}
                  <v-divider></v-divider>
                </li>
               </v-list>
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
</template>