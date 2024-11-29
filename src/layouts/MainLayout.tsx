import { Navbar } from "gitcoin-ui";
import { CheckerIcon } from "gitcoin-ui/icons";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Outlet } from "react-router";
import { Providers } from "@/providers/Providers";

export const MainLayout = () => {
  return (
    <Providers>
      <Navbar
        text="Checker"
        secondaryLogo={CheckerIcon}
        primaryLogoLink="/"
        secondaryLogoLink="/"
        children={<ConnectButton />}
      />
      <Outlet />
    </Providers>
  );
};
