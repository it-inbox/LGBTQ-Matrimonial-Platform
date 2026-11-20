import React from "react";
import { UnderlineTabs } from "../ui/UnderlineTabs";

export type UnblurTabType = string;

interface UnblurHeaderProps {
  activeTab?: UnblurTabType;
}

export const UnblurHeader: React.FC<UnblurHeaderProps> = ({ activeTab }) => {
  const tabs = [
    { id: "received", label: "Received", path: "/unblur/received" },
    { id: "sent", label: "Sent", path: "/unblur/sent" },
  ];

  return <UnderlineTabs tabs={tabs} activeTab={activeTab} />;
};
