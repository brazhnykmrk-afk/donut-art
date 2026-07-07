"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE_BYTES } from "@/lib/validation/upload";
import { apiRequest, uploadImage } from "@/lib/upload-client";

interface ProfileFormProps {
  profile: {
    minecraftNickname: string;
    discordUsername: string | null;
    bio: string | null;
    avatarUrl: string | null;
  };
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const router = useRouter();
  const { update } = useSession();

  const [nickname, setNickname] = React.useState(profile.minecraftNickname);
  const [discord, setDiscord] = React.useState(profile.discordUsername ?? "");
  const [bio, setBio] = React.useState(profile.bio ?? "");
  const [avatarFile, setAvatarFile] = React.useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = React.useState<string | null>(
    profile.avatarUrl,
  );
  const [error, setError] = React.useState<string | null>(null);
  const [saved, setSaved] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  function handleAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setError(null);
    if (!file) return;
    if (!ALLOWED_IMAGE_TYPES[file.type]) {
      setError("Only JPEG, PNG and WebP images are allowed for the avatar.");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setError("The avatar must be at most 8 MB.");
      return;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSaved(false);
    setSubmitting(true);

    try {
      let avatarKey: string | undefined;
      if (avatarFile) {
        const uploaded = await uploadImage(avatarFile, "avatar");
        avatarKey = uploaded.key;
      }

      const result = await apiRequest<{ minecraftNickname: string }>(
        "/api/profile",
        {
          method: "PATCH",
          body: JSON.stringify({
            minecraftNickname: nickname,
            discordUsername: discord,
            bio,
            ...(avatarKey ? { avatarKey } : {}),
          }),
        },
      );

      // Keep the session token's nickname in sync after a rename.
      await update({ nickname: result.minecraftNickname });
      setSaved(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-5">
        <Avatar className="h-20 w-20 border-primary/30">
          {avatarPreview && <AvatarImage src={avatarPreview} alt="Avatar preview" />}
          <AvatarFallback className="text-xl">
            {nickname.slice(0, 2) || "?"}
          </AvatarFallback>
        </Avatar>
        <div className="space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleAvatarChange}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            Change avatar
          </Button>
          <p className="text-xs text-muted-foreground">JPEG, PNG or WebP · up to 8 MB</p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="profile-nickname">Minecraft nickname</Label>
        <Input
          id="profile-nickname"
          value={nickname}
          onChange={(event) => setNickname(event.target.value)}
          pattern="[A-Za-z0-9_]{3,16}"
          title="3–16 characters: letters, numbers, underscores"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="profile-discord">Discord username</Label>
        <Input
          id="profile-discord"
          value={discord}
          onChange={(event) => setDiscord(event.target.value)}
          placeholder="username"
          maxLength={37}
        />
        <p className="text-xs text-muted-foreground">
          Buyers will contact you here — double-check the spelling.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="profile-bio">Biography</Label>
        <Textarea
          id="profile-bio"
          value={bio}
          onChange={(event) => setBio(event.target.value)}
          placeholder="Tell other players about your Map Art style, prices, availability…"
          className="min-h-[120px]"
          maxLength={500}
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
      {saved && <p className="text-sm text-emerald-400">Profile saved.</p>}

      <Button type="submit" size="lg" disabled={submitting}>
        {submitting ? "Saving…" : "Save profile"}
      </Button>
    </form>
  );
}
