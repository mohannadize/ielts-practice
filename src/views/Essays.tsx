import { essayType } from "@drizzle/schema";
import { Cookie } from "elysia";
import env from "@/env.mjs";
import moment from "moment";

export const Essay = ({ data }: { data: essayType }) => {
  const averageScore = data.aiResponse
    ? data.aiResponse.reduce((acc, cur) => {
      acc += Number(cur.result.split("Band ")[1]?.substring(0, 1)) ?? 0;
      return acc;
    }, 0) / data.aiResponse.length
    : 0;

  return <article
    style={{
      whiteSpace: "pre-wrap",
    }}
  >
    <header>
      <h2>Question</h2>
      {data.question}
    </header>
    <h2>Your Answer</h2>
    {data.answer}
    <br />
    <br />
    <small>Submitted: {moment(data.dateSubmitted).fromNow()}</small>
    <br />
    <em style={{fontSize: "0.6rem"}}>{data.dateSubmitted}</em>
    <footer>
      {data.aiResponse
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
              {data.aiResponse.map((response) => {
                const { taskTitle, result } = response;

                return (
                  <>
                    <h4>
                      {taskTitle.split("_").map((title) =>
                        `${title.substring(0, 1).toUpperCase()}${title.slice(1)
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
            hx-trigger="every 4s"
            hx-get={`/essays/${data.id}`}
            hx-target="closest article"
            hx-swap="outerHTML"
            aria-busy="true"
          >
            Please wait while your essay is being graded…
          </button>
        )}
    </footer>
  </article>
}

export const EssayList = ({ rows }: { rows: essayType[] }) =>
  <>{rows.map((row) => {
    return (
      <Essay data={row} />
    );
  })}</>


export const NewEssayForm = ({ user }: { user: Cookie<any> | undefined }) => {
  if (user?.value !== env.SECRET_PHRASE) return null;

  return <form action="/api/gradeEssay" method="POST">
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
  </form>;
}

