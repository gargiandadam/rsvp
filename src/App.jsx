import { useMemo, useState } from "react";

const APPS_SCRIPT_URL = import.meta.env.VITE_APPS_SCRIPT_URL || "";

const initialForm = {
  guestName: "",
  rsvpStatus: "Attending",
  guestCount: "1",
  favoriteMemory: "",
  marriageAdvice: "",
  website: "",
};

function App() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle");
  const [confirmation, setConfirmation] = useState(null);

  const isAttending = form.rsvpStatus === "Attending";

  const guestCountOptions = useMemo(
    () => Array.from({ length: 6 }, (_, index) => String(index + 1)),
    [],
  );

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
      ...(name === "rsvpStatus" && value === "Not attending"
        ? { guestCount: "0" }
        : {}),
      ...(name === "rsvpStatus" && value === "Attending" && current.guestCount === "0"
        ? { guestCount: "1" }
        : {}),
    }));
    setErrors((current) => ({ ...current, [name]: "" }));
  }

  function validateForm() {
    const nextErrors = {};

    if (!form.guestName.trim()) {
      nextErrors.guestName = "Please enter your full name.";
    }

    if (!form.rsvpStatus) {
      nextErrors.rsvpStatus = "Please choose your RSVP status.";
    }

    if (isAttending && (!form.guestCount || Number(form.guestCount) < 1)) {
      nextErrors.guestCount = "Please choose the number of guests attending.";
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
          guestName: form.guestName.trim(),
          rsvpStatus: form.rsvpStatus,
          guestCount: isAttending ? form.guestCount : "0",
          favoriteMemory: form.favoriteMemory.trim(),
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

  function resetForm() {
    setConfirmation(null);
    setErrors({});
  }

  return (
    <main className="site-shell">
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero__content">
          <p className="eyebrow">Civil Ceremony Celebration Party</p>
          <h1 id="hero-title">Gargi & Adam</h1>
          <p className="date">August 22, 2026 at 7:00 PM</p>
          <p className="welcome">
            With full hearts, Gargi and Adam are beginning this beautiful new
            chapter together. Your love, blessings, and presence mean so much,
            and we would be honored to celebrate this intimate day with you.
          </p>
          <a className="button button--primary" href="#rsvp">
            RSVP with love
          </a>
        </div>
      </section>

      <section className="details" aria-label="Wedding details">
        <div>
          <span className="section-kicker">When</span>
          <p>Saturday, August 22, 2026 at 7:00 PM</p>
        </div>
        <div>
          <span className="section-kicker">Celebrating</span>
          <p>A celebration party for their civil ceremony and the beginning of forever</p>
        </div>
        <div>
          <span className="section-kicker">RSVP</span>
          <p>Please respond when you can so we can plan with care.</p>
        </div>
      </section>

      <section className="rsvp-section" id="rsvp" aria-labelledby="rsvp-title">
        <div className="rsvp-intro">
          <p className="eyebrow">Kindly reply</p>
          <h2 id="rsvp-title">We hope you can join us</h2>
          <p>
            Share your RSVP below, along with a favorite memory or a few words
            of advice for the couple to treasure.
          </p>
        </div>

        <div className="form-panel">
          {confirmation ? (
            <Confirmation
              type={confirmation.type}
              onReset={resetForm}
            />
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <div className="field">
                <label htmlFor="guestName">Guest full name *</label>
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

              <div className="field">
                <label htmlFor="guestCount">Number of guests attending *</label>
                <select
                  id="guestCount"
                  name="guestCount"
                  value={form.guestCount}
                  onChange={updateField}
                  disabled={!isAttending}
                  aria-invalid={Boolean(errors.guestCount)}
                  aria-describedby={errors.guestCount ? "guestCount-error" : undefined}
                >
                  {!isAttending && <option value="0">0</option>}
                  {guestCountOptions.map((count) => (
                    <option key={count} value={count}>
                      {count}
                    </option>
                  ))}
                </select>
                {errors.guestCount && (
                  <p className="error" id="guestCount-error">
                    {errors.guestCount}
                  </p>
                )}
              </div>

              <div className="field">
                <label htmlFor="favoriteMemory">
                  What is your favorite memory of the couple?
                </label>
                <textarea
                  id="favoriteMemory"
                  name="favoriteMemory"
                  rows="4"
                  value={form.favoriteMemory}
                  onChange={updateField}
                />
              </div>

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

              <button className="button button--primary button--full" type="submit" disabled={status === "submitting"}>
                {status === "submitting" ? "Sending RSVP..." : "Send RSVP"}
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}

function Confirmation({ type, onReset }) {
  const attending = type === "Attending";

  return (
    <div className="confirmation" role="status" aria-live="polite">
      <p className="confirmation__mark">Thank you</p>
      <h2>{attending ? "We cannot wait to celebrate with you." : "Your reply means so much."}</h2>
      <p>
        {attending
          ? "Your RSVP has been received. Gargi and Adam are so grateful to have your love surrounding them on this special day."
          : "Thank you for letting us know. You will be missed, and Gargi and Adam are grateful for your love and blessings from afar."}
      </p>
      <button className="button button--secondary" type="button" onClick={onReset}>
        Submit another response
      </button>
    </div>
  );
}

export default App;
