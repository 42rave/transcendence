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

    async createChannel() {
      const res = await $fetch(new URL('/chat/channel/', this.config.app.API_URL).toString(), {
        credentials: 'include',
        method: 'POST',
        body: {
          name: this.channelName,
          kind: this.channelKind,
          password: this.protectedPassword,
        }
      }).catch((err) => {console.log('test', err.message)});
        if (res) {
          console.log(res);
          
          this.channelList.push(res);
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
  <v-navigation-drawer v-model=_drawer location="right" width="350">
    <div class="d-flex flex-row">
      <v-tabs v-model="tab" direction="vertical">
      	<v-tab prepend-icon="mdi-forum" value="channels"></v-tab>
        <v-tab prepend-icon="mdi-chat" value="private_messages"></v-tab>
        <v-tab prepend-icon="mdi-plus" value="create_channel"></v-tab>
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
      	<v-window-item value="create_channel">
          <v-form @submit.prevent="createChannel">
             <v-container>
                <v-row>
                  <v-col cols="12">
                    <v-text-field
                    v-model="channelName"
                    label="Name of your channel"
                    required
                    hide-details

                    ></v-text-field>
                  </v-col>

                  <v-col cols="10">
                    <v-radio-group v-model="channelKind">
                      <v-radio label="Public" value="PUBLIC"></v-radio>
                      <v-radio label="Protected" value="PROTECTED"></v-radio>
                      <v-radio label="Private" value="PRIVATE"></v-radio>
                    </v-radio-group>
                  </v-col>

                  <v-col cols="12" >
                    <v-text-field
                      v-model="protectedPassword"
                      label="Password (optional)"
                      hide-details
                      required
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12">
                    <v-btn type="submit" block>Create Channel</v-btn>
                  </v-col>
                </v-row>
    </v-container>
  </v-form>
        </v-window-item>
      </v-window>
    </div>
  </v-navigation-drawer>
</template>