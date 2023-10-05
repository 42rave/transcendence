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
    channelName: '',
    channelKind: '',
    protectedPassword: '',
  }),

  beforeMount() {
    this.displayChannels();
  },

  mounted () {
    this.socket?.on('chat:create', (data: IChannel) => {
      this.displayChannels();
    })
  },

  unmounted() {
    this.socket?.off('chat:create');
  },

  methods: {
    async displayChannels() {
      const channels = await this.$api.get('/chat/channel');          
      if (channels)
      {
        this.channelList = channels;
      }
    },

    addNewChannel(newChannel) {
      this.channelList.push(newChannel);
    },

    async joinChannel(id) {
      const res = await this.$api.post(`/chat/channel/${id}/join`, {
        body: {
          socketId: this.socket.id
        }
      });
        if (res)
        {
          this.$channel.currentChannel(res.channel.name, res.channel.id);
          this.$channel.clearMessages();        
        }
    },

    async joinProtectedChannel(id) {    
      const res = await this.$api.post(`/chat/channel/${id}/join`, {
        body: {
          socketId: this.socket.id,
          password: this.protectedPassword
        }
      }) ;
        if (res)
          this.$channel.currentChannel(res.channel.name, res.channel.id);
          this.$channel.clearMessages();
          this.$refs.form.reset();
    },

    isInChannel(id: number) {
      return this.$chat.channelConnections.has(id);
    },

    channelIconUpdate(channel) {
      if (this.isInChannel(channel.id))
      {
        return 'mdi-check-circle-outline';
      }
      switch (channel.kind) {
        case 'PUBLIC':
          return 'mdi-location-enter';
        case 'PROTECTED':
          return 'mdi-key-chain-variant';
        case 'PRIVATE':
          return 'mdi-lock';
      }
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
  <v-navigation-drawer v-model=_drawer location="right" width="320">
    <div class="d-flex flex-row">
      <v-tabs v-model="tab" direction="vertical">
      	<v-tab value="channels"><v-icon icon="mdi-forum" /></v-tab>
        <v-tab value="private_messages"><v-icon icon="mdi-chat" /></v-tab>
        <v-tab value="create_channel"><v-icon icon="mdi-plus" /></v-tab>
      </v-tabs>

      <v-divider :thickness="2" inset vertical></v-divider>

      <v-window v-model="tab">
      	<v-window-item value="channels">
          <v-card flat width="230">
            <v-card-text>
              <v-list lines="two">
                <v-list-item v-for="channel in channelList" :key="channel.id">
                  {{channel.name}}
                  <template v-slot:append>
                    <v-btn v-if="channel.kind === 'PUBLIC' || isInChannel(channel.id)" flat :icon="channelIconUpdate(channel)" @click="joinChannel(channel.id)">
                    </v-btn>
                    <v-menu v-else-if="channel.kind === 'PROTECTED'">
                      <template v-slot:activator="{ props }">
                        <v-btn flat :icon="channelIconUpdate(channel)" v-bind="props"></v-btn>
                      </template>
                        <v-form @submit.prevent ref="form">
                          <v-text-field required hide-details v-model="protectedPassword"></v-text-field>
                          <v-btn type="submit" block @click="joinProtectedChannel(channel.id)">Join Channel</v-btn>
                        </v-form>
                    </v-menu>

                    <v-btn v-else-if="channel.kind === 'PRIVATE'" flat :icon="channelIconUpdate(channel)"></v-btn>

                  </template>
                </v-list-item>
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

      	<v-window-item value="create_channel">
          <ChatCreationForm @channelList:update="addNewChannel" />
        </v-window-item>
      </v-window>
    </div>
  </v-navigation-drawer>
</template>

<style scoped>

.v-tab.v-tab {
  min-width: 0 !important;
}

</style>
