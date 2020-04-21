.PHONY:

install:
	./setup
stop:
	docker-compose down

build: stop
	docker-compose build

build-ci:
	docker-compose -f docker-compose.ci.yaml build

deploy:
	./deploy

dev: build
	docker-compose up -d
	docker-compose ps
