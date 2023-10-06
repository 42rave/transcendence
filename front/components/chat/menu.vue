<script lang="ts">

export default defineNuxtComponent({
  name: 'ChatMenu',
  props: ['drawer'],
  data: () => ({
  }),

  methods: {
    getIcon() {
      if (!this.drawer)
        return "mdi-chevron-left"
      return "mdi-chevron-right"
    }
  },

})
</script>

<template>
  <div id="wip">
    <v-icon :icon="getIcon()" size="2.5rem" class="menu-icon" style=""/>
  </div>
</template>

<style scoped>

.menu {
	align-self: center;
	background-color: purple;
}

#wip {
  position: relative;
  margin-left: auto;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
}

#wip:hover {
  cursor: pointer;
}

.menu-icon:hover {
  color: #7b1414;
}
</style>