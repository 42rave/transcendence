<script lang="ts">
export default defineNuxtComponent({
  name: 'DefaultLayout',
  data() {
    return {
      drawer: true,
      routes: {
        home: {
          name: 'Home',
          path: '/',
          icon: 'mdi-home',
        },
        about: {
          name: 'About',
          path: '/about',
          icon: 'mdi-information',
        },
      },
    }
  },
  head() {
    return {
      title: 'Poc Nuxt + Vuetify',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
    }
  },
  components: {
    //
  },
  methods: {
    navigate(route: string) {
      this.$router.push(route)
    },
  },
})
</script>

<template>
  <v-app dark>
    <v-app-bar fixed app>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>Application</v-toolbar-title>
    </v-app-bar>
    <v-navigation-drawer v-model="drawer" fixed app>
      <v-list dense>
<!--        <v-list-item v-for="route in routes" :key="route" @click="navigate(route.path)" router>-->
        <v-list-item v-for="route in routes" :key="route" :to="route.path" router>
          <v-list-item-action>
            <v-icon start end>{{route.icon}}</v-icon>
            <v-list-item-title>{{route.name}}</v-list-item-title>
          </v-list-item-action>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-main>
      <v-container fluid>
        <slot />
      </v-container>
    </v-main>
  </v-app>
</template>

<style scoped>
.nuxt-link {
  color: inherit;
  text-decoration: none;
  display: inline-flex;
  width: 100%;
}
.v-list-item {
  padding: unset !important;
}
.v-list-item__content {
  height: 100% !important;
}
</style>