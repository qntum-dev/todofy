import { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { Type } from "@sinclair/typebox/type";

export const readPlugin: FastifyPluginAsyncTypebox = async (
  app
): Promise<void> => {
  app.route({
    url: "/",
    method: "GET",
    schema: {
      querystring: Type.Object({
        page: Type.Optional(Type.Number()),
      }),
      response: {
        "2xx": Type.Object({
          data: Type.Array(
            Type.Object({
              id: Type.String(),
              title: Type.String(),
              todo: Type.String(),
            })
          ),
        }),
        "5xx": Type.Object({
          error: Type.String(),
        }),
      },
    },
    handler: async (req, res) => {
      req.log.info("At read todo route");
      // const {} =req.query;

      try {
        const client = await app.pg.connect();
        const { page } = req.query;

        if (!page) {
          req.log.info("No page is given");
        }
        const user_id = req.cookies["user_id"];

        if (user_id) {
        }
        const { rows } = await client.query(
          'SELECT * FROM "todos" WHERE user_id = $1 LIMIT 5;',
          [user_id]
        );
        client.release();
        res.status(200);
        return { data: rows };
      } catch (error) {
        
        res.status(500);
        const errMessage = (error as Error).message;
        req.log.error(errMessage);
        return {error:"Internal Server error"}
      }
    },
  });
};
