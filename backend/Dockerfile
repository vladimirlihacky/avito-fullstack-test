FROM golang:1.26.1-alpine3.22 AS base
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .

FROM base AS test
RUN apk add --no-cache docker-cli

FROM base AS build
RUN CGO_ENABLED=0 GOOS=linux go build -o /main ./cmd/backend/main.go

FROM alpine:3.22 AS run

RUN adduser -D backend
USER backend
WORKDIR /
COPY --from=build /main /main
EXPOSE 8080
ENTRYPOINT ["/main"]