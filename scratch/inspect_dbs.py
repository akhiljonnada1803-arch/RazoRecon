import os, sqlite3, glob

for db in glob.glob('backend/data/*.db') + glob.glob('data/*.db'):
    try:
        conn = sqlite3.connect(db)
        cursor = conn.cursor()
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = [r[0] for r in cursor.fetchall()]
        print(f"=== DB: {db} ===")
        for t in tables:
            cursor.execute(f"SELECT COUNT(*) FROM {t}")
            cnt = cursor.fetchone()[0]
            print(f"  Table {t}: {cnt} rows")
            cursor.execute(f"SELECT * FROM {t} LIMIT 2")
            cols = [d[0] for d in cursor.description]
            print(f"    Cols: {cols}")
            for row in cursor.fetchall():
                row_str = str(row)
                if len(row_str) > 120:
                    row_str = row_str[:120] + "..."
                print(f"    Row: {row_str}")
    except Exception as e:
        print(f"Error reading {db}: {e}")
