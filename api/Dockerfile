FROM golang:1.24-alpine AS build
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
# build just the main package in this directory
RUN CGO_ENABLED=0 go build -o server .

FROM gcr.io/distroless/base-debian12
WORKDIR /app
COPY --from=build /app/server /app/server
EXPOSE 8081
ENTRYPOINT ["/app/server"]
