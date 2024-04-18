export enum Entity {
  Addresses = "addresses",
  Categories = "categories",
  Clubs = "clubs",
  Notifications = "notifications",
  Pins = "pins",
  Profiles = "profiles",
  Universities = "universities",
}

export enum Action {
  Crate = "create",
  Read = "read",
  Update = "update",
  Delete = "delete",
  Cancel = "cancel",
}

export enum Roles {
  Admin = "admin",
  Creator = "creator",
  User = "user",
}

type EntityPermissions<T extends Entity> = `${T}:${Action}`[];

type RolePermissions<T extends Roles, E extends Entity> = {
  [K in T]: Partial<`${E}:${Action}`[]>;
};

export const allPermissions: EntityPermissions<Entity> = [
  "addresses:create",
  "addresses:delete",
  "addresses:read",
  "addresses:update",
  "categories:create",
  "categories:read",
  "categories:update",
  "categories:delete",
  "clubs:create",
  "clubs:read",
  "clubs:update",
  "clubs:delete",
  "notifications:create",
  "notifications:read",
  "notifications:update",
  "notifications:delete",
  "pins:create",
  "pins:read",
  "pins:update",
  "pins:delete",
  "pins:cancel",
  "profiles:create",
  "profiles:read",
  "profiles:update",
  "profiles:delete",
  "universities:create",
  "universities:read",
  "universities:update",
  "universities:delete",
];

export const creatorPermissions: EntityPermissions<Entity> = [
  "addresses:create",
  "addresses:delete",
  "addresses:read",
  "addresses:update",
  "categories:read",
  "clubs:create",
  "clubs:read",
  "clubs:update",
  "notifications:create",
  "notifications:read",
  "notifications:update",
  "pins:create",
  "pins:delete",
  "pins:cancel",
  "pins:read",
  "pins:update",
  "profiles:read",
  "profiles:update",
  "profiles:create",
  "universities:read",
];

export const userPermissions: EntityPermissions<Entity> = [
  "addresses:read",
  "categories:read",
  "clubs:read",
  "notifications:create",
  "notifications:read",
  "pins:read",
  "profiles:read",
  "profiles:update",
  "profiles:create",
  "universities:read",
];

export const roleWisePermissions: RolePermissions<Roles, Entity> = {
  [Roles.Admin]: allPermissions,
  [Roles.Creator]: creatorPermissions,
  [Roles.User]: userPermissions,
};
