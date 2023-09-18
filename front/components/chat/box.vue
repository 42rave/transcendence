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
    this.config = useRuntimeConfig();
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
      $fetch(new URL('/chat/sendTest', this.config.app.API_URL).toString(), {
        credentials: 'include',
        method: 'POST',
        body: JSON.stringify({ message: this.input }),
      })
      this.input = '';
    },
  }
})
</script>

<template>
  <div>
    <v-text-field
      v-model="input"
      label="Message"
      @keyup.enter="sendMessage"
      hide-details
    />
    <div v-for="message in messageList" :key="message.id">
      ({{message.size}}) {{message.message}}
    </div>
  </div>
</template>