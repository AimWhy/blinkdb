import { BlinkKey, Table } from "../../core";
import { AllMatchers, Matchers, OrdProps, Where } from "../types";
import { analyzeMatcher } from "./matchers";

export function analyzeWhere<T, P extends keyof T>(
  table: Table<T, P>,
  where: Where<T>
): number {
  if (Object.keys(where).length === 0) return 0;

  let primaryKeyProperty = table[BlinkKey].options.primary;
  let minComplexity = Number.MAX_SAFE_INTEGER;

  for (const key in where) {
    const matcher = where[key];
    let complexity: number | undefined;
    if ((key as string) === primaryKeyProperty) {
      const btree = table[BlinkKey].storage.primary;
      complexity = analyzeMatcher(btree, matcher as AllMatchers<T[P] & OrdProps>);
    } else {
      const btree = table[BlinkKey].storage.indexes[key];
      if (btree) {
        complexity = analyzeMatcher(
          btree,
          matcher as AllMatchers<T[typeof key] & OrdProps>
        );
      }
    }
    if (complexity && complexity < minComplexity) {
      minComplexity = complexity;
    }
  }

  return minComplexity;
}
