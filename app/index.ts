import { init } from "./utils/init";
import dotenv from 'dotenv';

async function main() {
  dotenv.config();
  const server = await init();


  server.listen({
    port: parseInt((process.env.PORT)as string),
    host:process.env.HOST
  });

  server.ready().then(function started() {
    console.log(server.printPlugins());
      server.printRoutes({ commonPrefix: false, includeHooks: true })
  });
}

main();
