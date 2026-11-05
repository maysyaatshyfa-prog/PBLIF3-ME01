
import { useEffect, useRef, useState } from "react";

export default function CustomSelect({
  value,
  options = [],
  onChange,
  id,
  placeholder = "Pilih jawaban",
}) {
  const [terbuka, setTerbuka] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    function tutupDropdown(event) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target)
      ) {
        setTerbuka(false);
      }
    }

    function tutupDenganEscape(event) {
      if (event.key === "Escape") {
        setTerbuka(false);
      }
    }

    document.addEventListener("mousedown", tutupDropdown);
    document.addEventListener("keydown", tutupDenganEscape);

    return () => {
      document.removeEventListener("mousedown", tutupDropdown);
      document.removeEventListener("keydown", tutupDenganEscape);
    };
  }, []);

  const pilihanAktif = options.find(
    (item) => item.value === value
  );

  return (
    <div className="custom-select" ref={wrapperRef}>
      <button
        id={id}
        type="button"
        className="custom-select-trigger"
        aria-haspopup="listbox"
        aria-expanded={terbuka}
        onClick={() => setTerbuka((prev) => !prev)}
      >
        <span>{pilihanAktif?.label || placeholder}</span>

        <span className="custom-select-arrow">
          {terbuka ? "▲" : "▼"}
        </span>
      </button>

      {terbuka && (
        <div className="custom-select-menu" role="listbox">
          {options.map((item) => (
            <button
              key={item.value}
              type="button"
              role="option"
              aria-selected={value === item.value}
              className={`custom-select-option ${
                value === item.value ? "selected" : ""
              }`}
              onClick={() => {
                onChange(item.value);
                setTerbuka(false);
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
