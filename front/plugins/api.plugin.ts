import { RuntimeConfig } from "nuxt/schema";

declare type WrapperOptions = {
	body?: { [key: string]: any };
	params?: { [key: string]: string };
}

interface ErrorCallback {
	(reason: any): any;
}

class Api {
	constructor(private readonly $config: RuntimeConfig, private readonly error_callback: ErrorCallback) {}

	private async _fetch(route: string, options: any, customErrorCallback?: ErrorCallback) {
		return $fetch(route, {
			baseURL: this.$config.app.API_URL,
			credentials: 'include',
			...options
		}).catch(customErrorCallback || this.error_callback);
	}

	public async get(route: string, options?: WrapperOptions, customErrorCallback?: ErrorCallback) {
		return this._fetch(route, { method: 'GET', ...options }, customErrorCallback);
	}

	public async post(route: string, options: WrapperOptions, customErrorCallback?: ErrorCallback) {
		return this._fetch(route, { method: 'POST', ...options }, customErrorCallback);
	}

	public async put(route: string, options?: WrapperOptions, customErrorCallback?: ErrorCallback) {
		return this._fetch(route, { method: 'PUT', ...options }, customErrorCallback);
	}

	public async delete(route: string, options?: WrapperOptions, customErrorCallback?: ErrorCallback) {
		return this._fetch(route, { method: 'DELETE', ...options }, customErrorCallback);
	}

	public url(route: string) {
		const baseUri = `${this.$config.app.API_URL}`.replace(/\/+$/, '');
		route = route.replace(/^\/+/, '');
		return `${baseUri}/${route}`;
	}
}

export default defineNuxtPlugin(({ $config, $event, $auth }: any) => {
	const api: Api = new Api($config, (reason: any) => {
		if (!$auth.isAuthenticated || ($auth.user.twoFAEnabled && !$auth.user.twoFALogged))
			return ;
		if (reason.status === 401) {
			$event('alert:show', { title: 'Disconnected', message: reason.data.error});
			$auth.logout();
		}
		else {
			$event('alert:show', { title: reason.data.message, message: reason.data.error});
		}
	});

	const nuxtApp = useNuxtApp();
	nuxtApp.provide('api', api);
});