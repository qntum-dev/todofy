import fp from "fastify-plugin";
import pg from "@fastify/postgres";

export default fp(async (fastify) => {

  fastify.register(pg, {
    host: process.env.DB_HOST,
    port: parseInt((process.env.DB_PORT)as string),
    database: process.env.DB,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    max:parseInt((process.env.MAX_CONN)as string),
  });
});
