"""
One-off migration: add any missing columns to the users table.
Safe to run multiple times — it checks before altering.
"""
import sqlite3

db_path = "travel_planner.db"
con = sqlite3.connect(db_path)
cur = con.cursor()

cur.execute("PRAGMA table_info(users)")
cols = [row[1] for row in cur.fetchall()]
print("Current users columns:", cols)

migrations = {
    "google_id":   "ALTER TABLE users ADD COLUMN google_id TEXT",
    "picture":     "ALTER TABLE users ADD COLUMN picture TEXT",
    "preferences": 'ALTER TABLE users ADD COLUMN preferences TEXT DEFAULT "{}"',
}

for col, sql in migrations.items():
    if col not in cols:
        cur.execute(sql)
        print(f"  ✓ Added column: {col}")
    else:
        print(f"  - Skipped (already exists): {col}")

# Create a unique index on google_id if it doesn't exist yet
try:
    cur.execute("CREATE UNIQUE INDEX IF NOT EXISTS ix_users_google_id ON users (google_id)")
    print("  ✓ Ensured unique index on google_id")
except Exception as e:
    print(f"  - Index skipped: {e}")

con.commit()
con.close()
print("\nMigration complete.")
