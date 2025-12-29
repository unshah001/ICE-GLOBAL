import Fastify from "fastify";
import plugins from "./plugins";
import jwtPlugin from "./plugins/jwt";
import cachePlugin from "./plugins/cache";
import registerRoutes from "./modules";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";

export const buildApp = () => {
  const app = Fastify({
    logger: {
      level: "info",
    },
  });

  app.register(plugins);
  app.register(jwtPlugin);
  app.register(cachePlugin);

  app.register(swagger, {
    openapi: {
      info: {
        title: "ICE API",
        version: "0.1.0",
      },
    },
  });

  app.register(swaggerUi, {
    routePrefix: "/docs",
  });

  app.register(registerRoutes);

  return app;
};
