"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, useSyncExternalStore } from "react";
import { logoutAction } from "@/actions/auth";
import { api, ApiError } from "./api";
import { User } from "@/types/global";

async function fetchMe() {
  try {
    const { user } = await api<{ user: User }>("/auth/me");
    return user;
  } catch (error) {
    // 401 just means nobody is logged in
    if (error instanceof ApiError && error.status === 401) return null;
    throw error;
  }
}

export function useCurrentUser() {
  const query = useQuery({
    queryKey: ["me"],
    queryFn: fetchMe,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: true,
    retry: false,
  });

  const hydrated = useSyncExternalStore(subscribeNothing, () => true, () => false);

  return { user: hydrated ? (query.data ?? null) : null, isLoading: !hydrated || query.isPending };
}

const subscribeNothing = () => () => {};


const CHANNEL = "learnhub-auth";

function tellOtherTabs() {
  if (typeof BroadcastChannel === "undefined") return; // very old browsers: tabs update on focus instead
  const channel = new BroadcastChannel(CHANNEL);
  channel.postMessage("changed");
  channel.close();
}

// Mounted once, in Providers
export function useAuthSync() {
  const queryClient = useQueryClient();
  useEffect(() => {
    if (typeof BroadcastChannel === "undefined") return;
    const channel = new BroadcastChannel(CHANNEL);
    channel.onmessage = () => queryClient.invalidateQueries();
    return () => channel.close();
  }, [queryClient]);
}

// Call the returned function with the user the API sent back after login or signup.
// It puts that user straight into the cache, so there is no extra request.
export function useStartSession() {
  const queryClient = useQueryClient();
  return (user: User) => {
    // forget anything that belonged to a previous user, then store the new one
    queryClient.removeQueries({ predicate: (query) => query.queryKey[0] !== "me" });
    queryClient.setQueryData(["me"], user);
    tellOtherTabs();
  };
}

export function useSignOut() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signOut() {
    setPending(true);
    setError(null);

    const result = await logoutAction();
    if (!result.success) {
      setError(result.message);
      setPending(false);
      return;
    }

    tellOtherTabs();
    // A full page load to the home page. It clears everything held in memory, and it avoids a race
    // with the route guard, which would otherwise send the user to /login first.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- full reload on purpose
    window.location.href = "/";
  }

  return { signOut, pending, error };
}