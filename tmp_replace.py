import os
import re

FRONTEND_DIR = r"e:\project\frontend\src"

# The formatting string to use globally
# Example output: "Mar 2, 2026, 11:28:24 AM"
REPLACEMENT = ".toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })"

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Regex to find .toLocaleTimeString(anything)
    # We use a non-greedy match to capture arguments inside ()
    new_content = re.sub(r'\.toLocaleTimeString\([^)]*\)', REPLACEMENT, content)
    
    # Also replace .toLocaleDateString just in case we only show the date somewhere
    new_content = re.sub(r'\.toLocaleDateString\([^)]*\)', REPLACEMENT, new_content)

    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated: {filepath}")

for root, _, files in os.walk(FRONTEND_DIR):
    for file in files:
        if file.endswith(('.ts', '.tsx', '.js', '.jsx')):
            process_file(os.path.join(root, file))

print("Replacement complete.")
