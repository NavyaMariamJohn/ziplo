import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

def check_clicks():
    conn = psycopg2.connect(os.getenv("DATABASE_URL"))
    cursor = conn.cursor()
    
    cursor.execute("SELECT id, ip_address, city, region, latitude, longitude, timestamp FROM clicks ORDER BY timestamp DESC LIMIT 5")
    rows = cursor.fetchall()
    
    print(f"{'ID':<5} | {'IP':<15} | {'City':<25} | {'Lat':<12} | {'Lng':<12}")
    print("-" * 75)
    for row in rows:
        print(f"{row[0]:<5} | {row[1]:<15} | {row[2]:<25} | {str(row[4]):<12} | {str(row[5]):<12}")
        
    cursor.close()
    conn.close()

if __name__ == "__main__":
    check_clicks()
