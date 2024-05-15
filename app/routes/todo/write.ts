// import { Todo } from "./schema";
import { Type } from "@sinclair/typebox";
import { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";

export const writePlugin: FastifyPluginAsyncTypebox = async (
  app
): Promise<void> => {
  // const writeHandler =

  app.route({
    url: "/",
    method: "POST",
    schema: {


      body: Type.Object({
        title:Type.String(),
        todo: Type.String(),
      }),

      response: {
        "2xx": Type.Object({
          success: Type.Boolean()
        }),
        "5xx":Type.Object({
          error:Type.String()
        })
      },
    },

    handler: async (req, res) => {
      try {
        req.log.info("At write todo route");

        const { title,todo } = req.body;
        const client = await app.pg.connect();
        const user_id=req.cookies["user_id"];
        if(user_id){

          await client.query(
            'INSERT INTO "todos" (user_id,title,todo) VALUES ($1,$2,$3);',
            [user_id,title,todo]
          );
        client.release(); // Release the client back to the pool

        }



        // res.send("hello");
        return {success:true}
      } catch (err) {
        const errorMessage = (err as Error).message;
        req.log.error(errorMessage);
        res.status(500);
        return { error: "Internal Server Isuue" };
      }
    },
  });
  // app.post("/", writeHandler);
};
