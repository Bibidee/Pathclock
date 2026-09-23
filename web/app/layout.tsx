import type { Metadata, Viewport } from "next";
import "@/design/tokens.css";
import "@/design/typography.css";
import "./globals.css";
import { WalletSession } from "@/identity/wallet-session";

export const metadata: Metadata = {
  title: { default: "PATHCLOCK", template: "%s · PATHCLOCK" },
  description: "Consensus-gated security release authorization on GenLayer.",
  icons: { icon: "/mark.svg" },
};
export const viewport: Viewport = { themeColor: "#f4f1e8" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><WalletSession>{children}</WalletSession></body></html>;
}
