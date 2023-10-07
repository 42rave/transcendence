<script lang="ts">

interface Alert {
  title: string;
  message: string;
  type: string;
  id: number;
  timeout: NodeJS.Timeout;
}

export default defineNuxtComponent({
  data() {
    return {
      alerts: [], // Store the alert messages
    };
  },
  methods: {

    showAlert(title: string, message: string, type: string) {
      const id = this.getNextId();
      const timeout = setTimeout(() => {
        this.removeAlert(id);
      }, 5000);

      const alert: Alert = { title, message, type, id, timeout };
      this.alerts.push(alert);

      if (this.alerts.length > 5) {
        this.removeOldestAlert();
      }
    },
    getNextId(): number {
      const lastElem = this.alerts[this.alerts.length - 1];
      return (lastElem?.id || 0) + 1;
    },
    removeAlert(id: number): void {
      const index = this.alerts.findIndex((alert) => alert.id === id);
      if (index !== -1) {
        const alert = this.alerts.splice(index, 1)[0];
        clearTimeout(alert.timeout);
      }
    },
    removeOldestAlert(): void {
      const oldestAlert = this.alerts.shift();
      if (oldestAlert) {
        clearTimeout(oldestAlert.timeout);
      }
    },

    getColor(alert: { type: string }) {
      return alert.type === 'error' ? 'red': 'success';
    },
  },
  mounted() {
    const { $listen } = useNuxtApp();

    $listen('alert:success', ({ title, message }: { title: string, message: string }) => {
      // Assuming you want to display success messages as well, you can pass a type (e.g., 'success')
      // to distinguish between error and success messages
      this.showAlert(title, message, 'success');
    });

    $listen('alert:error', ({ title, message }: { title: string, message: string }) => {
      // Display error messages with a different type (e.g., 'error')
      this.showAlert(title, message, 'error');
    });
  },
});
</script>

<template>
  <div class="alert-box">
    <v-alert class="alert" v-for="(alert, index) in alerts" :key="index" :type="alert.type" :color="getColor(alert)" closable>
      <template v-slot:prepend>
        <v-icon>{{ alert.type === 'error' ? 'mdi-alert' : 'mdi-check-circle' }}</v-icon>
      </template>
      <template v-slot:text>
        <b>{{ !!alert.title ? `${alert.title}:` : '' }}</b> {{ alert.message }} #{{ alert.id }}
      </template>
    </v-alert>
  </div>
</template>

<style scoped>
.alert-box {
  display: flex;
  flex-direction: column-reverse;
  padding: 2rem;
  gap: 0.5rem;
  position: fixed;
  top: 0;
  right: 0;
  z-index: 9999;
  width: 100%;
  pointer-events: none;
}
.alert {
  pointer-events: all;
}
</style>