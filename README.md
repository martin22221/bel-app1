# bel-app1
Приложение за подготовка за матура по БЕЛ

## Локална база данни

Необходим е работещ Docker с Docker Compose (например Docker Desktop с Linux containers).
Изпълнявай командите от главната папка на проекта. Порт `5432` трябва да е свободен.

```sh
docker compose up -d
docker compose ps
docker ps
```

Изчакай услугата `db` да стане `healthy`. За да изчакаш готовността още при стартирането,
можеш да използваш `docker compose up -d --wait`.

За връзка от DBeaver/pgAdmin:

| Настройка | Стойност |
| --- | --- |
| Host | `localhost` |
| Port | `5432` |
| Database | `bel_app` |
| User | `bel` |
| Password | `bel` |

Това са настройки за локална разработка. Те съвпадат с `DATABASE_URL` в `server/.env.example`:

```text
postgresql://bel:bel@localhost:5432/bel_app
```

Проверка на връзката през TCP с потребител и парола:

```sh
docker compose exec -e PGPASSWORD=bel db psql -h 127.0.0.1 -U bel -d bel_app -c "SELECT 1;"
```

### Проверка, че данните се запазват

Следните команди създават пробен запис, пресъздават контейнера и прочитат записа отново:

```sh
docker compose exec db psql -U bel -d bel_app -c "CREATE TABLE IF NOT EXISTS compose_persistence_check (id integer PRIMARY KEY, note text NOT NULL); INSERT INTO compose_persistence_check VALUES (1, 'data persists') ON CONFLICT (id) DO NOTHING;"
docker compose down
docker compose up -d --wait
docker compose exec db psql -U bel -d bel_app -c "SELECT * FROM compose_persistence_check WHERE id = 1;"
```

Очакван резултат: ред с `id = 1` и `note = data persists`. След проверката изтрий пробната таблица:

```sh
docker compose exec db psql -U bel -d bel_app -c "DROP TABLE compose_persistence_check;"
```

Спиране:

```sh
docker compose down
```

Данните се пазят в именувания volume `postgres_data`, монтиран в `/var/lib/postgresql/data`.
`docker compose down` запазва този volume. Не добавяй `-v`, ако искаш да запазиш данните:
`docker compose down -v` изтрива volume-а заедно с базата.
