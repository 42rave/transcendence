<script lang="ts">

export default defineNuxtComponent({
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
  beforeMount(){
    this.channelName = this.$channel.name;
    this.channelKind = this.$channel.kind;
  },
  methods: {

    async updateChannel() {
      const res = await this.$api.patch(`/chat/channel/${this.$channel.id}`, {
        body: {
          id: this.$channel.id,
          name: this.channelName,
          kind: this.channelKind,
          password: this.channelKind === 'PROTECTED' ? this.protectedPassword : null,
          socketId: this.socket.id,
        }
      });

      if (res) {
      	this.$emit("channelList:update", res);
        this.$event('alert:success', {message: 'Channel successfully updated'})
        this.$refs.form.reset();
        this.channelName = res.name;
        this.channelKind = res.kind;
        this.protectedPassword = '';
      }
    },

    async validate() {
      const { valid } = await this.$refs.form.validate();
      if (valid)
        this.updateChannel();
    }

  }
})
</script>

<template>
        BOOON, tout ne marche pas, mais c'est un début sur lequel tu peux te baser..
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
                      label="Password (optional)"
                      hide-details
                      required
                    ></v-text-field>
                  </v-col>

                  <v-col cols="12">
                    <v-btn type="submit" @click="validate" block>Update Channel</v-btn>
                  </v-col>
                </v-row>
    </v-container>
  </v-form>

</template>