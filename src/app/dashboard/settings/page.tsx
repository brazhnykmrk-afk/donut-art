import type { Metadata } from "next";

import { ProfileForm } from "@/components/profile/profile-form";
import { auth } from "@/lib/auth";
import { publicImageUrl } from "@/lib/storage";
import { getProfileByUserId } from "@/services/user-service";

export const metadata: Metadata = { title: "Profile settings" };
export const dynamic = "force-dynamic";

export default async function ProfileSettingsPage() {
  const session = await auth();
  const profile = await getProfileByUserId(session!.user.id);

  return (
    <div className="max-w-xl space-y-8">
      <div>
        <h2 className="font-display text-2xl font-bold">Profile settings</h2>
        <p className="mt-1 text-muted-foreground">
          This is what other players see on your public profile
        </p>
      </div>
      <ProfileForm
        profile={{
          minecraftNickname: profile.minecraftNickname,
          discordUsername: profile.discordUsername,
          bio: profile.bio,
          avatarUrl: profile.avatarKey ? publicImageUrl(profile.avatarKey) : null,
        }}
      />
    </div>
  );
}
