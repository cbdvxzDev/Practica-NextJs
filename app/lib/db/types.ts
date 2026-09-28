// app/lib/db/types.ts
// Contrato común de los motores de datos. Lo implementan `json-store` (por
// defecto) y `mongo-store` (cuando hay MONGODB_URI). El resto de la app solo
// habla con esta interfaz, asi que cambiar de motor no toca las rutas API.

export type CollectionName =
  | "products"
  | "categories"
  | "users"
  | "orders"
  | "subscribers"
  | "contactMessages";

export interface DataStore {
  /** Nombre del motor, solo para logs y para la ruta /api/health. */
  name: "json" | "mongo";

  connect(): Promise<void>;
  disconnect(): Promise<void>;

  readCollection<T>(collection: CollectionName): T[];
  writeCollection<T>(collection: CollectionName, data: T[]): void;
  insertRecord<T extends { id: string }>(collection: CollectionName, record: T): T;
  updateRecord<T extends { id: string }>(
    collection: CollectionName,
    id: string,
    updates: Partial<T>
  ): T | undefined;
  deleteRecord(collection: CollectionName, id: string): boolean;
  findById<T extends { id: string }>(collection: CollectionName, id: string): T | undefined;
}
