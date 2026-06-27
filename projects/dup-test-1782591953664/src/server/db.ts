import initSqlJs, { Database } from 'sql.js'
import * as fs from 'fs'
import * as path from 'path'

let db: Database | null = null
let sqlJs: any = null

export async function initializeDatabase(): Promise<void> {
  const dbPath = path.join(process.cwd(), 'database.sqlite')
  
  if (db) return

  sqlJs = await initSqlJs()
  
  let fileBuffer: Buffer | undefined
  try {
    fileBuffer = fs.readFileSync(dbPath)
  } catch {
    // Database doesn't exist yet, will create new one
  }

  if (fileBuffer) {
    db = new sqlJs.Database(fileBuffer)
  } else {
    db = new sqlJs.Database()
    await createTables(db)
    await seedDatabase(db)
  }
}

export function getDatabase(): Database {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDatabase() first.')
  }
  return db
}

async function createTables(database: Database): Promise<void> {
  const sql = `
    CREATE TABLE IF NOT EXISTS test_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `
  database.run(sql)
}

async function seedDatabase(database: Database): Promise<void> {
  const sql = `
    INSERT INTO test_records (name, description) VALUES
      ('Sample Record 1', 'This is a sample record for testing purposes.'),
      ('Sample Record 2', 'Another sample record to demonstrate the application.'),
      ('Sample Record 3', 'A third sample record with more details.')
  `
  database.run(sql)
}

export function closeDatabase(): void {
  if (db) {
    db.close()
    db = null
  }
}
