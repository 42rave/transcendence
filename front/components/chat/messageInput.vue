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
      if (e.shiftKey) return;
      if (!this.input.trim()) return;
      const res = await this.$api.post(`/chat/channel/${this.$channel.id}/message`, {
        body: {
          body: this.input
        }
      });
      if (res)
      {
        this.$channel.addMessage(res);
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