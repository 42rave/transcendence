<script lang="ts">

</script>

<template>
  <v-card class="settings-box mx-auto" prepend-icon="mdi-cog">
    <template v-slot:title>
      Paramètres
    </template>
    <div class="settings-content overflow-hidden d-flex flex-column w-100">
      <div class="d-flex flex-column h-100 overflow-auto align-center">
        <ProfileAvatar :user="this.$auth.user" :editable="true"/>
        <ProfileUsername :user="this.$auth.user" :editable="true"/>
        <v-divider class="my-3 w-100" thickness="3"></v-divider>
        <v-card width="100%" class="overflow-visible" prepend-icon="mdi-shield-lock">
          <template v-slot:title>
            TOTP
          </template>
          <WidgetTotpSettings />
        </v-card>
        <div class="my-3 w-100"/>
        <v-card width="100%" class="overflow-visible" prepend-icon="mdi-pencil-box-multiple-outline">
          <template v-slot:title>
            Custom color
          </template>
          <WidgetCustomColor />
        </v-card>
      </div>
    </div>
  </v-card>
</template>

<style scoped>
.settings-box {
  width: min(700px, 100%);
  height: min(762px, 100%);
  transition-duration: 0.25s;
}
.settings-content {
  background-color: #282828;
  height: calc(100% - 4rem);
  max-height: calc(100% - 4rem);
  padding: 0 1rem 1rem 1rem;
}
</style>
