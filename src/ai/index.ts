import Elysia, { t } from "elysia";
import appContext from "@/context";
import { db, gradeEssays } from "@/db";
import env from "@/env.mjs";
import { essays } from "@drizzle/schema";

const aiApp = new Elysia().use(appContext).group("/api", app => app.post("/gradeEssay", async ({ body: { question, answer }, cookie, redirect }) => {
  const user = cookie.user;
  if (user?.value && user?.value == env.SECRET_PHRASE) {
    await db.insert(essays).values({
      question,
      answer,
      dateSubmitted: new Date()
    });
    gradeEssays();
    redirect("/");
  }
}, {
  body: t.Object({
    question: t.String({
      minLength: 70
    }),
    answer: t.String({
      minLength: 600
    }),
  })
}).patch("/triggerGradeEssays", () => {
  gradeEssays();
}))

export default aiApp;