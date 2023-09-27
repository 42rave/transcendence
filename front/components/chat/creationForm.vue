<script lang="ts">

export default defineNuxtComponent({
  props: ['socket'],
  data: () => ({
    valid: false,
    config: useRuntimeConfig(),
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

    async createChannel() {
      const res = await $fetch(new URL('/chat/channel/', this.config.app.API_URL).toString(), {
        credentials: 'include',
        method: 'POST',
        body: {
          name: this.channelName,
          kind: this.channelKind,
          password: this.protectedPassword,
        }
      }).catch((err) => {
        if (err.statusCode == 500)
        {
          this.$event('alert:show', {title: 'Channel already exists', message: 'choose another name'});
          return;
        }
        
        this.$event('alert:show', {title: 'Invalid input', message: 'try again'})
      });
        if (res) {
       		this.$emit("channelList:update", res);
          this.$event('alert:show', {title: 'Channel successfully created', message: 'chat away'})
          this.$refs.form.reset();
        }
    },

    async validate() {
      const { valid } = await this.$refs.form.validate();
      console.log(valid);
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

                  <v-col cols="12" >
                    <v-text-field v-model="protectedPassword"
                      label="Password (optional)"
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