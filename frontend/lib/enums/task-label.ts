export const TASK_LABEL_MAP = {
  bug: { label: "Bug", color: "red", icon: "AlertCircle" },
  feature: { label: "Feature", color: "blue", icon: "Sparkles" },
  documentation: { label: "Documentation", color: "green", icon: "FileText" }
} as const;

export const labelClasses = {
  bug: "bg-red-500/10 text-red-700 dark:text-red-400",
  feature: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  documentation: "bg-green-500/10 text-green-700 dark:text-green-400"
};
