FRONT=./front/

BACK=./back/

THREE_SERVICES=frontend backend database

THREE_IMAGES= front_image back_image postgres

all: install_depencies_back install_depencies_front 
	$(MAKE) up

up:
	docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build --remove-orphans

prod: 
	docker compose up -d --build --remove-orphans

stop:
	docker compose stop ${THREE_SERVICES}

down:
	docker compose down --remove-orphans

install_depencies_back:
	npm install --prefix ${BACK}

install_depencies_front:
	npm install --prefix ${FRONT}

clean: down

fclean: clean
	docker rmi $(THREE_IMAGES) -f
	docker builder prune -f
	docker volume rm postgres_volume

clean_node_modules:
	rm -rfv ${BACK}node_modules dist
	rm -rfv ${FRONT}node_modules .nuxt

re: fclean 
	$(MAKE) up

PHONY: up stop re down install_depencies_back install_depencies_front clean fclean clean_node_modules