import { Type } from "@sinclair/typebox";
import { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import bcrypt from "bcrypt";
import { DatabaseError } from "pg";
import { v4 as uuidv4 } from "uuid";
import { generateAccessToken } from "../../utils/_auth";
import cookie from "@fastify/cookie";

export const signup: FastifyPluginAsyncTypebox = async (app): Promise<void> => {
  app.route({
    url: "/",
    method: "POST",
    schema: {
      body: Type.Object({
        name: Type.String(),
        email: Type.String(),
        password: Type.String(),
      }),
      response: {
        "2xx": Type.Object({
          data: Type.String(),
        }),
        "4xx": Type.Object({
          error: Type.String(),
        }),
        "5xx": Type.Object({
          error: Type.String(),
        }),
      },
    },
    handler: async (req, res) => {
      const { name, email, password } = req.body;

      const client =await app.pg.connect();
      try {
        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(password, salt);


        try {
          const { rows: existingUser } = await client.query(
            'SELECT id from "user" WHERE email = $1 FOR UPDATE;',
            [email]
          );

          if (existingUser.length > 0) {
            res.status(409);
            return { error: "User already exists" };
          }

          const newUserQuery = {
            text: 'INSERT INTO "user" (name, email) VALUES ($1, $2) RETURNING id;',
            values: [name, email],
          };

          const { rows: newUser } = await client.query(newUserQuery);

          const tmp_token = await generateAccessToken({
            id: newUser[0].id,
            name: name,
          });

          const refresh_token = newUser[0].id + "_" + uuidv4();

          const credentialsQuery = {
            text:
              'INSERT INTO "creds" (user_id, password_hash, refresh_token) VALUES ($1, $2, $3);',
            values: [newUser[0].id, hashedPass, refresh_token],
          };

          await client.query(credentialsQuery);

          client.release()

          // await client.query("COMMIT");

          const a_token = cookie.serialize("a_token", tmp_token, { path: "/" });
          const r_token = cookie.serialize("r_token", refresh_token, { path: "/" });
          const user_id = cookie.serialize("user_id", newUser[0].id, { path: "/" });

          res.header("set-cookie", [a_token, r_token, user_id]);

          return { data: "Successfully created the user" };
        } catch (error) {
          // await client.query("ROLLBACK");

          client.release()
          if (error instanceof DatabaseError && error.code === "23505") {
            res.status(409);
            return { error: "User already exists" };
          }
          throw error;
        }
      } catch (error) {
        client.release()
        console.error(error);
        res.status(500);
        return { error: "Internal Server Issue" };
      }
    },
  });
};
