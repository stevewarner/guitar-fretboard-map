import styles from './ColorInput.module.css';

type Props = {
  value: string;
  onChange: (value: string) => void;
  label: string;
};

export const ColorInput = ({ value, onChange, label }: Props) => (
  <label className={styles.wrapper}>
    <span className="sr-only">{label}</span>
    <input
      type="color"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={styles.input}
    />
  </label>
);

