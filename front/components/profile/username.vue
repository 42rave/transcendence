<script lang="ts">
import { User } from "~/types/user";

export default defineNuxtComponent({
  props: ["user", "editable"],
  data: () => ({
    uploading: false,
    editing: false,
    error: false,
    details: '',
    username: '',
  }),
  beforeMount() {
    this.username = this.user.username;
  },
  methods: {
    set_error(error: 'string') {
      this.error = true;
      setTimeout(() => {
        this.error = false;
      }, 500);
      this.details = error;
      setTimeout(() => {
        this.details = '';
      }, 5000);
    },
    async updateUsername() {
      const validation = this.validationRules(this.username);
      if (validation !== true) {
        this.set_error(validation);
        return ;
      }
      this.uploading = true;
      const user: User = await this.$api.put('/user/username', {
        body: {
          username: this.username,
        }
      }, (e: any) => {
        switch (e.status) {
          case 400:
            this.set_error(e.data.message);
            break ;
          case 401:
            this.$emit('alert:show', { title: 'Unauthorized', message: e.data.error });
            this.$auth.logout();
            break;
          case 409:
            this.set_error('Username already taken');
            break;
          default:
            this.$emit('alert:show', { title: e.data.message, message: e.data.error });
        }
      })
      if (user) {
        this.$auth.setUser(user);
        this.$emit("user:updated", user);
        this.editing = false;
      }
      this.uploading = false;
    },
    validationRules(value: string) {
      if (!value) return 'Username is required';
      if (value.length < 3) return 'Username must be at least 3 characters long';
      if (value.length > 12) return 'Username must be at most 12 characters long';
      const forbidden_char = value.match(/[^a-zA-Z0-9_\-]/);
      if (forbidden_char) return `Username cannot contain '${forbidden_char[0]}'`;
      return true;
    }
  }
})
</script>

<template>
  <div v-if="!this.editing">
    <div class="d-flex position-relative" :class="{'editable': this.editable }"  @click="this.editing = this.editable">
      <h2> {{ this.user.username }} </h2>
      <v-icon v-if="this.editable" class="ml-3 my-auto">mdi-pencil</v-icon>
    </div>
  </div>
  <div v-else style="width: 12rem" :class="{ 'error-shake': this.error }" @keydown.esc="this.editing = false" @focusout="this.editing = false">
    <v-text-field
      v-model="this.username"
      label="username"
      variant="underlined"
      :autofocus=true
      :loading="this.uploading"
      :error-messages="this.details"
      :rules="[this.validationRules]"
      @keydown.enter.prevent="this.updateUsername"
    >
    </v-text-field>
  </div>
</template>

<style scoped>
.error-shake {
  color: #f16464;
  animation: shake 0.3s; /* Apply shake animation on error */
}
@keyframes shake {
  0% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  50% { transform: translateX(5px); }
  75% { transform: translateX(-5px); }
  100% { transform: translateX(5px); }
}
.editable {
  cursor: pointer;
  padding: 0 2rem;
}
.editable:hover {
  color: #acacac;
}
</style>