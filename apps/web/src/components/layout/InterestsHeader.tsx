import React from "react";
import { UnderlineTabs } from "../ui/UnderlineTabs";

interface InterestsHeaderProps {
  activeTab?: string;
}

export const InterestsHeader: React.FC<InterestsHeaderProps> = ({ activeTab }) => {
  const tabs = [
    { id: "received", label: "Received", path: "/interests/received" },
    { id: "sent", label: "Sent", path: "/interests/sent" },
  ];

  return <UnderlineTabs tabs={tabs} activeTab={activeTab} />;
};
