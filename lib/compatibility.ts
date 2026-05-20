type SpeciesInfo = {
  common_name: string;
  scientific_name: string;
  category: string;
  water_type: string;
  behavior: string;
  diet: string;
  temp_min: number;
  temp_max: number;
  ph_min: number;
  ph_max: number;
  size_max: number;
  sociability: string;
  population_min: number;
};

type SpeciesInBac = {
  name: string;
  type: string;
  quantity: number;
};

export type Alert = {
  level: "error" | "warning" | "info";
  message: string;
};

export type CompatibilityResult = {
  score: number;
  alerts: Alert[];
  label: string;
  color: string;
};

export function calculateCompatibility(
  speciesInBac: SpeciesInBac[],
  speciesDetails: Record<string, SpeciesInfo>,
): CompatibilityResult {
  const alerts: Alert[] = [];
  let penalties = 0;

  const details = speciesInBac
    .map((s) => ({ bac: s, info: speciesDetails[s.name] }))
    .filter((s) => s.info !== undefined);

  if (details.length === 0) {
    return {
      score: 100,
      alerts: [
        {
          level: "info",
          message: "Ajoutez des espèces pour analyser la compatibilité.",
        },
      ],
      label: "Non évalué",
      color: "#6B8A9E",
    };
  }

  const waterTypes = [...new Set(details.map((d) => d.info.water_type))];
  if (waterTypes.length > 1) {
    alerts.push({
      level: "error",
      message: `Types d'eau incompatibles : ${waterTypes.join(", ")} dans le même bac.`,
    });
    penalties += 40;
  }

  const tempMins = details.map((d) => d.info.temp_min).filter(Boolean);
  const tempMaxs = details.map((d) => d.info.temp_max).filter(Boolean);
  if (tempMins.length && tempMaxs.length) {
    const overlapMin = Math.max(...tempMins);
    const overlapMax = Math.min(...tempMaxs);
    if (overlapMin > overlapMax) {
      alerts.push({
        level: "error",
        message: `Températures incompatibles : aucune plage commune entre ${overlapMin}°C et ${overlapMax}°C.`,
      });
      penalties += 35;
    } else if (overlapMax - overlapMin < 3) {
      alerts.push({
        level: "warning",
        message: `Plage de température commune très étroite (${overlapMin}-${overlapMax}°C). Régulation précise requise.`,
      });
      penalties += 10;
    }
  }

  const phMins = details.map((d) => d.info.ph_min).filter(Boolean);
  const phMaxs = details.map((d) => d.info.ph_max).filter(Boolean);
  if (phMins.length && phMaxs.length) {
    const phOverlapMin = Math.max(...phMins);
    const phOverlapMax = Math.min(...phMaxs);
    if (phOverlapMin > phOverlapMax) {
      alerts.push({
        level: "error",
        message: `pH incompatibles : aucune plage commune entre pH ${phOverlapMin} et ${phOverlapMax}.`,
      });
      penalties += 30;
    }
  }

  const aggressives = details.filter((d) => d.info.behavior === "aggressive");
  if (aggressives.length > 0 && details.length > 1) {
    aggressives.forEach((a) => {
      alerts.push({
        level: "warning",
        message: `${a.bac.name} est agressif et peut attaquer les autres espèces.`,
      });
      penalties += 15;
    });
  }

  const semiAggressive = details.filter(
    (d) => d.info.behavior === "semi-aggressive",
  );
  if (semiAggressive.length >= 3) {
    alerts.push({
      level: "warning",
      message: `Plusieurs espèces semi-agressives (${semiAggressive.map((s) => s.bac.name).join(", ")}). Surveillance recommandée.`,
    });
    penalties += 10;
  }

  const carnivores = details.filter(
    (d) => d.info.diet === "carnivore" && d.info.size_max > 15,
  );
  const smallSpecies = details.filter((d) => d.info.size_max < 5);
  if (carnivores.length > 0 && smallSpecies.length > 0) {
    carnivores.forEach((c) => {
      smallSpecies.forEach((s) => {
        alerts.push({
          level: "error",
          message: `${c.bac.name} (carnivore, ${c.info.size_max}cm) peut prédater ${s.bac.name} (${s.info.size_max}cm).`,
        });
        penalties += 25;
      });
    });
  }

  details.forEach((d) => {
    if (
      d.info.population_min > 1 &&
      d.bac.quantity < d.info.population_min &&
      d.info.sociability !== "solitaire"
    ) {
      alerts.push({
        level: "warning",
        message: `${d.bac.name} nécessite un groupe d'au moins ${d.info.population_min} individus (vous en avez ${d.bac.quantity}).`,
      });
      penalties += 10;
    }
  });

  details.forEach((d) => {
    if (d.info.sociability === "solitaire" && d.bac.quantity > 1) {
      alerts.push({
        level: "warning",
        message: `${d.bac.name} est solitaire, ${d.bac.quantity} individus peuvent se battre.`,
      });
      penalties += 15;
    }
  });

  const corals = details.filter((d) => d.info.category === "coral");
  const fishWithCorals = details.filter(
    (d) =>
      d.info.category === "fish" &&
      d.info.diet === "herbivore" &&
      d.info.size_max > 10,
  );
  if (corals.length > 0 && fishWithCorals.length > 0) {
    alerts.push({
      level: "warning",
      message: `Certains poissons herbivores peuvent abîmer les coraux.`,
    });
    penalties += 10;
  }

  if (alerts.length === 0) {
    alerts.push({
      level: "info",
      message: "Toutes les espèces semblent compatibles entre elles ! 🎉",
    });
  }

  const score = Math.max(0, Math.min(100, 100 - penalties));

  let label: string;
  let color: string;

  if (score >= 80) {
    label = "Excellente";
    color = "#52B788";
  } else if (score >= 60) {
    label = "Bonne";
    color = "#90BE6D";
  } else if (score >= 40) {
    label = "Moyenne";
    color = "#F4A261";
  } else if (score >= 20) {
    label = "Mauvaise";
    color = "#E94F37";
  } else {
    label = "Critique";
    color = "#C1121F";
  }

  return { score, alerts, label, color };
}
