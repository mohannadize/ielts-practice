
export const LoginForm = () => {
  return (
    <form hx-post="/auth/signin" hx-target="body" class="grid">
      <input
        type="text"
        required="true"
        name="otp"
        placeholder="Username"
        autocomplete="one-time-code" />
      <div>
        <button>Login</button>
      </div>
    </form>
  );
};
