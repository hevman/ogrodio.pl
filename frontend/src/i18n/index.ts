import { pl } from "./pl";

type MessageTree = typeof pl;

type NestedKeyOf<T, Prefix extends string = ""> = T extends string
  ? Prefix extends "" ? never : Prefix
  : {
      [K in keyof T & string]: T[K] extends string
        ? Prefix extends "" ? K : `${Prefix}.${K}`
        : NestedKeyOf<T[K], Prefix extends "" ? K : `${Prefix}.${K}`>;
    }[keyof T & string];

export type MessageKey = NestedKeyOf<MessageTree>;

function resolve(path: string): unknown {
  return path.split(".").reduce<unknown>((node, key) => {
    if (node && typeof node === "object" && key in node) {
      return (node as Record<string, unknown>)[key];
    }
    return undefined;
  }, pl);
}

export function t(key: MessageKey, params?: Record<string, string | number>): string {
  const value = resolve(key);
  if (typeof value !== "string") return key;
  if (!params) return value;
  return Object.entries(params).reduce(
    (text, [name, param]) => text.replaceAll(`{${name}}`, String(param)),
    value,
  );
}

export function formatMoney(value: number): string {
  const amount = value.toFixed(2).replace(".00", "");
  return `${amount} ${t("common.currency")}`;
}

export function formatMoneyFromCents(value: number): string {
  return formatMoney(value / 100);
}

export { pl as messages };
