<script lang="ts">
export default defineNuxtComponent({
  props: {
    drawer: {
      type: Boolean,
      default: false,
    },
    routes: {
      type: Object,
      default: () => ({}),
    },
  },
  data: () => ({
    _drawer: true,
  }),
  watch: {
    drawer: {
      immediate: true,
      handler(val) {
        this._drawer = val;
      },
    },
    _drawer: {
      immediate: true,
      handler(val) {
        this.$emit('drawer:update', val);
      },
    }
  },
})
</script>

<template>
  <v-navigation-drawer v-model="_drawer" fixed app>
    <v-list dense>
      <v-list-item v-for="route in routes" :key="route" :to="route.path" router>
        <v-list-item-action>
          <v-icon start end>{{route.icon}}</v-icon>
          <v-list-item-title>{{route.name}}</v-list-item-title>
        </v-list-item-action>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>