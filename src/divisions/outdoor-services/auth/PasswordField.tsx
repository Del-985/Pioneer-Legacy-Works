import { useState } from "react";

interface PasswordFieldProps {
  label: string;
  name: string;
  autoComplete: string;
  value: string;
  onChange: (value: string) => void;
  minLength?: number;
}

function PasswordField({
  label,
  name,
  autoComplete,
  value,
  onChange,
  minLength = 8
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <label className="outdoor-services-auth-field">
      <span>{label}</span>
      <div className="outdoor-services-auth-password">
        <input
          autoComplete={autoComplete}
          minLength={minLength}
          name={name}
          required
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        <button type="button" onClick={() => setVisible((current) => !current)}>
          {visible ? "Hide" : "Show"}
        </button>
      </div>
    </label>
  );
}

export default PasswordField;
