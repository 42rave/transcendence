<script lang="ts">
import { User } from "~/types/user";
interface IChannel {
  id: number;
  name: string;
}

export default defineNuxtComponent({
  props: ['socket'],
  data: () => ({
    user: null as User | null,
    username: '',
    loading: false,
    error_message: '',
	  privateConvList: Array<IChannel>(),
	  convName: '',
  }),
  beforeMount() {
    this.getPrivConvList();
  },

  methods: {
    async fetchUser() {
      this.loading = true;
      this.user = await this.$api.get(`/user/name/${this.username}`, null, (err: any) => {
        if (err.statusCode === 418) {
          this.error_message = 'User not found';
          setTimeout(() => {
            this.error_message = '';
          }, 3000);
        }
        else if (err.statusCode === 401)
          this.$auth.logout();
        else
          this.$emit('alert:error', {title: 'Error', message: err.message});
      });
      this.loading = false;
    },

    async getPrivConvList() {
      const res = await this.$api.get(`/chat/privmsg/`);
      this.privateConvList = res;
    },

	  async joinPrivateConv(user: User) {
      const res = await this.$api.post(`/chat/privmsg/${user.id}/join`, {
        body: {
          socketId: this.socket.id
        }
      });
      if (res)
        {
          this.$channel.getCurrentChannel(res.name, res.channel.id, res.channel.role, res.channel.kind);
          this.$channel.clearMessages();
          this._drawer = false;    
        }
    },

    async startChat(conv) {
        const convId = this.$auth.user.id === conv[0].userId ? conv[1].userId : conv[0].userId;
        const res = await this.$api.post(`/chat/privmsg/${convId}/join`, {
        body: {
          socketId: this.socket.id
        }
      });
        if (res)
        {
          this.$channel.getCurrentChannel(res.name, res.channel.id, res.channel.role, res.channel.kind);
          this.$channel.clearMessages();
          this._drawer = false;   
        }
    },

  }
})
</script>

<template>
	<v-container style="width=100%">
  		<v-text-field
    	v-model="this.username"
    	label="Username"
    	append-inner-icon="mdi-account-search"
    	@keyup.enter="this.fetchUser()"
    	:error-messages="this.error_message"/>
  		<div v-if="this.loading" class="d-flex justify-center">
    		<v-progress-circular indeterminate color="primary"></v-progress-circular>
  		</div>
  		<v-list-item v-else-if="this.user">
   			<template v-slot:prepend>
      			<v-avatar :image="user.avatar" />
    		</template>
			<div class="d-flex flex-row">
    			<div class='d-flex flex-column'>
         			<p>{{ user.username }}</p>
		  				<v-spacer/>
          			<p class="status text-caption font-italic"
              		:class="{'online': user.status === 'online'}">
           				 {{ user.status }}</p>
    			</div>
		 			<v-spacer/>
            	<v-btn size="small" color="blue" icon @click="joinPrivateConv(user)"><v-icon>mdi-send</v-icon></v-btn>
			</div>
  		</v-list-item>


		<v-list lines="two">
      <div class="privmsg" v-for="privateConv in this.privateConvList" :key="privateConv.id"> 
        {{ privateConv.name }}
        <v-btn size="small" color="blue" icon @click="startChat(privateConv.channel.channelConnection)"><v-icon>mdi-send</v-icon></v-btn>
      </div>
		  <v-divider/>
		</v-list>


	</v-container>
</template>

<style scoped>
.status {
  color: #a73d3d;
}

.status.online {
  color: #3da73d;
}
.remove-zone:hover .btn {
  background-color: #4b3434;
  border-radius: 50%;
}

.privmsg {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
}

</style>