import { FormEvent, useState } from "react";

import { authApi, User } from "../api";

type Props = { onAuthed: (token: string, user: User) => void };

export default function AuthPanel({ onAuthed }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      const response = await authApi.login(email, password);
      onAuthed(response.token, response.user);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Unable to sign in.");
    }
  };
  return (
    <section className="py-5">
      <div className="panel mx-auto auth-panel">
        <p className="eyebrow">Admin</p>
        <h2>Sign in</h2>
        <form className="row g-3" onSubmit={submit}>
          <label className="col-12 form-label">Email<input className="form-control mt-1" required type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
          <label className="col-12 form-label">Password<input className="form-control mt-1" required type="password" value={password} onChange={(event) => setPassword(event.target.value)} /></label>
          <div className="col-12">
            <button className="btn btn-primary" type="submit">Sign in</button>
            {error ? <p className="form-message error">{error}</p> : null}
          </div>
        </form>
      </div>
    </section>
  );
}
