"use client";
import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  as?: "input" | "textarea";
  rows?: number;
}

export default function Input({
  label,
  error,
  icon,
  className = "",
  id,
  as = "input",
  rows = 4,
  ...props
}: InputProps) {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="input-group">
      {label && (
        <label htmlFor={inputId} className="input-label">
          {label}
        </label>
      )}
      <div className="input-wrapper">
        {icon && <span className="input-icon">{icon}</span>}
        {as === "textarea" ? (
          <textarea
            id={inputId}
            rows={rows}
            className={`input-field ${icon ? "input-with-icon" : ""} ${error ? "input-error" : ""} ${className}`}
            {...(props as any)}
          />
        ) : (
          <input
            id={inputId}
            className={`input-field ${icon ? "input-with-icon" : ""} ${error ? "input-error" : ""} ${className}`}
            {...props}
          />
        )}
      </div>
      {error && <span className="input-error-message">{error}</span>}
    </div>
  );
}

