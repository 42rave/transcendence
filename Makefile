FRONT=./front/

BACK=./back/

all: install_depencies_back install_depencies_front

install_depencies_back:
	npm install --prefix ${BACK}

install_depencies_front:
	npm install --prefix ${FRONT}

fclean:
	rm -rfv ${BACK}node_modules dist
	rm -rfv ${FRONT}node_modules .nuxt

PHONY: install_depencies_back install_depencies_front fclean