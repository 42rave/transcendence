<script lang="ts">
interface IMessage {
  size: number;
  message: string;
}
export default defineNuxtComponent({
  name: 'ChatBox',
  props: ['socket'],
  data: () => ({
     input: '',
    config: useRuntimeConfig(),
    messageList: Array<IMessage>(),
  }),

  methods: {

  }
})
</script>

<template>
  <div class="chatBox">
    <ChatConvDisplay :socket="socket" :messageList="messageList"/>
    <ChatMessageInput :socket="socket" :messageList="messageList"/>
  </div>
</template>

<style scoped>

.chatBox {
  width: 100%;
  height: 100%;
}

</style>