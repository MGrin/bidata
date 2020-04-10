.PHONY:

install:
	./setup
stop:
	docker-compose down

build: stop
	docker-compose build

dev: build
	docker-compose up -d
	docker-compose ps
