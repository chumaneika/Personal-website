# syntax=docker/dockerfile:1

FROM eclipse-temurin:17.0.19_10-jdk-jammy AS build

WORKDIR /app

COPY .mvn .mvn
COPY mvnw pom.xml ./
RUN chmod +x mvnw

COPY src src
RUN --mount=type=cache,target=/root/.m2 \
    ./mvnw -DskipTests package \
    && cp target/*.jar app.jar

FROM eclipse-temurin:17.0.19_10-jre-jammy

WORKDIR /app

RUN groupadd --system app \
    && useradd --system --gid app --no-create-home app

COPY --from=build /app/app.jar app.jar

USER app

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
