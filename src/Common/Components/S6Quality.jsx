import React from "react";
import { ShieldCheck } from "lucide-react";
import "../Styles/QualityCommitment.css";

const items = [
  "Strict Quality Testing",
  "Certified Manufacturing",
  "Performance Validation",
  "Continuous R&D",
];

export default function QualityCommitment() {
  return (
    <section className="quality-section">
      <div className="quality-container">

        <h2 className="quality-title">
          <span>Quality</span> Commitment
        </h2>

        <p className="quality-desc">
          At Shagun Pro, quality is not optional — it is foundational.
        </p>

        <div className="quality-grid">
          {items.map((item, index) => (
            <div key={index} className="quality-card">

              <ShieldCheck className="quality-icon" />

              <p className="quality-text">{item}</p>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}