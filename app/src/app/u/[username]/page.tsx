import { fetchProfileByUsername } from "@/lib/profile";
import { PublicProfileView } from "@/components/profile/public-profile-view";
import { Container } from "@/components/container";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { notFound } from "next/navigation";

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  
  // Always render; PublicProfileView will handle missing profiles gracefully.
  const profile = await fetchProfileByUsername(username);

  if (!profile) notFound();

  const publicModel = {
    username: profile.username ?? username,
    fullName: profile.full_name ?? profile.email?.split("@")[0] ?? "Aureo user",
    headline: profile.headline ?? "",
    bio: profile.bio ?? "",
    location: profile.location ?? null,
    avatarUrl: profile.avatar_url ?? null,
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <Container className="py-8 flex-1">
        <PublicProfileView
          username={username}
          profile={publicModel}
        />
      </Container>
      <Footer />
    </div>
  );
}
