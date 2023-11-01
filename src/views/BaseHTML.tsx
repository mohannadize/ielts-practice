export const BaseHTML = ({ children }: { children?: JSX.Element | JSX.Element[]; }) => {
  return (
    <>
      {"<!doctype html>"}
      <html>
        <head>
          <meta
            name="viewport"
            content="width=device-width,initial-scale=1,shrink-to-fit=no" />
          <title>Elysia App</title>
          <link
            rel="stylesheet"
            href="https://cdn.jsdelivr.net/npm/@picocss/pico@1/css/pico.min.css" />
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
