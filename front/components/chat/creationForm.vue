<script lang="ts">

export default defineNuxtComponent({
  props: ['socket'],
  data: () => ({
    config: useRuntimeConfig(),
    channelName: '',
    channelKind: '',
    protectedPassword: '',
  }),

  methods: {

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
          
       		this.$emit("channelList:update", res);
        }
    },

  }
})
</script>

<template>
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

</template>