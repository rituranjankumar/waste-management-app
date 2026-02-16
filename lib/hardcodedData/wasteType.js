import {
  Recycle,
  Leaf,
  Cog,
  Cpu,
  FileText,
  Wine,
  MoreHorizontal,
} from "lucide-react";

export const wasteTypes = [
  {
    id: "Plastic",
    label: "Plastic",
    icon: Recycle,
    color: "text-blue-500",
  },
  {
    id: "Organic",
    label: "Organic",
    icon: Leaf,
    color: "text-green-600",
  },
  {
    id: "Metal",
    label: "Metal",
    icon: Cog,
    color: "text-gray-500",
  },
  {
    id: "Electronic",
    label: "E-Waste",
    icon: Cpu,
    color: "text-purple-600",
  },
  {
    id: "Paper",
    label: "Paper",
    icon: FileText,
    color: "text-yellow-600",
  },
  {
    id: "Glass",
    label: "Glass",
    icon: Wine,
    color: "text-emerald-500",
  },
  {
    id: "Others",
    label: "Others",
    icon: MoreHorizontal,
    color: "text-zinc-500",
  },
];
