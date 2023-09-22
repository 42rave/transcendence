<script lang="ts">
interface IMessage {
  size: number;
  message: string;
}
export default defineNuxtComponent({
  name: 'ChatBox',
  props: ['socket'],
  data: () => ({
    messageList: Array<IMessage>(),
    input: '',
  }),
  beforeMount() {
    this.socket?.on('test:message', (data: { message: string }) => {
      const size = this.messageList.length;
      const message = data.message;
      this.messageList.push({ size, message });
      console.log(this.messageList);
    });
  },
  unmounted() {
    this.socket?.off('test:message');
  },
  methods: {
    sendMessage() {
      if (!this.input) return;
      $fetch(`${this.$config.app.API_URL}/chat/sendTest`, {
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
  <div class="chatBox">
    <div v-for="message in messageList" :key="message.id">
      ({{message.size}}) {{message.message}}
    </div>
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
  </div>
</template>

<style scoped>

.chatBox {
  width: 100%;
}

</style>