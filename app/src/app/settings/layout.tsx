import type { Metadata } from "next";
import { SettingsShell } from "@/components/settings/settings-shell";
import { Container } from "@/components/container";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "Settings, Aureo",
  description: "Manage your Aureo preferences, privacy, and profile settings.",
};

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <Container className="py-8 flex-1">
        <SettingsShell>{children}</SettingsShell>
      </Container>
      <Footer />
    </div>
  );
}

