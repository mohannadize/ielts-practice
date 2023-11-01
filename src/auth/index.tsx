import Elysia, { t } from "elysia";
import appContext from "../context";

export const auth = new Elysia()
  .use(appContext)
  .group("/auth", app => app.post("/signin", ({ cookie, body: { otp }, redirect }) => {
    if (cookie.user) {
      cookie.user.path = "/";
      cookie.user.value = otp;
    }

    redirect("/");
  }, {
    body: t.Object({
      otp: t.String(),
    }),
  }).delete("/session", ({ cookie, redirect }) => {
    if (cookie.user) {
      cookie.user.path = "/";
      cookie.user.value = "";
    }
    redirect("/")
  }))
export default auth;