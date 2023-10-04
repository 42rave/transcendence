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

  mounted() {
    this.$chat.currentConnections();
    this.$chat.currentRelationships();
  },

  methods: {

  }
})
</script>

<template>
    <div class="chatBox">
      <ChatConvDisplay :socket="socket"/>
        <div class="chatFooter">
          <ChatMessageInput :socket="socket"/>
          <ChatMenu @drawer:click="drawer = !drawer"/>
        </div>
    </div>
    <ChatBar :socket="socket" @drawer:update="(v: boolean) => drawer = v" :drawer="drawer"/>
</template>

<style scoped>

.chatBox {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column
;
}

.chatFooter {
  width: 100%;
  display: flex;
}

</style>