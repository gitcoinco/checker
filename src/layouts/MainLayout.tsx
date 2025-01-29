import { Navbar } from "@gitcoin/ui";
import { CheckerIcon } from "@gitcoin/ui/icons";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Outlet } from "react-router";
import { Providers } from "@/providers/Providers";

export const MainLayout = () => {
  return (
    <Providers>
      <Navbar
        text={{ text: "checker" }}
        secondaryLogo={{
          img: CheckerIcon,
          size: "h-5",
          color: "#8E81F0",
          link: "/",
        }}
        primaryLogo={{
          link: "/",
          size: "h-8",
        }}
      >
        <ConnectButton />
      </Navbar>
      <Outlet />
    </Providers>
  );
};
