<script lang="ts">

export default defineNuxtComponent({
  name: 'ChatMessageInput',
  props: ['socket'],
  data: () => ({
	config: useRuntimeConfig(),
    input: '',
  }),

  methods: {
   async sendMessage(e: KeyboardEvent) {
	console.log("message sent");
	
      if (e.shiftKey) return;
      if (!this.input.trim()) return;
      const res = await $fetch(`http://localhost:3000/chat/channel/${this.$channel.id}/message`, {
        credentials: 'include',
        method: 'POST',
        body: {
          id: this.$channel.id,
          body: this.input
        },
      }).catch((err) => {
          console.log(err.response._data.message);
      });
      if (res)
      {
        this.$channel.addMessage(this.input);
        console.log(this.$channel.messages);
        this.input = '';
      }
    },
  }
})
</script>

<template>
    <v-textarea
      v-model="input"
      label="Message"
      append-inner-icon="mdi-rocket-launch"
      hide-details
      auto-grow
      rows="1"
      max-rows="5"
      @keydown.enter.prevent="sendMessage"
      @keydown.enter.shift="input += '\n'"
      @click:append-inner="sendMessage"
    />
</template>