<template>
  <v-dialog v-model="show" max-width="500px">
    <v-card>
      <v-card-title>{{ title }}</v-card-title>
      <v-card-text>{{ message }}</v-card-text>
      <v-card-actions>
        <v-btn color="primary" @click="dismiss">OK</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
export default defineNuxtComponent({
  data() {
    return {
      title: '',
      message: '',
      show: false,
    };
  },
  methods: {
    dismiss() {
      this.title = '';
      this.message = '';
      this.show = false;
    },
    showDialog(title: string, message: string) {
      this.show = true;
      this.title = title;
      this.message = message;
    },
  },
  mounted() {
    const { $listen } = useNuxtApp();
    $listen('alert:show', ({title, message}: {title: string, message: string}) => {
      this.showDialog(title, message);
    });
  }
});
</script>