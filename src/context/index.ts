import Elysia from "elysia";

const appContext = new Elysia().derive((ctx) => {
  const isHtmxRequest = "HX-REQUEST" in ctx.headers;

  const redirect = (path: string, keepMethod: boolean = false) => {
    if (!keepMethod) ctx.set.status = 303;
    if (isHtmxRequest) {
      ctx.set.headers["HX-LOCATION"] = path;
      return;
    }

    ctx.set.redirect = path;
    return;
  }



  return { redirect, isHtmxRequest };
});

export default appContext;