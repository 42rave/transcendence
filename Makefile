FRONT=./front/

BACK=./back/

all: install_depencies_back install_depencies_front

up:
	docker compose up -d --build

stop:
	docekr compose stop

down:
	docker compose down

install_depencies_back:
	npm install --prefix ${BACK}

install_depencies_front:
	npm install --prefix ${FRONT}

clean:
	docker compose down
	docker system prune --volumes -a -f

fclean: clean
	rm -rfv ${BACK}node_modules dist
	rm -rfv ${FRONT}node_modules .nuxt

re: clean up

PHONY: up stop re down install_depencies_back install_depencies_front clean fclean