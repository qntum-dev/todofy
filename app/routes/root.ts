import { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";

export const root: FastifyPluginAsyncTypebox = async (fastify) => {

  fastify.get("/", async function root(req, res) {
    res.send("Hello World");
  });

};
