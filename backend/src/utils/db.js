const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./certificates.db", (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log("Connected to SQLite database");
  }
});

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS certificates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      certId TEXT,
      hash TEXT,
      filePath TEXT
    )
  `);
});

module.exports = db;