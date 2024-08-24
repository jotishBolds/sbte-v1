"use client";

import React, { ReactNode } from "react";
import { Sidebar } from "./sidebar";

type LayoutProps = {
  children: ReactNode;
};

const SideBarLayout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-x-hidden md:ml-[300px] lg:ml-[400px] p-4 pt-4 md:pt-4">
        {children}
      </main>
    </div>
  );
};

export default SideBarLayout;
