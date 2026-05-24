import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

def migrate():
    conn = psycopg2.connect(os.getenv("DATABASE_URL"))
    cursor = conn.cursor()
    
    try:
        # Add latitude column if not exists
        cursor.execute("ALTER TABLE clicks ADD COLUMN IF NOT EXISTS latitude FLOAT;")
        print("Added latitude column.")
        
        # Add longitude column if not exists
        cursor.execute("ALTER TABLE clicks ADD COLUMN IF NOT EXISTS longitude FLOAT;")
        print("Added longitude column.")
        
        conn.commit()
        print("Migration successful.")
    except Exception as e:
        print(f"Error during migration: {e}")
        conn.rollback()
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    migrate()
