import { clone } from "./clone";
import { SyncKey } from "./createDB";
import { SyncTable } from "./createTable";

/**
 * Saves updates of the given `entity` in `table`.
 *
 * @throws if the entity has not been inserted into the table before, e.g. if the primary key of the entity was not found.
 *
 * @example
 * const db = createDB();
 * const userTable = createTable<User>(db, "users")();
 * const userId = await insert(userTable, { id: uuid(), name: 'Alice', age: 15 });
 * // Increase the age of Alice
 * await update(userTable, { id: userId, age: 16 });
 */
export async function update<T, P extends keyof T>(
  table: SyncTable<T, P>,
  diff: Diff<T, P>
): Promise<void> {
  const primaryKeyProperty = table[SyncKey].options.primary;
  const primaryKey = diff[primaryKeyProperty] as unknown as T[P];
  const item = table[SyncKey].storage.primary.get(primaryKey);

  if (item === undefined || item === null) {
    throw new Error(`Item with primary key "${primaryKey}" not found.`);
  }

  const oldItem = clone(item);
  for (let key in diff) {
    if (key === primaryKeyProperty) {
      continue;
    }
    item[key as keyof T] = diff[key as keyof Diff<T, P>] as any;
  }

  table[SyncKey].events.onUpdate.dispatch({ oldEntity: oldItem, newEntity: item });
}

export type Diff<T, P extends keyof T> = Partial<Omit<T, P>> & Required<Pick<T, P>>;
