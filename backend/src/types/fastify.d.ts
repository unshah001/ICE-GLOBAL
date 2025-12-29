import "fastify";

declare module "fastify" {
  interface FastifyInstance {
    authenticate: any;
    authenticateAdmin: any;
    authenticateUser: any;
  }
}
