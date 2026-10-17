import { FormEvent, useState } from "react";
import { RequestDraft, requestApi } from "../api";

type Props = { onCreated: (requestNumber: string) => void };
const initialDraft: RequestDraft = { customerName: "", customerEmail: "", customerPhone: "", projectDescription: "", targetDate: "", budgetRange: "" };
const siteTypes = ["Business", "Personal", "Other"];

export default function RequestForm({ onCreated }: Props) {
  const [draft, setDraft] = useState(initialDraft);
  const [siteType, setSiteType] = useState("");
  const [mainUse, setMainUse] = useState("");
  const [appearance, setAppearance] = useState("");
  const [colors, setColors] = useState(["", "", "", "", ""]);
  const [payments, setPayments] = useState("");
  const [automaticEmails, setAutomaticEmails] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const update = (field: keyof RequestDraft, value: string) => setDraft((current) => ({ ...current, [field]: value }));
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");
    try {
      const palette = colors.filter((color) => color.trim()).map((color) => `{${color.trim()}}`).join(", ") || "Not specified";
      const projectDescription = `Site type: ${siteType}\nMain use: ${mainUse.trim()}\nLook and feel: ${appearance.trim()}\nColor palette: ${palette}\nHandles payments: ${payments}\nAutomatic emails: ${automaticEmails}`;
      const request = await requestApi.create({ ...draft, projectDescription });
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
        <h2>What do you want me to build?</h2>
        <form className="row g-2" onSubmit={submit}>
          <label className="col-12 form-label">What type of site?
            <select className="form-select mt-1" required value={siteType} onChange={(event) => setSiteType(event.target.value)}>
              <option value="">Choose one</option>
              {siteTypes.map((type) => <option key={type}>{type}</option>)}
            </select>
          </label>
          <label className="col-12 form-label">What is the main use of the site?
            <textarea className="form-control mt-1" required maxLength={300} placeholder="Selling my cookies" value={mainUse} onChange={(event) => setMainUse(event.target.value)} />
          </label>
          <label className="col-12 form-label">What do you want it to look like?
            <div className="position-relative mt-1">
              <textarea className="form-control pb-4" required maxLength={3000} placeholder={'A unique site with fun animations\nA colorful site that pops\nA simple site for an easy user experience\nUnsure, can we discuss it?'} value={appearance} onChange={(event) => setAppearance(event.target.value)} />
              <span className="position-absolute bottom-0 end-0 p-2 small text-muted pe-none">{appearance.length}/3000</span>
            </div>
          </label>
          <fieldset className="col-12">
            <legend className="form-label mb-0">What color palette do you want? <a href="https://colorhunt.co/" target="_blank" rel="noreferrer">Color Hunt</a></legend>
            <p className="mb-2 text-muted">Paste up to 5 color hexes below</p>
            <div className="row g-2">
              {colors.map((color, index) => (
                <div className="col-sm" key={index}>
                  <input className="form-control" aria-label={`Color ${index + 1}`} maxLength={7} pattern="^#(?:[0-9a-fA-F]{3}){1,2}$" placeholder="e.g. #6A795D" value={color} onChange={(event) => setColors((current) => current.map((item, itemIndex) => itemIndex === index ? event.target.value : item))} />
                </div>
              ))}
            </div>
          </fieldset>
          <fieldset className="col-md-6">
            <legend className="form-label">Should the site handle payments?</legend>
            {['Yes', 'No'].map((value) => <div className="form-check form-check-inline" key={value}><input className="form-check-input" id={`payments-${value}`} name="payments" required type="radio" value={value} checked={payments === value} onChange={(event) => setPayments(event.target.value)} /><label className="form-check-label" htmlFor={`payments-${value}`}>{value}</label></div>)}
          </fieldset>
          <fieldset className="col-md-6">
            <legend className="form-label">Automatic emails?</legend>
            {['Yes', 'No'].map((value) => <div className="form-check form-check-inline" key={value}><input className="form-check-input" id={`emails-${value}`} name="automaticEmails" required type="radio" value={value} checked={automaticEmails === value} onChange={(event) => setAutomaticEmails(event.target.value)} /><label className="form-check-label" htmlFor={`emails-${value}`}>{value}</label></div>)}
          </fieldset>
          <label className="col-md-6 form-label">Your Name<input className="form-control mt-1" required value={draft.customerName} onChange={(event) => update("customerName", event.target.value)} /></label>
          <label className="col-md-6 form-label">Email<input className="form-control mt-1" required type="email" value={draft.customerEmail} onChange={(event) => update("customerEmail", event.target.value)} /></label>
          <label className="col-md-6 form-label">Phone number<input className="form-control mt-1" required type="tel" value={draft.customerPhone} onChange={(event) => update("customerPhone", event.target.value)} /></label>
          <label className="col-md-6 form-label">Target date<input className="form-control mt-1" required type="date" value={draft.targetDate} onChange={(event) => update("targetDate", event.target.value)} /></label>
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
