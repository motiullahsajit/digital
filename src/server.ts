import express from "express";
import { getPayloadClient } from "./get-payload";
import { nextApp, nextHandler } from "./next-utils";
import * as trpcExpress from "@trpc/server/adapters/express";
import { appRouter } from "./trpc";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

const createContext = ({
  req,
  res,
}: trpcExpress.CreateExpressContextOptions) => ({ req, res });

const start = async () => {
  const payload = await getPayloadClient({
    initOptions: {
      express: app,
      onInit: async (cms) => {
        cms.logger.info(`Admin URL ${cms.getAdminURL()}`);
      },
    },
  });

  await nextApp.prepare();

  app.use((req, res) => nextHandler(req, res));

  app.use(
    "/api/trpc",
    trpcExpress.createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  app.listen(PORT, async () => {
    payload.logger.info(
      `Next.js App URL: ${process.env.NEXT_PUBLIC_SERVER_URL}`
    );
  });
};

start().catch((error) => {
  console.error("Error starting the server:", error);
});
