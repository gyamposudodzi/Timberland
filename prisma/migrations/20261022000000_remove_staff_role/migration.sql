-- Collapse roles to CUSTOMER / ADMIN: remove the intermediate STAFF role.

-- Any existing staff accounts lose the role before the enum value is removed.
DELETE FROM "User" WHERE "role" = 'STAFF';

-- Rebuild the Role enum without STAFF (Postgres cannot drop a single value safely).
ALTER TYPE "Role" RENAME TO "Role_old";
CREATE TYPE "Role" AS ENUM ('CUSTOMER', 'ADMIN');
ALTER TABLE "User"
  ALTER COLUMN "role" DROP DEFAULT,
  ALTER COLUMN "role" TYPE "Role" USING ("role"::text::"Role"),
  ALTER COLUMN "role" SET DEFAULT 'CUSTOMER';
DROP TYPE "Role_old";
