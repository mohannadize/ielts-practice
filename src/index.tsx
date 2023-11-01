import { Elysia, t } from "elysia";
import { html } from "@elysiajs/html";
import appContext from "./context";
import auth from "./auth";
import aiApp from "./ai";
import env from "./env.mjs";
import { db } from "./db";
import { essays, essayType, users } from "@drizzle/schema";

const PORT = process.env.PORT ?? 3000;
const app = new Elysia()
  .use(html())
  .use(appContext)
  .use(auth)
  .use(aiApp)
  .get("/", async ({ cookie: { user }, isHtmxRequest }) => {
    const content = (
      <>
        <main class="container">
          <Header user={user?.value} />
          {user?.value === env.SECRET_PHRASE && (
            <form action="/api/gradeEssay" method="POST">
              <textarea
                placeholder="Essay Question"
                minlength={60}
                name="question"
                rows="3"
              >
              </textarea>
              <textarea
                placeholder="Your answer"
                minlength={600}
                name="answer"
                rows="8"
              >
              </textarea>
              <button>Submit</button>
            </form>
          )}
          <div id="essays-container" hx-get="/essays" hx-trigger="revealed">
          </div>
        </main>
      </>
    );

    if (isHtmxRequest) return content;

    return (
      <BaseHTML>
        {content}
      </BaseHTML>
    );
  }).get("/essays", async ({ cookie: { user } }) => {
    if (!user?.value || user.value !== env.SECRET_PHRASE) return;

    return <Dashboard rows={await db.select().from(essays)} />;
  });

app.listen(PORT, () => {
  console.log(`Listening at http://localhost:${PORT}`);
});

export type Schema = (typeof app)["schema"];

const BaseHTML = ({ children }: { children?: JSX.Element | JSX.Element[] }) => {
  return (
    <>
      {"<!doctype html>"}
      <html>
        <head>
          <meta
            name="viewport"
            content="width=device-width,initial-scale=1,shrink-to-fit=no"
          />
          <title>Elysia App</title>
          <link
            rel="stylesheet"
            href="https://cdn.jsdelivr.net/npm/@picocss/pico@1/css/pico.min.css"
          />
          <script
            src="https://unpkg.com/htmx.org@1.9.6"
            integrity="sha384-FhXw7b6AlE/jyjlZH5iHa/tTe9EpJ1Y55RjcgPbjeWMskSxZt1v9qkxLJWNJaGni"
            crossorigin="anonymous"
          >
          </script>
          <script src="https://unpkg.com/hyperscript.org@0.9.12"></script>
        </head>
        <body>
          {children}
        </body>
      </html>
    </>
  );
};

const LoginForm = () => {
  return (
    <form hx-post="/auth/signin" hx-target="body" class="grid">
      <input
        type="text"
        required="true"
        name="otp"
        placeholder="Username"
        autocomplete="one-time-code"
      />
      <div>
        <button>Login</button>
      </div>
    </form>
  );
};

const Header = ({ user }: { user: string }) => (
  <header>
    <div class="grid">
      <h2>IELTS Practice</h2>
      <div>
        {user
          ? (
            <div class="grid">
              <span safe>Logged in as {user}</span>
              <button hx-delete="/auth/session" hx-target="body">Logout</button>
            </div>
          )
          : <LoginForm />}
      </div>
    </div>
  </header>
);

const Dashboard = ({ rows }: { rows: essayType[] }) => {
  return (
    <div>
      <div id="content">
        {rows.map((row) => {
          const averageScore = row.aiResponse
            ? row.aiResponse.reduce((acc, cur) => {
              acc += Number(cur.result.split("Band ")[1]?.substring(0, 1)) ?? 0;
              return acc;
            }, 0) / row.aiResponse.length
            : 0;
          return (
            <article
              style={{
                whiteSpace: "pre-wrap",
              }}
            >
              <header>
                <h2>Question</h2>
                {row.question}
              </header>
              <h2>Your Answer</h2>
              {row.answer}
              <br />
              <br />
              <small>Submitted On: {row.dateSubmitted}</small>
              <footer>
                {row.aiResponse
                  ? (
                    <>
                      <hgroup>
                        <h2>Your results</h2>
                        <b>
                          Overall Score: Band {Math.round(averageScore * 2) / 2}
                        </b>
                      </hgroup>
                      <details>
                        <summary role="button" class="secondary">
                          Details & notes
                        </summary>
                        {row.aiResponse.map((response) => {
                          const { taskTitle, result } = response;

                          return (
                            <>
                              <h4>
                                {taskTitle.split("_").map((title) =>
                                  `${title.substring(0, 1).toUpperCase()}${
                                    title.slice(1)
                                  }`
                                ).join(" ")}
                              </h4>
                              <p>
                                {result
                                  .replace("section_score: ", "<b>Score: </b>")
                                  .replace(
                                    "section_comment: ",
                                    "<b>Comment: </b>",
                                  )}
                              </p>
                            </>
                          );
                        })}
                      </details>
                    </>
                  )
                  : (
                    <button
                      hx-trigger="every 10s"
                      hx-get="/essays"
                      hx-target="#essays-container"
                      aria-busy="true"
                    >
                      Please wait while your essay is being graded…
                    </button>
                  )}
              </footer>
            </article>
          );
        })}
      </div>
    </div>
  );
};
