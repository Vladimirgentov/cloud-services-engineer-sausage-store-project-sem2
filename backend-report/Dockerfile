FROM golang:1.22-alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -o sausage-reporter .

FROM alpine:3.20

WORKDIR /app

COPY --from=builder /app/sausage-reporter /app/sausage-reporter

EXPOSE 8080

CMD ["/app/sausage-reporter"]
