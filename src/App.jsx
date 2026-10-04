import { useEffect, useMemo, useState } from "react";
import Header from "./components/Header";
import GraphsLab from "./components/GraphsLab";
import PracticeLab from "./components/PracticeLab";
import SearchLab from "./components/SearchLab";
import SortingLab from "./components/SortingLab";
import StructuresLab from "./components/StructuresLab";

const validSections = new Set(["sorting", "search", "structures", "graphs", "practice"]);

const hashAliases = {
  binary: "search",
  linear: "structures",
  tree: "structures",
  graph: "graphs",
  path: "graphs",
};

function getInitialSection() {
  const hash = window.location.hash.replace("#", "");
  const section = hashAliases[hash] || hash || "sorting";
  return validSections.has(section) ? section : "sorting";
}

export default function App() {
  const [activeSection, setActiveSection] = useState(getInitialSection);
  const [theme, setTheme] = useState(() => window.localStorage.getItem("dsa-visuals-theme") || "dark");

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("dsa-visuals-theme", theme);
  }, [theme]);

  useEffect(() => {
    document.body.dataset.mode = activeSection;
    window.history.replaceState(null, "", `#${activeSection}`);
  }, [activeSection]);

  const currentView = useMemo(() => {
    const views = {
      sorting: <SortingLab />,
      search: <SearchLab />,
      structures: <StructuresLab />,
      graphs: <GraphsLab />,
      practice: <PracticeLab />,
    };
    return views[activeSection] || views.sorting;
  }, [activeSection]);

  return (
    <div className="app-shell">
      <Header
        activeSection={activeSection}
        theme={theme}
        onNavigate={setActiveSection}
        onToggleTheme={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
      />
      {currentView}
    </div>
  );
}
