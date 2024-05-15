import { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { Type } from "@sinclair/typebox";
import { generateAccessToken } from "../../utils/_auth";
import bcrypt from "bcrypt";
import fastifyCookie from "@fastify/cookie";

export const signin: FastifyPluginAsyncTypebox = async (app): Promise<void> => {
  app.route({
    url: "/",
    method: "POST",
    schema: {
      body: Type.Object({
        email: Type.String(),
        password: Type.String(),
      }),
      response: {
        "2xx": Type.Object({ loggedIn: Type.Boolean() }),
        "4xx": Type.Object({ loggedIn: Type.Boolean() }),
        "5xx": Type.Object({ error: Type.String() }),
      },
    },
    handler: async (req, res) => {
      try {
        const { email, password } = req.body;
        // const client = await app.pg.connect();

        const queryText = `
          SELECT u.id, u.name, c.password_hash, c.refresh_token
          FROM "user" u
          JOIN "creds" c ON u.id = c.user_id
          WHERE u.email = $1;
        `;
        const queryValues = [email];
        const { rows } = await app.pg.pool.query(queryText, queryValues);

        if (rows.length === 0) {
          // client.release();
          res.status(401);
          return { loggedIn: false };
        }

        const { id, name, password_hash, refresh_token } = rows[0];
        const loggedIn = await bcrypt.compare(password, password_hash);

        if (loggedIn) {
          const tmp_token = await generateAccessToken({ id, name });
          const a_token = fastifyCookie.serialize("a_token", tmp_token, {
            path: "/",
            httpOnly: true,
            secure: true,
          });
          const r_token = fastifyCookie.serialize("r_token", refresh_token, {
            path: "/",
            httpOnly: true,
            secure: true,
          });
          const user_id = fastifyCookie.serialize("user_id", id, {
            path: "/",
            httpOnly: true,
            secure: true,
          });

          res.header("set-cookie", a_token);
          res.header("set-cookie", r_token);
          res.header("set-cookie", user_id);
          // client.release();
          res.status(200);
          return { loggedIn: true };
        }

        // client.release();
        res.status(401);
        return { loggedIn: false };
      } catch (error) {
        req.log.error(error);
        res.status(500);
        return { error: "Internal server error" };
      }
    },
  });
};