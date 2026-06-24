FROM maven:3.9.9-eclipse-temurin-17 AS builder

ARG VERSION=1.0.0
ENV VERSION=${VERSION}

WORKDIR /usr/src/app

COPY ./src ./src
COPY *.xml ./

RUN mvn package -DskipTests -Dversion.application=${VERSION}

FROM eclipse-temurin:17-jre-alpine

ARG VERSION=1.0.0
ENV VERSION=${VERSION}

WORKDIR /app

RUN addgroup -S jaruser \
    && adduser -S -D -H -s /sbin/nologin -G jaruser jaruser \
    && apk add --no-cache dumb-init curl \
    && mkdir -p /logs/reports \
    && chown -R jaruser:jaruser /logs /app

COPY --chown=jaruser:jaruser \
    --from=builder /usr/src/app/target/sausage-store-${VERSION}.jar ./sausage-store.jar

EXPOSE 8080

USER jaruser

ENTRYPOINT ["dumb-init", "java", "-jar", "-Dmyserver.bindPort=8080", "./sausage-store.jar"]
