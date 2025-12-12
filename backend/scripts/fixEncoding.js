import mysql from 'mysql2/promise'

// Map of common mojibake sequences to their intended characters.
const replacements = [
  ['ÔÇö', '—'],
  ['ÔÇô', '–'],
  ['ÔÇ£', '“'],
  ['ÔÇØ', '”'],
  ['ÔÇÖ', '’'],
  ['ÔÇª', '…'],
  ['â', '—'],
  ['â', '–'],
  ['â', '’'],
  ['âœ', '“'],
  ['â�', '”'],
  ['â¢', '•'],
  ['â¦', '…'],
  ['Ã©', 'é'],
  ['Ã¨', 'è'],
  ['Ãª', 'ê'],
  ['Ã«', 'ë'],
  ['Ã ', 'à'],
  ['Ã¡', 'á'],
  ['Ã¢', 'â'],
  ['Ã£', 'ã'],
  ['Ã¤', 'ä'],
  ['Ã§', 'ç'],
  ['Ã¬', 'ì'],
  ['Ã­', 'í'],
  ['Ã®', 'î'],
  ['Ã¯', 'ï'],
  ['Ã³', 'ó'],
  ['Ã´', 'ô'],
  ['Ã¶', 'ö'],
  ['Ãº', 'ú'],
  ['Ã¼', 'ü'],
  ['Ã±', 'ñ'],
  ['Ãœ', 'Ü'],
  ['Ã–', 'Ö'],
  ['Ã„', 'Ä'],
  ['Â', '']
]

const textColumns = [
  { table: 'clubs', pk: 'clubName', columns: ['description'] },
  { table: 'events', pk: 'eventid', columns: ['title', 'description'] },
  { table: 'notifications', pk: 'notificationid', columns: ['message'] },
  { table: 'comments', pk: 'commentid', columns: ['comment'] }
]

const weirdScore = str => {
  if (!str) return 0
  return (str.match(/Ã|Â|ÔÇ|â|�/g) || []).length
}

const fixText = text => {
  if (typeof text !== 'string') return text
  let out = text
  for (const [bad, good] of replacements) {
    out = out.split(bad).join(good)
  }

  // Try a latin1 -> utf8 reinterpretation if it reduces mojibake markers.
  const recoded = Buffer.from(out, 'latin1').toString('utf8')
  if (weirdScore(recoded) < weirdScore(out)) {
    out = recoded
  }

  return out
}

const run = async () => {
  const conn = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: 'password',
    database: 'school_club_activity',
    charset: 'utf8mb4'
  })

  let updatedRows = 0

  for (const { table, pk, columns } of textColumns) {
    const [rows] = await conn.query(
      `SELECT ${pk}, ${columns.join(', ')} FROM ${table}`
    )

    for (const row of rows) {
      const updates = {}
      for (const col of columns) {
        const fixed = fixText(row[col])
        if (fixed !== row[col]) {
          updates[col] = fixed
        }
      }
      if (Object.keys(updates).length === 0) continue
      updatedRows++
      const setClause = Object.keys(updates)
        .map(col => `${col} = ?`)
        .join(', ')
      const values = [...Object.values(updates), row[pk]]
      await conn.query(
        `UPDATE ${table} SET ${setClause} WHERE ${pk} = ?`,
        values
      )
    }
  }

  await conn.end()
  console.log(`Updated rows: ${updatedRows}`)
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
