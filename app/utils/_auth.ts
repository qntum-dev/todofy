import { Static, Type } from "@sinclair/typebox";
import { FastifyPluginAsync } from "fastify";
import jwt from "jsonwebtoken";
const access_token_timeout = "2 days";

const secret = "supersecret";

const u = Type.Object({
  id: Type.String(),
  name: Type.String(),
});

type verifyUserType = {
  verified: boolean;
  token: string;
};

export const generateAccessToken = async (user: Static<typeof u>) => {
  return jwt.sign({ id: user.id, name: user.name }, secret, {
    expiresIn: access_token_timeout,
  });
};


declare module "fastify" {
  interface FastifyInstance {
    verify_user(
      access_token: string,
      refresh_token: string
    ): Promise<verifyUserType>;
  }
}

export const verifyUser: FastifyPluginAsync = async (fastify) => {
  fastify.decorate(
    "verify_user",
    async function (
      access_token: string,
      refresh_token: string
    ): Promise<verifyUserType> {
      try {
        fastify.log.info("decoded");
        const decoded = jwt.verify(access_token, secret);

        fastify.log.info(decoded);

        return { verified: true, token: "valid" };
      } catch (error) {
        const err = error as Error;
        if (err.name == "TokenExpiredError") {
          fastify.log.info(err.name);

          let id: string = refresh_token.split("_")[0];
          const client = await fastify.pg.connect();

          const data = await client.query(
            'SELECT name from "user" WHERE id = $1;',
            [id]
          );
          if (data.rows.length < 0)
            return { verified: false, token: "invalid" };

          const creds = await client.query(
            'SELECT refresh_token from "creds" WHERE user_id=$1;',
            [id]
          );
          client.release();
          if (creds.rows.length < 0)
            return { verified: false, token: "invalid" };

          const { refresh_token: token } = creds.rows[0];


          if (refresh_token == token) {
          fastify.log.info("Matched refresh token");

            let tkn_temp = await generateAccessToken({
              id: id,
              name: data.rows[0].name,
            });
            return { verified: true, token: tkn_temp };
          } else {
            return { verified: false, token: "invalid" };
          }
        }
        return { verified: false, token: "invalid" };
      }
    }
  );
};
