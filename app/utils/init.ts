import fastify from "fastify";
import { logger } from "./logger";
import { root } from "../routes/root";
import { todo } from "../routes/todo";
import { auth } from "../routes/auth";
import cookie from "@fastify/cookie";
import type { FastifyCookieOptions } from "@fastify/cookie";
import db from "../db/db";

export async function init() {
  const app = fastify({
    logger: logger,
  });


  // app.log.info("process.env.DB_PASSWORD");
  // app.log.info(process.env.DB_PASSWORD);
  app.register(db);



  // app.pg.connect();

  app.register(root, { prefix: "/" });
  app.register(auth, { prefix: "/auth" });

  app.register(cookie, {
    secret: "secret", // for cookies signature
    parseOptions: {
      httpOnly: true,
      secure: true,
      path: "/",
    }, // options for parsing cookies
  } as FastifyCookieOptions);

  app.register(todo, { prefix: "/todo" });

  return app;
}
