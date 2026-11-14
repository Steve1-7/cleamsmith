"use client";

import { useMemo, useState } from "react";
import vehicleModelCatalog from "../lib/vehicle-models";

const vehicleTypes = [
  ["hatch", "Hatchback / small car"],
  ["sedan", "Sedan"],
  ["suv", "SUV / bakkie"],
  ["luxury", "Luxury / sports"],
  ["minibus", "Minibus / van"],
];
const addonOptions = [
  ["deep_interior", "Deep Interior", 200],
  ["carpet_clean", "Carpet", 250],
  ["mattress_clean", "Mattress", 300],
];

function money(value) {
  return Number(value || 0).toLocaleString("en-ZA");
}

export default function BookingWizard({ packages, selectedPackage, onPackageChange }) {
  const [step, setStep] = useState(1);
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [customModel, setCustomModel] = useState("");
  const [year, setYear] = useState("");
  const [vehicleSize, setVehicleSize] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [address, setAddress] = useState("");
  const [color, setColor] = useState("");
  const [registration, setRegistration] = useState("");
  const [vehicleNotes, setVehicleNotes] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [addons, setAddons] = useState([]);
  const packageRecord = packages.find((item) => item.slug === selectedPackage);
  const modelOptions = vehicleModelCatalog[make] || [];
  const modelName = model === "__other__" ? customModel.trim() : model;
  const vehicleName = [year, make, modelName].filter(Boolean).join(" ");
  const basePrice = Number(packageRecord?.vehicle_prices?.[vehicleSize] || 0);
  const addonTotal = addons.reduce((total, key) => {
    const addon = addonOptions.find(([value]) => value === key);
    return total + (addon ? addon[2] : 0);
  }, 0);
  const total = basePrice + addonTotal;
  const priceLabel = useMemo(() => total > 0 ? `R ${money(total)}` : "R —", [total]);
  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: currentYear - 1989 }, (_, index) => String(currentYear - index));
  }, []);

  function chooseMake(value) {
    setMake(value);
    setModel("");
    setCustomModel("");
    setVehicleSize("");
  }

  function chooseModel(value) {
    setModel(value);
    setCustomModel("");
    const selected = modelOptions.find(([name]) => name === value);
    if (selected) setVehicleSize(selected[1]);
  }

  function continueWizard() {
    if (step === 1) {
      if (!make || !model || (model === "__other__" && !customModel.trim()) || !year || !vehicleSize || !selectedPackage) {
        window.alert("Please select your vehicle make, model, year, size, and package to continue.");
        return;
      }
    }
    if (step === 2 && (!date || !time || !address.trim())) {
      window.alert("Please choose a date, time, and address to continue.");
      return;
    }
    setStep((current) => Math.min(3, current + 1));
  }

  function bookingMessage() {
    const parts = [
      "Hello CLEANSMITH team,",
      "I would like to request a booking. Please confirm availability.",
      "---",
      `Name: ${name}`,
      `Contact: ${phone}${email ? ` | ${email}` : ""}`,
      `Vehicle: ${vehicleName} (${vehicleTypes.find(([value]) => value === vehicleSize)?.[1] || vehicleSize})`,
    ];
    if (color.trim()) parts.push(`Vehicle colour: ${color.trim()}`);
    if (registration.trim()) parts.push(`Vehicle registration: ${registration.trim()}`);
    if (vehicleNotes.trim()) parts.push(`Vehicle notes: ${vehicleNotes.trim()}`);
    parts.push(`Package: ${packageRecord?.name || selectedPackage}`);
    if (addons.length) {
      parts.push(`Add-ons: ${addons.map((key) => addonOptions.find(([value]) => value === key)?.[1] || key).join(", ")}`);
    }
    parts.push(`Preferred date & time: ${date} ${time}`, `Address: ${address}`);
    if (notes.trim()) parts.push(`Notes: ${notes.trim()}`);
    if (total) parts.push(`Estimated total: R ${money(total)}`);
    parts.push("---", "Thanks,", name);
    return parts.join("\n");
  }

  function sendWhatsApp() {
    if (!name.trim() || !phone.trim()) {
      window.alert("Please enter your name and contact number.");
      return;
    }
    window.open(`https://wa.me/27717856901?text=${encodeURIComponent(bookingMessage())}`, "_blank", "noopener,noreferrer");
  }

  function sendEmail() {
    if (!name.trim() || !phone.trim()) {
      window.alert("Please enter your name and contact number.");
      return;
    }
    const subject = encodeURIComponent(`CLEANSMITH Booking Request - ${name}`);
    window.location.href = `mailto:info@cleansmith.co.za?subject=${subject}&body=${encodeURIComponent(bookingMessage())}`;
  }

  return (
    <div className="booking-wrapper fade-up">
      <div className="wizard">
        <div className="wizard-steps">
          <div className="step-pill"><div className="fill" style={{ width: `${((step - 1) / 2) * 100}%` }} /></div>
          <div className="step-label">Step {step} of 3</div>
        </div>
        {step === 1 ? (
          <div className="wizard-step">
            <div className="vehicle-fields">
              <label className="form-label">Vehicle make *
                <select className="form-control" value={make} onChange={(event) => chooseMake(event.target.value)} required>
                  <option value="">Select make</option>
                  {["BMW", "Mercedes-Benz", "Audi", "Toyota", "Volkswagen", "Ford", "Nissan", "Honda", "Hyundai", "Kia", "Mazda", "Lexus", "Land Rover", "Porsche", "Volvo", "Suzuki", "Isuzu", "Renault", "Subaru", "Other"].map((item) => <option key={item}>{item}</option>)}
                </select>
              </label>
              <label className="form-label">Model *
                <select className="form-control" value={model} disabled={!make} onChange={(event) => chooseModel(event.target.value)} required>
                  <option value="">{make ? "Select model" : "Choose a make first"}</option>
                  {modelOptions.map(([modelOption]) => <option key={modelOption}>{modelOption}</option>)}
                  {make ? <option value="__other__">Other / not listed</option> : null}
                </select>
              </label>
              {model === "__other__" ? (
                <label className="form-label">Enter model *
                  <input className="form-control" value={customModel} onChange={(event) => setCustomModel(event.target.value)} required />
                </label>
              ) : null}
              <label className="form-label">Year *
                <select className="form-control" value={year} onChange={(event) => setYear(event.target.value)} required>
                  <option value="">Select year</option>
                  {years.map((item) => <option key={item}>{item}</option>)}
                </select>
              </label>
              <label className="form-label">Vehicle size *
                <select className="form-control" value={vehicleSize} onChange={(event) => setVehicleSize(event.target.value)} required>
                  <option value="">Select vehicle size</option>
                  {vehicleTypes.map(([value, label]) => <option value={value} key={value}>{label}</option>)}
                </select>
              </label>
            </div>
            <div className="wizard-packages">
              {packages.map((item) => (
                <button
                  type="button"
                  key={item.slug}
                  className={`pkg-select-card${item.style === "featured" ? " featured" : ""}${item.style === "executive" ? " executive" : ""}${selectedPackage === item.slug ? " active" : ""}`}
                  onClick={() => onPackageChange(item.slug)}
                >
                  {item.name}<br /><strong>R{money(item.starting_price)}</strong>
                </button>
              ))}
            </div>
          </div>
        ) : null}
        {step === 2 ? (
          <div className="wizard-step">
            <div className="wizard-preview">
              <strong>Selected:</strong>
              <span>{vehicleName || "—"}{vehicleSize ? ` · ${vehicleTypes.find(([value]) => value === vehicleSize)?.[1]}` : ""}</span>
              <span>{packageRecord?.name || "—"}</span>
              <strong className="cyan">{priceLabel}</strong>
            </div>
            <div className="vehicle-fields">
              <label className="form-label">Preferred date *
                <input className="form-control" type="date" value={date} onChange={(event) => setDate(event.target.value)} required />
              </label>
              <label className="form-label">Preferred time *
                <select className="form-control" value={time} onChange={(event) => setTime(event.target.value)} required>
                  <option value="">Select time</option>
                  {["07:00 – 09:00", "09:00 – 11:00", "11:00 – 13:00", "13:00 – 15:00", "15:00 – 17:00"].map((item) => <option key={item}>{item}</option>)}
                </select>
              </label>
              <label className="form-label">Vehicle colour
                <input className="form-control" value={color} onChange={(event) => setColor(event.target.value)} />
              </label>
              <label className="form-label">Registration (optional)
                <input className="form-control" value={registration} onChange={(event) => setRegistration(event.target.value)} />
              </label>
              <label className="form-label field-wide">Vehicle condition or special instructions
                <input className="form-control" value={vehicleNotes} onChange={(event) => setVehicleNotes(event.target.value)} placeholder="For example, pet hair, stains, or a specific area to focus on" />
              </label>
              <label className="form-label field-wide">Address *
                <input className="form-control" value={address} onChange={(event) => setAddress(event.target.value)} placeholder="Service address in Johannesburg" required />
              </label>
            </div>
            <div className="addon-options">
              <p className="form-label">Add-on services</p>
              {addonOptions.map(([key, label, price]) => (
                <label className="addon-pill" key={key}>
                  <input
                    type="checkbox"
                    checked={addons.includes(key)}
                    onChange={(event) => setAddons((current) => event.target.checked ? [...current, key] : current.filter((item) => item !== key))}
                  />
                  {label} (+R{price})
                </label>
              ))}
            </div>
          </div>
        ) : null}
        {step === 3 ? (
          <div className="wizard-step">
            <div className="wizard-summary">
              <div><strong>Vehicle:</strong> {vehicleName} · {vehicleTypes.find(([value]) => value === vehicleSize)?.[1]}</div>
              <div><strong>Package:</strong> {packageRecord?.name}</div>
              <strong className="cyan">{priceLabel}</strong>
            </div>
            <div className="contact-fields">
              <label className="form-label">Full name *
                <input className="form-control" value={name} onChange={(event) => setName(event.target.value)} required />
              </label>
              <label className="form-label">Contact number *
                <input className="form-control" type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} required />
              </label>
              <label className="form-label">Email
                <input className="form-control" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
              </label>
              <label className="form-label">Notes
                <textarea className="form-control" rows={3} value={notes} onChange={(event) => setNotes(event.target.value)} />
              </label>
            </div>
            <div className="price-est">
              <div className="price-est-label">Estimated total</div>
              <div className="price-est-value">{priceLabel}</div>
            </div>
            <div className="final-actions">
              <button type="button" className="btn-primary" onClick={sendWhatsApp}>Send via WhatsApp</button>
              <button type="button" className="btn-secondary" onClick={sendEmail}>Send via Email</button>
            </div>
          </div>
        ) : null}
        <div className="booking-actions">
          {step > 1 ? <button type="button" className="btn-secondary" onClick={() => setStep((current) => current - 1)}>Back</button> : null}
          {step < 3 ? <button type="button" className="btn-primary" onClick={continueWizard}>Next</button> : null}
        </div>
      </div>
    </div>
  );
}
