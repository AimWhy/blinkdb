import { createDB, SyncDB } from "./createDB";
import { createTable } from "./createTable";

interface User1 {
  id: string;
  name: string;
}

interface User2 {
  uuid: string;
  age: number;
}

let db: SyncDB;

beforeEach(() => {
  db = createDB();
});

it("should create a table without options", () => {
  createTable<User1>(db, "user")();
});

it("should create a table with a different primary key", () => {
  createTable<User1>(
    db,
    "user"
  )({
    primary: "name",
  });
  createTable<User2>(
    db,
    "user"
  )({
    primary: "uuid",
  });
  createTable<User2>(
    db,
    "user"
  )({
    primary: "age",
  });
});