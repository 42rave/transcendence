<script lang="ts">

export default defineNuxtComponent({
  name: 'ChatMessageInput',
  props: ['socket', 'messageList'],
  data: () => ({
	config: useRuntimeConfig(),
    input: '',
  }),

  methods: {
    sendMessage(e: KeyboardEvent) {
	console.log("message sent");
	
      if (e.shiftKey) return;
      if (!this.input.trim()) return;
      $fetch(new URL('/chat/sendTest', this.config.app.API_URL).toString(), {
        credentials: 'include',
        method: 'POST',
        body: JSON.stringify({ message: this.input.trim() }),
      })
      this.input = '';
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