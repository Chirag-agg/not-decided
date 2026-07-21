import React from "react";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";

export type BadgeStatus = "PASS" | "WARNING" | "FAIL" | "CRITICAL" | "HEALTHY" | "MONITOR";

interface StatusBadgeProps {
  status: BadgeStatus;
  showIcon?: boolean;
}

export function StatusBadge({ status, showIcon = false }: StatusBadgeProps) {
  let bgColor = "";
  let textColor = "";
  let borderColor = "";
  let Icon = null;

  switch (status) {
    case "PASS":
    case "HEALTHY":
      bgColor = "bg-green-950";
      textColor = "text-green-400";
      borderColor = "border-green-900";
      Icon = CheckCircle;
      break;
    case "WARNING":
    case "MONITOR":
      bgColor = "bg-amber-950";
      textColor = "text-amber-400";
      borderColor = "border-amber-900";
      Icon = AlertCircle;
      break;
    case "FAIL":
    case "CRITICAL":
      bgColor = "bg-red-950";
      textColor = "text-red-400";
      borderColor = "border-red-900";
      Icon = XCircle;
      break;
    default:
      bgColor = "bg-zinc-950";
      textColor = "text-zinc-400";
      borderColor = "border-zinc-900";
  }

  return (
    <div className="flex items-center space-x-2">
      {showIcon && Icon && <Icon size={14} className={textColor} />}
      <span className={`px-2 py-1 uppercase tracking-widest text-[9px] border ${bgColor} ${textColor} ${borderColor}`}>
        {status}
      </span>
    </div>
  );
}
