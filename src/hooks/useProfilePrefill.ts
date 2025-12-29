import { useEffect, useState } from "react";

export type UserProfile = {
  name?: string;
  email?: string;
  company?: string;
  address?: string;
  bio?: string;
  notes?: string;
  extras?: Record<string, string>;
};

export const useProfilePrefill = () => {
  const base = import.meta.env.VITE_API_BASE_URL || "";
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("user_access_token");
    if (!token) return;
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${base}/user/me`, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error("profile fetch failed");
        const data = await res.json();
        setProfile(data);
      } catch {
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [base]);

  return { profile, loading };
};

export const prefillFormValues = (
  current: Record<string, string>,
  fields: { id: string }[],
  profile?: UserProfile | null
) => {
  if (!profile) return current;
  const next = { ...current };
  const trySet = (key: string, value?: string) => {
    if (!value) return;
    if (next[key] === undefined || next[key] === null || next[key] === "") {
      next[key] = value;
    }
  };
  fields.forEach((f) => {
    const key = f.id;
    switch (key) {
      case "name":
        trySet(key, profile.name);
        break;
      case "email":
        trySet(key, profile.email);
        break;
      case "company":
        trySet(key, profile.company);
        break;
      case "address":
      case "city":
        trySet(key, profile.address);
        break;
      case "bio":
        trySet(key, profile.bio);
        break;
      case "notes":
        trySet(key, profile.notes);
        break;
      default:
        if (profile.extras && profile.extras[key]) {
          trySet(key, profile.extras[key]);
        }
        break;
    }
  });
  return next;
};
