export const AVATAR_STYLES = ['classic', 'wave', 'crop', 'glasses'] as const;
export type AvatarStyle = typeof AVATAR_STYLES[number];
export type AvatarPreference = { photo?: string; style?: AvatarStyle };
export type WorkspacePersonData = { id?: string | null; name?: string | null; email?: string | null; avatar_url?: string | null; avatar_style?: AvatarStyle | null };
export function personInitials(name?: string | null) {
  const words = (name ?? '').split('@')[0].trim().split(/[\s._-]+/).filter(Boolean);
  return words.length ? `${words[0][0]}${words.length > 1 ? words[words.length - 1][0] : ''}`.toLocaleUpperCase('fi-FI') : '';
}
export function avatarSource(person: WorkspacePersonData, preference: AvatarPreference = {}) {
  const photo = preference.photo || person.avatar_url;
  if (photo && /^(https:\/\/|data:image\/(png|jpeg|webp);base64,)/i.test(photo)) return { kind: 'photo' as const, value: photo };
  const style = preference.style ?? person.avatar_style;
  if (style && AVATAR_STYLES.includes(style)) return { kind: 'illustration' as const, value: style };
  return { kind: 'initials' as const, value: personInitials(person.name || person.email) };
}