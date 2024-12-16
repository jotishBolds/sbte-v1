"use client";

import React from "react";
import SideBarLayout from "@/components/sidebar/layout";
import SBTEUserList from "./sbte-user-list";

const SBTEUserManagement: React.FC = () => {
  return (
    <SideBarLayout>
      <SBTEUserList />
    </SideBarLayout>
  );
};

export default SBTEUserManagement;
