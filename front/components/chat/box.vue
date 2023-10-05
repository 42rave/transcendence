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
    <div id="title-wrapper" class="d-flex flex-row">
      <h2>{{this.$channel.name}}</h2>
      <ChatMenu @click="drawer = !drawer" :drawer="drawer"/>
    </div>
      <ChatConvDisplay :socket="socket" @drawer:click="drawer = !drawer"/>
        <div class="chatFooter">
          <ChatMessageInput :socket="socket"/>
        </div>
    </div>
    <ChatBar :socket="socket" @drawer:update="(v: boolean) => drawer = v" :drawer="drawer"/>
</template>

<style scoped>

h2 {
  text-align: center;
  width: 100%;
}

.chatBox {
  width: 100%;
  height: 100%;
  gap: 0.rem;
  max-height: calc(100vh - 4rem);
  overflow: hidden;
  display: flex;
  flex-direction: column
;
}

.chatFooter {
  width: 100%;
  display: flex;
  padding: 0 1rem;
  gap: 1rem;
  bottom: 0;
  z-index: 1;
  justify-content: space-around;  
}
</style>