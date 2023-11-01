import { LoginForm } from "./LoginForm";

export const Header = ({ user }: { user: string; }) => (
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
