import { defineStore } from 'pinia';

enum Colour {
	RED,
	BLUE,
	PURPLE,
}

interface Coord {
	x: number;
	y: number;
}

interface Ball {
	colour: Colour;
	coord: Coord;
	diameter: number;
}

export const useGameStore = defineStore('game', {
    actions: {
		async getBall () {
            const ball = await $fetch<Ball[]>(`${useRuntimeConfig().app.API_URL}/game/ball`, {
				credentials: 'include'
			}).catch((err) => {
				console.log(err.response._data.message);
			})
			if (ball)
                console.log("Yayee");
            else
                console.log("It's a nope");
		}

    }
})
