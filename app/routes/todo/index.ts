import { FastifyPluginAsync } from "fastify";
import { writePlugin } from "./write";
import { readPlugin } from "./read";
import { verifyUser } from "../../utils/_auth";
import fp from "fastify-plugin";
import { updatePlugin } from "./update";
import { deletePlugin } from "./delete";
import fastifyCookie from "@fastify/cookie";

export const todo: FastifyPluginAsync = async (app) => {
  app.register(fp(verifyUser));

  app.addHook("onRequest", async (req, res) => {
    // console.log(req.cookies["a_token"], req.cookies["r_token"]);
    let a_token: string, r_token: string;
    let verified_token = false;

    if (req.cookies["a_token"] && req.cookies["r_token"]) {
      a_token = req.cookies["a_token"];
      r_token = req.cookies["r_token"];

      const { verified, token } = await app.verify_user(a_token, r_token);
      if (verified == false || token == "invalid") {
        return (verified_token = false);
      }
      if (token == "valid") {
        return (verified_token = true);
      }

      a_token = fastifyCookie.serialize("a_token", token, {
        path: "/",
      });
      verified_token = true;

      res.header("set-cookie", a_token);

      // console.log("verified ", verified);
    }

    if (!verified_token) {
      res.status(401).send("Unauthorized");
    }
    // done();
  });
  app.get("/", async function handler(req, res) {
    res.send("In the todo route");
  });
  app.register(writePlugin, { prefix: "/write" });
  app.register(readPlugin, { prefix: "/read" });
  app.register(updatePlugin, { prefix: "/update" });
  app.register(deletePlugin, { prefix: "/delete" });

};
