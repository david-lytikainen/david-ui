import { FormEvent, useState } from "react";
import { RequestDraft, requestApi } from "../api";

type Props = { onCreated: (requestNumber: string) => void };
const initialDraft: RequestDraft = { customerName: "", customerEmail: "", customerPhone: "", projectDescription: "", targetDate: "", budgetRange: "" };
const siteTypes = ["Business", "Personal", "Other"];
const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function getMinimumTargetDate() {
  const today = new Date();
  const month = today.getMonth() + 1;
  const year = today.getFullYear() + Math.floor(month / 12);
  const nextMonth = month % 12;
  const day = Math.min(today.getDate(), new Date(year, nextMonth + 1, 0).getDate());
  return { year, month: nextMonth + 1, day };
}

function formatDatePart(value: number) {
  return String(value).padStart(2, "0");
}

export default function RequestForm({ onCreated }: Props) {
  const [draft, setDraft] = useState(initialDraft);
  const [siteType, setSiteType] = useState("");
  const [mainUse, setMainUse] = useState("");
  const [appearance, setAppearance] = useState("");
  const [colors, setColors] = useState(["", "", "", "", ""]);
  const [payments, setPayments] = useState("");
  const [automaticEmails, setAutomaticEmails] = useState("");
  const [pickerStep, setPickerStep] = useState<"year" | "month" | "day" | null>(null);
  const [targetYear, setTargetYear] = useState("");
  const [targetMonth, setTargetMonth] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const minimumTargetDate = getMinimumTargetDate();
  const currentYear = new Date().getFullYear();
  const targetYears = Array.from({ length: 11 }, (_, index) => currentYear + index).filter((year) => year >= minimumTargetDate.year);
  const targetMonths = monthNames.map((name, index) => ({ name, value: index + 1 })).filter(({ value }) => Number(targetYear) !== minimumTargetDate.year || value >= minimumTargetDate.month);
  const [selectedYear, selectedMonth, selectedDay] = draft.targetDate.split("-").map(Number);
  const targetDaysInMonth = targetYear && targetMonth ? new Date(Number(targetYear), Number(targetMonth), 0).getDate() : 0;
  const firstWeekday = targetYear && targetMonth ? new Date(Number(targetYear), Number(targetMonth) - 1, 1).getDay() : 0;
  const update = (field: keyof RequestDraft, value: string) => setDraft((current) => ({ ...current, [field]: value }));
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!draft.targetDate) {
      setMessage("Please choose a target date.");
      return;
    }
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
        <h2>What do you want built?</h2>
        <form className="row g-2" onSubmit={submit}>
          <label className="col-12 form-label">What type of site?
            <select className="form-select mt-1" required value={siteType} onChange={(event) => setSiteType(event.target.value)}>
              <option value="">Choose one</option>
              {siteTypes.map((type) => <option key={type}>{type}</option>)}
            </select>
          </label>
          <label className="col-12 form-label">What do you want built?
            <textarea className="form-control mt-1" rows={2} required maxLength={300} placeholder="Selling my cookies" value={mainUse} onChange={(event) => setMainUse(event.target.value)} />
          </label>
          <label className="col-12 form-label">What do you want it to look like?
            <div className="position-relative mt-1">
              <textarea className="form-control pb-4" required maxLength={3000} placeholder={'A unique site with fun animations\nA colorful site that pops\nA simple site for an easy user experience\nUnsure, can we discuss it?'} value={appearance} onChange={(event) => setAppearance(event.target.value)} />
              <span className="position-absolute bottom-0 end-0 p-2 small text-muted pe-none">{appearance.length}/3000</span>
            </div>
          </label>
          <fieldset className="col-12">
            <legend className="form-label mb-0">What color palette do you want?</legend>
            <p className="small text-muted mb-2">Find it <a href="https://colorhunt.co/" target="_blank" rel="noreferrer">here</a>.</p>
            <div className="row g-2">
              {colors.map((color, index) => (
                <div className="col-6 col-sm" key={index}>
                  <input className="form-control" aria-label={`Color ${index + 1}`} maxLength={7} pattern="^#(?:[0-9a-fA-F]{3}){1,2}$" placeholder="e.g. #6A795D" value={color} onChange={(event) => setColors((current) => current.map((item, itemIndex) => itemIndex === index ? event.target.value : item))} />
                </div>
              ))}
            </div>
          </fieldset>
          <fieldset className="col-md-6">
            <legend className="form-label">Should the site handle payments?</legend>
            <div className="d-flex gap-2">
              {['Yes', 'No'].map((value) => <span key={value}><input className="btn-check" id={`payments-${value}`} name="payments" required type="radio" value={value} checked={payments === value} onChange={(event) => setPayments(event.target.value)} /><label className="btn btn-outline-info rounded-pill px-4" htmlFor={`payments-${value}`}>{value}</label></span>)}
            </div>
          </fieldset>
          <fieldset className="col-md-6">
            <legend className="form-label">Automatic emails?</legend>
            <div className="d-flex gap-2">
              {['Yes', 'No'].map((value) => <span key={value}><input className="btn-check" id={`emails-${value}`} name="automaticEmails" required type="radio" value={value} checked={automaticEmails === value} onChange={(event) => setAutomaticEmails(event.target.value)} /><label className="btn btn-outline-info rounded-pill px-4" htmlFor={`emails-${value}`}>{value}</label></span>)}
            </div>
          </fieldset>
          <label className="col-md-6 form-label">Your Name<input className="form-control mt-1" required value={draft.customerName} onChange={(event) => update("customerName", event.target.value)} /></label>
          <label className="col-md-6 form-label">Email<input className="form-control mt-1" required type="email" value={draft.customerEmail} onChange={(event) => update("customerEmail", event.target.value)} /></label>
          <label className="col-md-6 form-label">Phone number<input className="form-control mt-1" required type="tel" value={draft.customerPhone} onChange={(event) => update("customerPhone", event.target.value)} /></label>
          <fieldset className="col-md-6">
            <legend className="form-label">Target date</legend>
            <div className="position-relative">
              <button className="form-control text-start" type="button" aria-haspopup="dialog" aria-expanded={pickerStep !== null} onClick={() => {
                if (pickerStep) {
                  setPickerStep(null);
                } else {
                  setTargetYear(selectedYear ? String(selectedYear) : "");
                  setTargetMonth(selectedMonth ? String(selectedMonth) : "");
                  setPickerStep("year");
                }
              }}>
                {draft.targetDate ? new Date(`${draft.targetDate}T00:00:00`).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }) : "Choose a date"}
              </button>
              {pickerStep ? (
                <div className="target-date-picker position-absolute top-100 start-0 mt-1 rounded border p-3 shadow" role="dialog" aria-label="Choose target date" onKeyDown={(event) => { if (event.key === "Escape") setPickerStep(null); }}>
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <button className="btn btn-sm btn-outline-light" type="button" aria-label="Go back" disabled={pickerStep === "year"} onClick={() => setPickerStep(pickerStep === "day" ? "month" : "year")}><i className="fa-solid fa-arrow-left" /></button>
                    <strong>{pickerStep === "year" ? "Choose a year" : pickerStep === "month" ? `Choose a month · ${targetYear}` : `${monthNames[Number(targetMonth) - 1]} ${targetYear}`}</strong>
                    <button className="btn btn-sm btn-outline-light" type="button" aria-label="Close date picker" onClick={() => setPickerStep(null)}><i className="fa-solid fa-xmark" /></button>
                  </div>
                  {pickerStep === "year" ? (
                    <div className="row row-cols-3 g-2">
                      {targetYears.map((year) => <div className="col" key={year}><button className={`btn w-100 ${selectedYear === year ? "btn-primary" : "btn-outline-light"}`} type="button" onClick={() => { setTargetYear(String(year)); setTargetMonth(""); setPickerStep("month"); }}>{year}</button></div>)}
                    </div>
                  ) : pickerStep === "month" ? (
                    <div className="row row-cols-3 g-2">
                      {targetMonths.map(({ name, value }) => <div className="col" key={value}><button className={`btn w-100 ${selectedYear === Number(targetYear) && selectedMonth === value ? "btn-primary" : "btn-outline-light"}`} type="button" onClick={() => { setTargetMonth(String(value)); setPickerStep("day"); }}>{name}</button></div>)}
                    </div>
                  ) : (
                    <div className="target-date-days text-center">
                      {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => <span className="small text-muted" key={day}>{day}</span>)}
                      {Array.from({ length: firstWeekday }, (_, index) => <span key={`empty-${index}`} />)}
                      {Array.from({ length: targetDaysInMonth }, (_, index) => {
                        const day = index + 1;
                        const disabled = Number(targetYear) === minimumTargetDate.year && Number(targetMonth) === minimumTargetDate.month && day < minimumTargetDate.day;
                        return <button className={`btn btn-sm px-0 ${selectedYear === Number(targetYear) && selectedMonth === Number(targetMonth) && selectedDay === day ? "btn-primary" : "btn-outline-light"}`} key={day} type="button" disabled={disabled} onClick={() => { update("targetDate", `${targetYear}-${formatDatePart(Number(targetMonth))}-${formatDatePart(day)}`); setPickerStep(null); }}>{day}</button>;
                      })}
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </fieldset>
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
