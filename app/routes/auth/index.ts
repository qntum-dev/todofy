import { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { signup } from "./signup";
import { signin } from "./signin";
import { signout } from "./signout";


export const auth:FastifyPluginAsyncTypebox=async(app):Promise<void>=>{
    app.register(signup,{prefix:"/signup"})
    app.register(signin,{prefix:"/signin"})
    app.register(signout,{prefix:"/signout"})


}