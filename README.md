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

You need to deploy first a mysql database (see `fly-mysql/` dir)

Then you need to deploy the app itself (see `fly.toml` file)

You can use the `fly.io`'s internal ipv6 net to connect to the database (for example `DATABASE_URL=mysql://user:1234@my-chat-app-database.internal:3306/chat`).

Set the corresponding envs using `fly secrets set ENV_NAME=env_value` command. Make sure to replace `ENV_NAME` and `env_value` with your actual environment variable names and values.


## What works:

- Chatting with different models
- Using OpenAI api and or using OpenRouter
- Authentication with Google Oauth
- Saving conversations in the database
- PWA and offline support (readonly, you can't prompt offline)
- Generating multiple responses in parallel
- Leaving a chat and returning later doesn't stop the generation
- Reloading doesn't stop the generation
- Pseudo resumeability (when you reload, will still generate but it will be actually polling the server each second for the pending message)
- Large amount of chats (with virtual scrolling)
- Fast and responsive UI
- Working on mobile
- Preview color, emoji, title and last sent message in the chat list
- Delete chats