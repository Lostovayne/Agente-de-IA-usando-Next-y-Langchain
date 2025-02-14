"use client";

import { NavigationContext } from "@/lib/context/navigation";
import { useRouter } from "next/navigation";
import { use } from "react";

const Sidebar = () => {
  const router = useRouter();
  const { closeMobileNav, isMobileNavOpen } = use(NavigationContext);
  return <div>Sidebar</div>;
};
export default Sidebar;
