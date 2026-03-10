export function getUserAvatarUrl(
  user: { user_metadata?: { avatar_url?: string; picture?: string } }
): string | null {
  const meta = user.user_metadata;
  return meta?.avatar_url ?? meta?.picture ?? null;
}

export function getUserDisplayName(
  user: { user_metadata?: { full_name?: string; name?: string }; email?: string }
): string {
  const meta = user.user_metadata;
  return meta?.full_name ?? meta?.name ?? user.email ?? 'User';
}
