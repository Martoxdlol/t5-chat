# t5-chat

Try it at: [https://t5-chat.fly.dev/](https://t5-chat.fly.dev/)

## How to deploy locally:

1. Clone the repo

2. You need:
    - Docker
    - Google Oauth keys (client ID and Client Secret) for authentication
    - OpenRouter or OpenAI API key

3. Put that envs (see docker-compose.yml) in a `.env` file

4. Run `docker compose up --build`

5. Run `pnpm db:push:docker` to push schema to local database

## How to deploy on Fly.io:

