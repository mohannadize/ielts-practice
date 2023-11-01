import { essays } from "@drizzle/schema";
import { html } from "@elysiajs/html";
import { desc, eq } from "drizzle-orm";
import { Context, Cookie, Elysia } from "elysia";
import aiApp from "./ai";
import auth from "./auth";
import appContext from "./context";
import { db } from "./db";
import env from "./env.mjs";
import { BaseHTML } from "./views/BaseHTML";
import { Essay, EssayList, NewEssayForm } from "./views/Essays";
import { Header } from "./views/Header";

const PORT = process.env.PORT ?? 3000;
const app = new Elysia()
  .use(html())
  .use(appContext)
  .use(auth)
  .use(aiApp)
  .derive(htmxMiddleware)
  .get("/", async ({ cookie: { user }, render }) => {
    return render(<>
      <main class="container">
        <Header user={user?.value} />
        <NewEssayForm user={user} />
        <div id="essays-container" hx-get="/essays" hx-trigger="revealed" />
      </main>

    </>);
  })
  .get("/essays", async ({ cookie: { user } }) => {
    if (!user?.value || user.value !== env.SECRET_PHRASE)
      return <small>Site under construction</small>;

    const rows = await db.select().from(essays).orderBy(desc(essays.id));
    if (rows.length) return <EssayList rows={rows} />;
  }).get("/essays/:id", async ({ cookie: { user }, params: { id } }) => {
    if (!user?.value || user.value !== env.SECRET_PHRASE)
      return <small>Site under construction</small>;

    const row = await db.query.essays.findFirst({
      where: eq(essays.id, Number(id))
    });
    if (!row) return;
    return <Essay data={row} />;
  });

app.listen(PORT, () => {
  console.log(`Listening at http://localhost:${PORT}`);
});


export type App = typeof app;


function htmxMiddleware(ctx: any) {
  const render = (content: JSX.Element | JSX.Element[]) => {
    if (ctx.isHtmxRequest) return content;
    return <BaseHTML>{content}</BaseHTML>
  }

  return { render };
}