import {
  Clock,
  CheckCircle,
  AlertCircle,
  UserCheck,
  PackageCheck,
  ShieldCheck,
  Recycle,
  Leaf,
  Cpu,
  Trash2,
  GlassWater,
  FileText,
} from "lucide-react";

export const STATUS_STEPS = [
  { key: "Pending", label: "Pending", icon: AlertCircle },
  { key: "Assigned", label: "Assigned", icon: UserCheck },
  { key: "Completed", label: "Completed", icon: CheckCircle },
  { key: "Verified", label: "Verified", icon: ShieldCheck },
];

export const WASTE_TYPE_META = {
  Plastic: { icon: Recycle, color: "text-blue-600 dark:text-blue-400" },
  Organic: { icon: Leaf, color: "text-green-600 dark:text-green-400" },
  Electronic: { icon: Cpu, color: "text-purple-600 dark:text-purple-400" },
  Paper: { icon: FileText, color: "text-yellow-600 dark:text-yellow-400" },
  Glass: { icon: GlassWater, color: "text-cyan-600 dark:text-cyan-400" },
  Metal: { icon: Trash2, color: "text-gray-600 dark:text-gray-400" },
  Others: { icon: Trash2, color: "text-zinc-600 dark:text-zinc-400" },
};
