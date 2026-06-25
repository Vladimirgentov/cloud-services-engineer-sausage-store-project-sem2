# Sausage Store project

Проектная работа по дисциплине **Финальный проект второго семестра**.

В проекте выполнены:

- контейнеризация сервисов приложения «Сосисочная»;
- создание Dockerfile для `backend`, `backend-report` и `frontend`;
- сборка и публикация Docker-образов в Docker Hub;
- создание `docker-compose.yml` для локального запуска приложения;
- добавление Flyway-миграций для PostgreSQL;
- создание Helm chart для деплоя приложения в Kubernetes;
- настройка PostgreSQL и MongoDB в Kubernetes;
- настройка PersistentVolumeClaim для PostgreSQL и MongoDB;
- настройка Service и Ingress для frontend;
- настройка Service для backend и backend-report;
- настройка стратегии деплоя backend через `RollingUpdate`;
- настройка стратегии деплоя backend-report через `Recreate`;
- настройка HPA для backend-report;
- настройка VPA для backend в режиме рекомендаций;
- настройка livenessProbe для backend;
- проверка деплоя в Kubernetes.

## Репозиторий

```text
https://github.com/Vladimirgentov/cloud-services-engineer-sausage-store-project-sem2
```

## Состав проекта

```text
cloud-services-engineer-sausage-store-project-sem2
├── backend
│   ├── Dockerfile
│   └── src
│       └── main
│           └── resources
│               └── db
│                   └── migration
│                       ├── V001__create_tables.sql
│                       ├── V002__change_schema.sql
│                       ├── V003__insert_data.sql
│                       └── V004__create_index.sql
├── backend-report
│   └── Dockerfile
├── frontend
│   ├── Dockerfile
│   └── nginx.conf
├── sausage-store-chart
│   ├── Chart.yaml
│   ├── Chart.lock
│   ├── values.yaml
│   ├── templates
│   │   └── NOTES.txt
│   └── charts
│       ├── backend
│       │   ├── Chart.yaml
│       │   └── templates
│       │       ├── deployment.yaml
│       │       ├── secret.yaml
│       │       ├── service.yaml
│       │       └── vpa.yaml
│       ├── backend-report
│       │   ├── Chart.yaml
│       │   └── templates
│       │       ├── deployment.yaml
│       │       ├── hpa.yaml
│       │       └── service.yaml
│       ├── frontend
│       │   ├── Chart.yaml
│       │   └── templates
│       │       ├── deployment.yaml
│       │       ├── ingress.yaml
│       │       └── service.yaml
│       └── infra
│           ├── Chart.yaml
│           └── templates
│               ├── mongodb.yaml
│               └── postgresql.yaml
├── .docker
│   └── mongo-init.js
├── docker-compose.yml
└── README.md
```

## Docker-образы

Для сервисов приложения созданы Dockerfile:

```text
backend/Dockerfile
backend-report/Dockerfile
frontend/Dockerfile
```

Собранные Docker-образы опубликованы в Docker Hub:

```text
vladimirgentov/sausage-backend:latest
vladimirgentov/sausage-backend-report:latest
vladimirgentov/sausage-frontend:latest
```

## Локальный запуск через Docker Compose

Для локального запуска приложения создан `docker-compose.yml`.

В compose-файле описаны сервисы:

```text
postgresql
mongodb
sausage-backend
sausage-backend-report
sausage-frontend
```

PostgreSQL и MongoDB используются как внутренние сервисы compose-сети.

Запуск:

```powershell
docker compose up -d
```

Проверка статуса контейнеров:

```powershell
docker compose ps
```

Проверка локального backend healthcheck:

```powershell
curl.exe http://localhost:18080/actuator/health
```

Ожидаемый результат:

```json
{"status":"UP"}
```

Frontend локально доступен по адресу:

```text
http://localhost:18000
```

## Flyway-миграции

В backend добавлены Flyway-миграции:

```text
V001__create_tables.sql
V002__change_schema.sql
V003__insert_data.sql
V004__create_index.sql
```

Назначение миграций:

```text
V001__create_tables.sql  — создание таблиц product и orders.
V002__change_schema.sql  — создание связующей таблицы order_product.
V003__insert_data.sql    — заполнение таблиц начальными данными.
V004__create_index.sql   — создание индексов для ускорения запросов.
```

При запуске backend в Kubernetes Flyway успешно применил все 4 миграции:

```text
Successfully validated 4 migrations
Migrating schema "public" to version "001 - create tables"
Migrating schema "public" to version "002 - change schema"
Migrating schema "public" to version "003 - insert data"
Migrating schema "public" to version "004 - create index"
Successfully applied 4 migrations to schema "public", now at version v004
```

## Helm chart

Для деплоя приложения создан Helm chart:

```text
sausage-store-chart
```

Chart состоит из subcharts:

```text
backend
backend-report
frontend
infra
```

В `values.yaml` вынесены основные параметры:

- Docker images;
- ports;
- database connection settings;
- MongoDB connection settings;
- resources requests и limits;
- ingress host;
- параметры HPA;
- параметры VPA;
- параметры PVC.

Проверка chart:

```powershell
helm dependency update .\sausage-store-chart
helm lint .\sausage-store-chart
helm template sausage-store .\sausage-store-chart -n r-devops-magistracy-project-2sem-1130000025920242
```

Результат `helm lint`:

```text
1 chart(s) linted, 0 chart(s) failed
```

## Kubernetes namespace

Деплой выполнен в namespace:

```text
r-devops-magistracy-project-2sem-1130000025920242
```

Helm release:

```text
sausage-store
```

Команда деплоя:

```powershell
helm upgrade --install sausage-store .\sausage-store-chart -n r-devops-magistracy-project-2sem-1130000025920242
```

## Kubernetes-ресурсы

В результате деплоя созданы следующие ресурсы:

```text
Secret x3
Service x5
Deployment x3
StatefulSet x2
HorizontalPodAutoscaler x1
VerticalPodAutoscaler x1
Ingress x1
PersistentVolumeClaim x2
```

## PostgreSQL

PostgreSQL развёрнут как StatefulSet:

```text
postgresql-0
```

Для хранения данных используется PVC:

```text
postgresql-data-postgresql-0
```

Параметры PVC:

```text
STATUS:       Bound
CAPACITY:     1Gi
ACCESS MODE:  RWO
STORAGECLASS: yc-network-hdd
```

Service PostgreSQL:

```text
postgresql   ClusterIP   5432/TCP
```

## MongoDB

MongoDB развёрнута как StatefulSet:

```text
mongodb-0
```

Для хранения данных используется PVC:

```text
mongodb-data-mongodb-0
```

Параметры PVC:

```text
STATUS:       Bound
CAPACITY:     1Gi
ACCESS MODE:  RWO
STORAGECLASS: yc-network-hdd
```

Service MongoDB:

```text
mongodb   ClusterIP   27017/TCP
```

## Backend

Backend развёрнут как Deployment:

```text
sausage-backend
```

Для backend настроены:

- Service `sausage-backend`;
- Secret с подключением к PostgreSQL и MongoDB;
- livenessProbe `/actuator/health`;
- стратегия обновления `RollingUpdate`;
- resources requests и limits;
- VPA в режиме `Off`.

Backend Service:

```text
sausage-backend   ClusterIP   8080/TCP
```

Backend healthcheck:

```powershell
kubectl exec deployment/sausage-backend -- curl -s http://localhost:8080/actuator/health
```

Результат:

```json
{"status":"UP","groups":["liveness","readiness"]}
```

## Backend-report

Backend-report развёрнут как Deployment:

```text
sausage-store-backend-report
```

Для backend-report настроены:

- Service `sausage-backend-report`;
- подключение к MongoDB;
- стратегия обновления `Recreate`;
- resources requests и limits;
- HPA по CPU.

Backend-report Service:

```text
sausage-backend-report   ClusterIP   8080/TCP
```

HPA:

```text
sausage-store-backend-report-hpa   cpu: 1%/75%   min: 1   max: 2   replicas: 1
```

Лог backend-report подтверждает подключение к MongoDB:

```text
Successfully connected to MongoDB
Application is running at 8080
Saving the new report to the database
```

## Frontend

Frontend развёрнут как Deployment:

```text
sausage-store-frontend
```

Для frontend настроены:

- Service `sausage-store-frontend`;
- Ingress;
- HTTPS через wildcard TLS secret;
- resources requests и limits.

Frontend Service:

```text
sausage-store-frontend   ClusterIP   80/TCP
```

Ingress:

```text
NAME:    sausage-store-frontend
CLASS:   nginx
HOST:    front-vladimirgentov.2sem.students-projects.ru
ADDRESS: 158.160.176.69
PORTS:   80, 443
```

Frontend доступен по адресу:

```text
https://front-vladimirgentov.2sem.students-projects.ru
```

Проверка HTTPS:

```powershell
curl.exe -I https://front-vladimirgentov.2sem.students-projects.ru
```

Результат:

```text
HTTP/1.1 200 OK
Content-Type: text/html
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

Проверка HTTP redirect:

```powershell
curl.exe -I http://front-vladimirgentov.2sem.students-projects.ru
```

Результат:

```text
HTTP/1.1 308 Permanent Redirect
Location: https://front-vladimirgentov.2sem.students-projects.ru
```

## Проверка деплоя в Kubernetes

Проверка Helm release:

```powershell
helm list -n r-devops-magistracy-project-2sem-1130000025920242
```

Результат:

```text
NAME            STATUS     CHART                 APP VERSION
sausage-store   deployed   sausage-store-0.1.0   1.0.0
```

Проверка pod'ов:

```powershell
kubectl get pods
```

Результат:

```text
mongodb-0                                       1/1   Running
postgresql-0                                    1/1   Running
sausage-backend-66c8954c74-lr5k9                1/1   Running
sausage-store-backend-report-7b8cbc4975-wpj67   1/1   Running
sausage-store-frontend-64b7596bdf-xvlhr         1/1   Running
```

Проверка PVC:

```powershell
kubectl get pvc
```

Результат:

```text
mongodb-data-mongodb-0         Bound   1Gi   RWO   yc-network-hdd
postgresql-data-postgresql-0   Bound   1Gi   RWO   yc-network-hdd
```

Проверка Service:

```powershell
kubectl get svc
```

Результат:

```text
mongodb                  ClusterIP   27017/TCP
postgresql               ClusterIP   5432/TCP
sausage-backend          ClusterIP   8080/TCP
sausage-backend-report   ClusterIP   8080/TCP
sausage-store-frontend   ClusterIP   80/TCP
```

Проверка Ingress:

```powershell
kubectl get ingress
```

Результат:

```text
sausage-store-frontend   nginx   front-vladimirgentov.2sem.students-projects.ru   158.160.176.69   80,443
```

Проверка HPA:

```powershell
kubectl get hpa
```

Результат:

```text
sausage-store-backend-report-hpa   cpu: 1%/75%   min: 1   max: 2   replicas: 1
```

Проверка VPA:

```powershell
kubectl get vpa
```

Результат:

```text
sausage-backend-vpa   Mode: Off   Provided: True
```

Проверка backend healthcheck:

```powershell
kubectl exec deployment/sausage-backend -- curl -s http://localhost:8080/actuator/health
```

Результат:

```json
{"status":"UP","groups":["liveness","readiness"]}
```

## Проверка rollout

Команды проверки rollout:

```powershell
kubectl rollout status deployment/sausage-backend
kubectl rollout status deployment/sausage-store-frontend
kubectl rollout status deployment/sausage-store-backend-report
```

Результат:

```text
deployment "sausage-backend" successfully rolled out
deployment "sausage-store-frontend" successfully rolled out
deployment "sausage-store-backend-report" successfully rolled out
```

## Использованные стратегии деплоя

Backend:

```yaml
strategy:
  type: RollingUpdate
  rollingUpdate:
    maxUnavailable: 0
    maxSurge: 1
```

Backend-report:

```yaml
strategy:
  type: Recreate
```

## Autoscaling

Для backend-report настроен HorizontalPodAutoscaler:

```yaml
minReplicas: 1
maxReplicas: 2
targetCPUUtilizationPercentage: 75
```

Для backend настроен VerticalPodAutoscaler в режиме рекомендаций:

```yaml
updateMode: "Off"
```

## Resource limits и requests

Для всех основных компонентов заданы requests и limits:

- backend;
- backend-report;
- frontend;
- PostgreSQL;
- MongoDB.

Это позволяет Kubernetes учитывать потребление CPU и памяти при планировании pod'ов, а также использовать HPA/VPA.

## GitHub Actions

В репозитории используется workflow:

```text
.github/workflows/deploy.yaml
```

Для работы workflow нужны GitHub Actions secrets:

```text
DOCKER_USER
DOCKER_PASSWORD
KUBE_CONFIG
```

Назначение секретов:

```text
DOCKER_USER      — имя пользователя Docker Hub.
DOCKER_PASSWORD  — Docker Hub access token с правами Read & Write.
KUBE_CONFIG      — полный kubeconfig для доступа к Kubernetes namespace.
```

Workflow выполняет:

- checkout repository;
- сборку Docker images;
- push images в Docker Hub;
- `helm dependency update`;
- `helm lint`;
- `helm template`;
- `helm upgrade --install`;
- проверку rollout;
- вывод Kubernetes-ресурсов.

## Итог

Приложение успешно контейнеризировано и задеплоено в Kubernetes через Helm.

Итоговое состояние:

```text
Git status: clean
Helm release: deployed
Pods: все 5 pod'ов Running
PVC: MongoDB и PostgreSQL Bound
Ingress: создан и доступен по HTTPS
Backend healthcheck: UP
Flyway migrations: applied, version v004
HPA: создан и получает CPU metrics
VPA: создан, Mode Off, рекомендации Provided=True
```
