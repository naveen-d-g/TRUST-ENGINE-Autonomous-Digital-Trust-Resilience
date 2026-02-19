import subprocess
import time
import sys
import os

def main():
    procs = []
    scripts = [
        "backend/simulation/web_generator.py",
        "backend/ingestion/web_monitor.py",
        "backend/ingestion/system_monitor.py",
        "backend/ingestion/network_monitor.py"
    ]
    
    print("Starting Monitoring Stack...")
    print("Press Ctrl+C to stop all monitors.")
    
    try:
        for script in scripts:
            script_path = os.path.join(os.getcwd(), script.replace("/", os.sep))
            if not os.path.exists(script_path):
                print(f"[ERROR] Script not found: {script_path}")
                continue
                
            print(f"Launching {script}...")
            # Use same python interpreter
            p = subprocess.Popen([sys.executable, script_path], cwd=os.getcwd())
            procs.append(p)
            time.sleep(1) # Start delay
            
        print("All monitors running.")
        while True:
            time.sleep(1)
            
    except KeyboardInterrupt:
        print("\nStopping monitors...")
        for p in procs:
            try:
                p.terminate()
            except:
                pass
        print("Stopped.")

if __name__ == "__main__":
    main()
