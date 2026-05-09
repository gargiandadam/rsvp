import { useState } from "react";

const APPS_SCRIPT_URL = import.meta.env.VITE_APPS_SCRIPT_URL || "";

const initialForm = {
  guestName: "",
  rsvpStatus: "Attending",
  guestCount: "1",
  additionalGuestName: "",
  marriageAdvice: "",
  website: "",
};

function App() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle");
  const [confirmation, setConfirmation] = useState(null);

  const isAttending = form.rsvpStatus === "Attending";

  const hasAdditionalGuest = isAttending && form.guestCount === "2";

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
      ...(name === "rsvpStatus" && value === "Not attending"
        ? { guestCount: "0", additionalGuestName: "" }
        : {}),
      ...(name === "rsvpStatus" && value === "Attending" && current.guestCount === "0"
        ? { guestCount: "1" }
        : {}),
      ...(name === "guestCount" && value === "1" ? { additionalGuestName: "" } : {}),
    }));
    setErrors((current) => ({ ...current, [name]: "" }));
  }

  function validateForm() {
    const nextErrors = {};

    if (!form.rsvpStatus) {
      nextErrors.rsvpStatus = "Please choose your RSVP status.";
    }

    if (!isAttending) {
      return nextErrors;
    }

    if (!form.guestName.trim()) {
      nextErrors.guestName = "Please enter your full name.";
    }

    if (isAttending && (!form.guestCount || Number(form.guestCount) < 1)) {
      nextErrors.guestCount = "Please choose the number of guests attending.";
    }

    if (hasAdditionalGuest && !form.additionalGuestName.trim()) {
      nextErrors.additionalGuestName = "Please enter your additional guest's full name.";
    }

    return nextErrors;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validateForm();

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    if (form.website) {
      setConfirmation({ type: form.rsvpStatus });
      return;
    }

    if (!APPS_SCRIPT_URL) {
      setErrors({
        submit:
          "The RSVP endpoint has not been configured yet. Add VITE_APPS_SCRIPT_URL before publishing.",
      });
      return;
    }

    setStatus("submitting");
    setErrors({});

    try {
      const response = await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
        body: JSON.stringify({
          guestName: isAttending ? form.guestName.trim() : "",
          rsvpStatus: form.rsvpStatus,
          guestCount: isAttending ? form.guestCount : "0",
          additionalGuestName: hasAdditionalGuest
            ? form.additionalGuestName.trim()
            : "",
          marriageAdvice: form.marriageAdvice.trim(),
        }),
      });

      setConfirmation({ type: form.rsvpStatus, response });
      setForm(initialForm);
    } catch (error) {
      setErrors({
        submit:
          "Something went wrong while sending your RSVP. Please try again in a moment.",
      });
    } finally {
      setStatus("idle");
    }
  }

  return (
    <main className="site-shell">
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero__content">
          <h1 className="hero__names" id="hero-title">Gargi & Adam</h1>
          <p className="hero__occasion">Civil Ceremony Celebration</p>
          <p className="date">August 22, 2026 at 7:00 PM</p>
          <p className="welcome">
            Please join us for some drinks and appetizers. We are so excited to
            celebrate with you!
          </p>
          <a className="button button--primary" href="#rsvp">
            RSVP
          </a>
        </div>
      </section>

      <section className="rsvp-section" id="rsvp" aria-labelledby="rsvp-title">
        <div className="rsvp-intro">
          <h2 id="rsvp-title">We hope you can join us</h2>
          <p>
            Share your RSVP below, along with a few words of advice for the
            couple to treasure.
          </p>
        </div>

        <div className="form-panel">
          {confirmation ? (
            <Confirmation type={confirmation.type} />
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <fieldset className="field">
                <legend>Will you be attending? *</legend>
                <div className="segmented-control">
                  {["Attending", "Not attending"].map((option) => (
                    <label key={option}>
                      <input
                        type="radio"
                        name="rsvpStatus"
                        value={option}
                        checked={form.rsvpStatus === option}
                        onChange={updateField}
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
                {errors.rsvpStatus && <p className="error">{errors.rsvpStatus}</p>}
              </fieldset>

              {isAttending && (
                <div className="field">
                  <label htmlFor="guestCount">Number of guests attending: *</label>
                  <select
                    id="guestCount"
                    name="guestCount"
                    value={form.guestCount}
                    onChange={updateField}
                    aria-invalid={Boolean(errors.guestCount)}
                    aria-describedby={errors.guestCount ? "guestCount-error" : undefined}
                  >
                    <option value="1">1</option>
                    <option value="2">2</option>
                  </select>
                  {errors.guestCount && (
                    <p className="error" id="guestCount-error">
                      {errors.guestCount}
                    </p>
                  )}
                </div>
              )}

              {isAttending && (
                <div className="field">
                  <label htmlFor="guestName">Guest full name: *</label>
                  <input
                    id="guestName"
                    name="guestName"
                    type="text"
                    autoComplete="name"
                    value={form.guestName}
                    onChange={updateField}
                    aria-invalid={Boolean(errors.guestName)}
                    aria-describedby={errors.guestName ? "guestName-error" : undefined}
                  />
                  {errors.guestName && (
                    <p className="error" id="guestName-error">
                      {errors.guestName}
                    </p>
                  )}
                </div>
              )}

              {hasAdditionalGuest && (
                <div className="field">
                  <label htmlFor="additionalGuestName">Additional guest name: *</label>
                  <input
                    id="additionalGuestName"
                    name="additionalGuestName"
                    type="text"
                    autoComplete="name"
                    value={form.additionalGuestName}
                    onChange={updateField}
                    aria-invalid={Boolean(errors.additionalGuestName)}
                    aria-describedby={
                      errors.additionalGuestName
                        ? "additionalGuestName-error"
                        : undefined
                    }
                  />
                  {errors.additionalGuestName && (
                    <p className="error" id="additionalGuestName-error">
                      {errors.additionalGuestName}
                    </p>
                  )}
                </div>
              )}

              <div className="field">
                <label htmlFor="marriageAdvice">
                  What is the best marriage advice you can give us?
                </label>
                <textarea
                  id="marriageAdvice"
                  name="marriageAdvice"
                  rows="4"
                  value={form.marriageAdvice}
                  onChange={updateField}
                />
              </div>

              <div className="hidden-field" aria-hidden="true">
                <label htmlFor="website">Website</label>
                <input
                  id="website"
                  name="website"
                  type="text"
                  tabIndex="-1"
                  autoComplete="off"
                  value={form.website}
                  onChange={updateField}
                />
              </div>

              {errors.submit && <p className="error error--submit">{errors.submit}</p>}

              <button
                className="button button--primary button--full"
                type="submit"
                disabled={status === "submitting"}
              >
                {status === "submitting" ? "Sending RSVP..." : "Send RSVP"}
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}

function Confirmation({ type }) {
  const attending = type === "Attending";

  return (
    <div className="confirmation" role="status" aria-live="polite">
      <p className="confirmation__mark">Thank you</p>
      <h2>
        {attending
          ? "We cannot wait to celebrate with you!"
          : "Thank you for letting us know."}
      </h2>
      <p>
        {attending
          ? "We are so grateful that you're able to join us!"
          : "You will be missed. We are grateful for your love and blessings from afar."}
      </p>
      {attending && (
        <div className="faq" aria-label="Frequently asked questions">
          <h3>FAQs</h3>
          <div className="faq__item">
            <h4>Is there parking?</h4>
            <p>
              Yes, there is parking available in the building through the West
              side entrance - drive past the main lobby and approach the
              undergound parking. Key in 1234, give your name, and security
              will let you in. Other parking is also available outside, on the
              East side (Lakeshore Rd entrance) of Birchwood Park.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
