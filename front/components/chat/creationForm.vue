<script lang="ts">

export default defineNuxtComponent({
  emits: ['channelList:update'],
  props: ['socket'],
  data: () => ({
    valid: false,
    channelName: '',
    channelKind: 'PUBLIC',
    protectedPassword: '',
    nameRule: [
      input => { 
        if (!input)
          return 'Channel must have a name';
        return true;
      }],
  }),

  methods: {

    async joinChannel(id: number) {
      const res = await this.$api.post(`/chat/channel/${id}/join`, {
        body: {
          socketId: this.socket.id
        }
      });
        if (res)
        {
          this.$channel.getCurrentChannel(res.channel.name, res.channel.id, res.role, res.channel.kind);
          this.$channel.clearMessages();
          this.$userChat.currentConnections();
          this._drawer = false;    
        }
    },

    async createChannel() {
      const res = await this.$api.post(`/chat/channel/`, {
        body: {
          name: this.channelName,
          kind: this.channelKind,
          password: this.channelKind === 'PROTECTED' ? this.protectedPassword : null,
        }
      });

      if (res) {
      	this.$emit("channelList:update", res);
        this.$event('alert:success', {title: 'Channel successfully created', message: 'chat away'})
        this.$refs.form.reset();
        this.channelKind = 'PUBLIC';
        this.protectedPassword = '';
        this.joinChannel(res.id);
      }
    },

    async validate() {
      const { valid } = await this.$refs.form.validate();
      if (valid)
        this.createChannel();
    }

  }
})
</script>

<template>
          <v-form v-model="valid" fast-fail @submit.prevent ref="form">
             <v-container>
                <v-row>
                  <v-col cols="12">
                    <v-text-field v-model="channelName"
                    label="Name of your channel"
                    required
                    :rules="nameRule"
                    ></v-text-field>
                  </v-col>

                  <v-col cols="10">
                    <v-radio-group v-model="channelKind">
                      <v-radio label="Public" value="PUBLIC"></v-radio>
                      <v-radio label="Protected" value="PROTECTED"></v-radio>
                      <v-radio label="Private" value="PRIVATE"></v-radio>
                    </v-radio-group>
                  </v-col>

                  <v-col cols="12" v-if="this.channelKind === 'PROTECTED'" >
                    <v-text-field v-model="protectedPassword"
                      label="Password"
                      hide-details
                      required
                    ></v-text-field>
                  </v-col>

                  <v-col cols="12">
                    <v-btn type="submit" @click="validate" block>Create Channel</v-btn>
                  </v-col>
                </v-row>
    </v-container>
  </v-form>

</template>