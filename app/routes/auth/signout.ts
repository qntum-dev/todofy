import { Type } from "@sinclair/typebox";
import { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";

export const signout: FastifyPluginAsyncTypebox = async (
  app
): Promise<void> => {
  app.route({
    url: "/",
    method: "GET",
    schema: {
      response: {
        "2xx": Type.Object({
          loggedOut: Type.Boolean(),
        }),
        "4xx": Type.Object({
          loggedOut: Type.Boolean(),
        }),
        "5xx": Type.Object({
          error: Type.String(),
        }),
      },
    },
    handler: async (req, res) => {
      try {
        req.log.info(req.body);

        for (const key of Object.keys(req.cookies)) {
          req.log.info(key);
          res.header(
            "set-cookie",
            `${key}=; Expires=${new Date(0).toUTCString()}; Path=/`
          );
        }

        return {
          loggedOut: true,
        };
      } catch (error) {
        const err = error as Error;
        res.status(500);

        req.log.error(err);
        return {
          loggedOut: false,
        };
      }
    },
  });
};
