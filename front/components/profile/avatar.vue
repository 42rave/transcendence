<template>
  <div v-if="this.uploading" class="uploading d-flex flex-column align-center my-2">
    <v-progress-circular class="ma-auto" indeterminate size="75" color="primary" />
    <h2>Uploading...</h2>
  </div>
  <div v-else class="d-flex flex-column align-center">
    <div class="placeholder my-2" :class="{'pointer': this.editable}">
      <v-avatar size="150" class="avatar avatar-blur" :image="this.user.avatar"></v-avatar>
      <v-avatar size="150" class="avatar" :image="this.user.avatar" />
      <input v-if="this.editable" class="avatar-prevent" type="file" id="file" accept="image/gif,image/jpeg,image/png" @change="this.uploadFile">
    </div>
  </div>
</template>

<script lang="ts">
import type { User } from "~/types/user";

export default defineNuxtComponent({
  props: ["user", "editable"],
  data: () => ({
    uploading: false,
  }),
  methods: {
    async uploadFile(e: any) {
      try {
        console.log(e.target.files[0]);
        const formData = new FormData();
        formData.append("file", e.target.files[0]);
        this.uploading = true;
        await this.$api.post("/user/avatar", {
          body: formData
        }).then((data: { user: User } | undefined) => {
          if (!data) return ;
          data.user.avatar = data.user.avatar + '?' + new Date().getTime(); // the new date is only to bypass cache and reload the new image.
          this.$auth.setUser(data.user);
          this.$emit("user:updated", data.user);
        });
      } catch (e) {}
      this.uploading = false;
    }
  }
});
</script>

<style scoped>
.uploading {
  width: 150px;
  height: 150px;
}

.pointer {
  cursor: pointer;
}

.placeholder {
  position: relative;
}

.avatar-prevent {
  opacity: 0;
  cursor: pointer;
}

.avatar-blur, .avatar-prevent {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  transition: filter 0.25s ease;
}

.placeholder:hover .avatar-blur {
  -webkit-filter: blur(2rem);
  -moz-filter: blur(2rem);
  -o-filter: blur(2rem);
  -ms-filter: blur(2rem);
  filter: blur(2rem);
}
</style>

