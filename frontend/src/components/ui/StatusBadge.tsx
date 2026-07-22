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
      bgColor = "bg-nominal/10";
      textColor = "text-nominal";
      borderColor = "border-nominal/30";
      Icon = CheckCircle;
      break;
    case "WARNING":
    case "MONITOR":
      bgColor = "bg-caution/10";
      textColor = "text-caution";
      borderColor = "border-caution/30";
      Icon = AlertCircle;
      break;
    case "FAIL":
    case "CRITICAL":
      bgColor = "bg-alarm/10";
      textColor = "text-alarm";
      borderColor = "border-alarm/30";
      Icon = XCircle;
      break;
    default:
      bgColor = "bg-surface";
      textColor = "text-secondary-text";
      borderColor = "border-structural";
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
