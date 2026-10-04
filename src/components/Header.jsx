import { navItems } from "../data/algorithmData";

function CodeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8 9 4 12l4 3M16 9l4 3-4 3M14 5l-4 14" />
    </svg>
  );
}

export default function Header({ activeSection, onNavigate, theme, onToggleTheme }) {
  return (
    <header className="topbar">
      <a className="brand" href="#sorting" aria-label="DSA Visuals home" onClick={(event) => {
        event.preventDefault();
        onNavigate("sorting");
      }}>
        <span>
          <strong>DSA Visuals</strong>
        </span>
      </a>

      <nav className="mode-tabs" aria-label="Visualizer modes">
        {navItems.map((item) => (
          <button
            className={`mode-tab ${item.id === "practice" ? "practice-tab" : ""} ${activeSection === item.id ? "active" : ""}`}
            key={item.id}
            type="button"
            onClick={() => onNavigate(item.defaultMode)}
          >
            {item.icon === "code" && <CodeIcon />}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="topbar-actions">
        <button className="icon-button" type="button" aria-label="Toggle theme" data-tooltip="Toggle theme" onClick={onToggleTheme}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 3v2.2M12 18.8V21M4.2 4.2l1.6 1.6M18.2 18.2l1.6 1.6M3 12h2.2M18.8 12H21M4.2 19.8l1.6-1.6M18.2 5.8l1.6-1.6" />
            <circle cx="12" cy="12" r="4.2" />
          </svg>
          <span className="sr-only">{theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}</span>
        </button>
      </div>
    </header>
  );
}
