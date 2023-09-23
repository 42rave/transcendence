<script lang="ts">
interface IMessage {
  size: number;
  message: string;
}
export default defineNuxtComponent({
  name: 'ChatBox',
  props: ['socket'],
  data: () => ({
    drawer: false,
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
        <div class="chatFooter">
          <ChatMessageInput :socket="socket"/>
          <ChatMenu @drawer:click="drawer = !drawer"/>
        </div>
    </div>
    <ChatBar @drawer:update="(v: boolean) => drawer = v" :drawer="drawer"/>
</template>

<style scoped>

.chatBox {
  width: 100%;
  max-width: 1000px;
  height: 100%;
}

.chatFooter {
  width: 100%;
  display: flex;
}

</style>