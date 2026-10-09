import { FormEvent, useState } from "react";

import { RequestDraft, requestApi } from "../api";

type Props = { onCreated: (requestNumber: string) => void };
const initialDraft: RequestDraft = { customerName: "", customerEmail: "", customerPhone: "", projectDescription: "", targetDate: "", budgetRange: "" };

export default function RequestForm({ onCreated }: Props) {
  const [draft, setDraft] = useState(initialDraft);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const update = (field: keyof RequestDraft, value: string) => setDraft((current) => ({ ...current, [field]: value }));
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");
    try {
      const request = await requestApi.create(draft);
      onCreated(request.requestNumber);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to send request.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="py-5" id="request">
      <div className="panel">
        <p className="eyebrow">Start a project</p>
        <h2>Tell me what you want to build.</h2>
        <p className="section-copy">You will receive a private link where we can keep the conversation and project status in one place.</p>
        <form className="row g-3" onSubmit={submit}>
          <label className="col-md-6 form-label">Name<input className="form-control mt-1" required value={draft.customerName} onChange={(event) => update("customerName", event.target.value)} /></label>
          <label className="col-md-6 form-label">Email<input className="form-control mt-1" required type="email" value={draft.customerEmail} onChange={(event) => update("customerEmail", event.target.value)} /></label>
          <label className="col-md-6 form-label">Phone number<input className="form-control mt-1" required type="tel" value={draft.customerPhone} onChange={(event) => update("customerPhone", event.target.value)} /></label>
          <label className="col-md-6 form-label">Target date<input className="form-control mt-1" required type="date" value={draft.targetDate} onChange={(event) => update("targetDate", event.target.value)} /></label>
          <label className="col-12 form-label">What do you want built?<textarea className="form-control mt-1" required value={draft.projectDescription} onChange={(event) => update("projectDescription", event.target.value)} /></label>
          <label className="col-12 form-label">Budget range<input className="form-control mt-1" required placeholder="For example, $2,000-$4,000" value={draft.budgetRange} onChange={(event) => update("budgetRange", event.target.value)} /></label>
          <div className="col-12">
            <button className="btn btn-primary" disabled={submitting} type="submit">{submitting ? "Sending..." : "Send request"}</button>
            {message ? <p className="form-message error">{message}</p> : null}
          </div>
        </form>
      </div>
    </section>
  );
}
