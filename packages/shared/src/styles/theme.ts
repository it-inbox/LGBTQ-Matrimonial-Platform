export const THEME_COLORS = {
  brand: {
    primary: "#e11d48", // rose-600
    primaryHover: "#be123c", // rose-700
    primaryLight: "#fff1f2", // rose-50
    primaryBorder: "#fecdd3", // rose-200
  },
  background: {
    app: "bg-slate-50",
    card: "bg-white",
    cardSecondary: "bg-slate-50",
    input: "bg-slate-50",
    inputBorder: "border-slate-200",
  },
  border: {
    subtle: "border-slate-200/90",
    light: "border-slate-100",
    primary: "border-rose-200",
  },
  text: {
    heading: "text-slate-900 font-bold",
    subheading: "text-slate-700 font-semibold",
    body: "text-slate-600",
    muted: "text-slate-500",
    primary: "text-rose-600 font-bold",
  },
  badges: {
    discreet: {
      bg: "bg-amber-100",
      text: "text-amber-800",
      label: "Discreet",
    },
    outToSelectFew: {
      bg: "bg-blue-100",
      text: "text-blue-800",
      label: "Out to friends",
    },
    openlyOut: {
      bg: "bg-emerald-100",
      text: "text-emerald-800",
      label: "Openly Out",
    },
  },
} as const;

export const getOutnessBadgeConfig = (status?: string | null) => {
  switch (status) {
    case "DISCREET_NOT_OUT":
      return THEME_COLORS.badges.discreet;
    case "OUT_TO_SELECT_FEW":
      return THEME_COLORS.badges.outToSelectFew;
    default:
      return THEME_COLORS.badges.openlyOut;
  }
};
