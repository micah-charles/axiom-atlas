export type Point = { x: number; y: number };

function numericToken(token: string): number { return Number(token.replace(/[+×−÷]/g, "")); }

/** Apply an arithmetic operator token to a running ingot value. */
export function applyOperator(value: number, token: string): number {
  const amount = numericToken(token);
  if (token.startsWith("+")) return value + amount;
  if (token.startsWith("−")) return value - amount;
  if (token.startsWith("×")) return value * amount;
  if (token.startsWith("÷")) return amount === 0 ? value : value / amount;
  return value;
}

export function arithmeticChain(start: number, tokens: string[]): number { return tokens.reduce(applyOperator, start); }

/** Interpret directional and vector tokens as a walk on the coordinate plane. */
export function vectorWalk(tokens: string[], start: Point = { x: 0, y: 0 }): Point {
  return tokens.reduce((point, token) => {
    const next = { ...point };
    if (token === "EAST") next.x += 1;
    else if (token === "WEST") next.x -= 1;
    else if (token === "NORTH") next.y += 1;
    else if (token === "SOUTH") next.y -= 1;
    else { const vector = token.match(/VECTOR \(([-\d]+),([-\d]+)\)/); if (vector) { next.x += Number(vector[1]); next.y += Number(vector[2]); } }
    return next;
  }, start);
}

export function angleFromToken(token?: string): number { return Number(token?.match(/(\d+)°/)?.[1] ?? 0); }

/** Parse a probability fact such as "NORTH: 70% × 40" into its expected return. */
export function expectedValueFromFact(fact?: string): number | null {
  if (!fact) return null;
  const match = fact.match(/(\d+(?:\.\d+)?)%\s*[×x]\s*(\d+(?:\.\d+)?)/i);
  return match ? Number(match[1]) / 100 * Number(match[2]) : null;
}

export function functionTrace(tokens: string[]): string { return tokens.length ? tokens.join(" → ") : "INPUT"; }
