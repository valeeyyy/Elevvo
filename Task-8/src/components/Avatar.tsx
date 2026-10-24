/** Muted, mutually distinct tints. Identity only, never data: status colour lives elsewhere. */
const TINTS: readonly { bg: string; ink: string }[] = [
  { bg: "#26244f", ink: "#c3bdff" },
  { bg: "#16352b", ink: "#9be3c0" },
  { bg: "#12363b", ink: "#8fdde5" },
  { bg: "#16304c", ink: "#9fcdf5" },
  { bg: "#42202f", ink: "#f5a8c2" },
  { bg: "#252e44", ink: "#b9c4de" },
];

function hash(value: string): number {
  let result = 0;
  for (let index = 0; index < value.length; index += 1) {
    result = (result * 31 + value.charCodeAt(index)) >>> 0;
  }
  return result;
}

export interface AvatarProps {
  name: string;
}

export function Avatar({ name }: AvatarProps) {
  const tint = TINTS[hash(name.toLowerCase()) % TINTS.length] as { bg: string; ink: string };
  const initial = name.trim().charAt(0).toUpperCase() || "?";
  return (
    <span
      aria-hidden="true"
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] font-display text-[15px] font-semibold"
      style={{ backgroundColor: tint.bg, color: tint.ink }}
    >
      {initial}
    </span>
  );
}
