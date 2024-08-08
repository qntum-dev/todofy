# Todo
This is a todo server built with fastify, TypeScript. PostgreSQL is used as a database.

## Features
- Authentication using JWT and HTTP cookies
- Schema validation
- All CRUD operations on todos

## Starting the server

Note⚠️ To start the server you have to create a .env file.

You can create your own .env file from the .env.template or you can use the .env.demo.

If you want to use .env.demo run this command in the root directory

```
cp ./.env.demo ./.env
```

### To run the server with Docker use this command

```
docker compose up
```

### For LocalHost use the following commands
```
npm i
```
```
npm run start
```
Or

```
pnpm run start
```

You can also change the .env as per your requirements
