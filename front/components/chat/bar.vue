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
    },

    addNewChannel(newChannel) {
      this.channelList.push(newChannel);
    },

    async joinChannel(id) {
      const res = await $fetch(`http://localhost:3000/chat/channel/${id}/join`, {
        credentials: 'include',
        method: 'POST',
      }).catch((err) => {
          console.log("oopsie");
      });
        if (res)
        {
          this.$channel.currentChannel(res.channel.name, res.channel.id);
          console.log(this.$channel.name);
          console.log(this.$channel.id);
        }
    },

    async joinProtectedChannel(id) {
      console.log(id, ' ', this.protectedPassword);
      
      const res = await $fetch(`http://localhost:3000/chat/channel/${id}/join`, {
        credentials: 'include',
        method: 'POST',
        body: {
          password: '`{this.protectedPassword}`'
        }
      }).catch((err) => {
          console.log("oopsie");
      }) ;
        if (res)
          console.log(res);
    },

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
      	<v-tab prepend-icon="mdi-forum" value="channels"></v-tab>
        <v-tab prepend-icon="mdi-chat" value="private_messages"></v-tab>
        <v-tab prepend-icon="mdi-plus" value="create_channel"></v-tab>
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
                    <v-btn v-if="channel.kind === 'PUBLIC'" flat icon="mdi-location-enter" @click="joinChannel(channel.id)"></v-btn>

                    <v-menu v-if="channel.kind === 'PROTECTED'">
                      <template v-slot:activator="{ props }">
                        <v-btn flat icon="mdi-key-chain-variant" v-bind="props"></v-btn>
                      </template>
                        <v-form @submit.prevent>
                          <v-text-field required hide-details v-model="protectedPassword"></v-text-field>
                          <v-btn type="submit" block @click="joinProtectedChannel(channel.id)">Join Channel</v-btn>
                        </v-form>
                    </v-menu>

                    <v-btn v-if="channel.kind === 'PRIVATE'" flat icon="mdi-lock"></v-btn>

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