# include .env

all: docker_build docker_run

docker_build :
	docker build -t front_image .

docker_run : 
	docker run -i -v .:/app -p 3001:3000 --name frontend front_image

clean:
	docker rm $(shell docker ps -a --filter "name=frontend" -q) -f

fclean: clean
	docker rmi -f $(shell docker images -q)
	docker system prune --volumes -f

re: clean all

PHONY: all docker_build docker_run clean fclean re