FRONT=./front/

BACK=./back/

all: install_depencies_back install_depencies_front up

up:
	docker compose up -d --build

stop:
	docker compose stop

down:
	docker compose down

install_depencies_back:
	npm install --prefix ${BACK}

install_depencies_front:
	npm install --prefix ${FRONT}

clean:
	docker compose down

fclean: clean
	rm -rfv ${BACK}node_modules dist
	rm -rfv ${FRONT}node_modules .nuxt
	docker system prune --volumes -a -f
	docker volume rm postgres_volume

re: clean up

PHONY: up stop re down install_depencies_back install_depencies_front clean fclean