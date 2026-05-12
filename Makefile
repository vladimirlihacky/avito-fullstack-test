.PHONY: test test-unit test-e2e test-docker lint

test-unit:
	cd backend && go test ./internal/... -v -coverprofile=coverage-unit.out
	cd backend && go tool cover -func=coverage-unit.out

test-e2e:
	cd backend && go test ./tests/e2e/... -v -timeout 120s

test-docker:
	docker-compose -f docker-compose.test.yml up --build --abort-on-container-exit
	docker-compose -f docker-compose.test.yml down -v

test: test-unit test-e2e

lint:
	cd backend && golangci-lint run
	cd client && npm run lint