// import { Todo } from "./schema";
import { Type } from "@sinclair/typebox";
import { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";

export const updatePlugin: FastifyPluginAsyncTypebox = async (
  app
): Promise<void> => {
  // const writeHandler =

  app.route({
    url: "/",
    method: "PUT",
    schema: {


      body: Type.Object({
        id:Type.String(),
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
        req.log.info("At update todo route");

        const { id,title,todo } = req.body;
        const client = await app.pg.connect();
        const user_id=req.cookies["user_id"];
        if(user_id){

          await client.query(
            'UPDATE "todos" SET title = $1, todo = $2 WHERE user_id = $3 AND id = $4;',
            [title,todo,user_id,id]
          );

        client.release(); // Release the client back to the pool

        }



        // res.send("hello");
        return {success:true}
      } catch (err) {
        const errorMessage = (err as Error).message;
        req.log.error(errorMessage);
        res.status(500);
        return { error:"Internal Server error" };
      }
    },
  });
  // app.post("/", writeHandler);
};
