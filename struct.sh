#!/bin/bash

# Check if at least one directory is provided
if [ $# -lt 1 ]; then
    echo "Usage: $0 <directory> [excluded_dirs...]"
    exit 1
fi

target_dir="$1"
shift
excluded_dirs=("$@")

# Function to check if a path should be excluded
should_exclude() {
    local path="$1"
    for exclude in "${excluded_dirs[@]}"; do
        if [[ "$path" == *"$exclude"* ]]; then
            return 0
        fi
    done
    return 1
}

# Function to display file contents with header
display_file() {
    local file="$1"
    echo -e "\n=== File: $file ==="
    echo "Content:"
    cat "$file"
    echo -e "\n=== End of $file ===\n"
}

# Main function to traverse directory
scan_directory() {
    local dir="$1"
    local indent="$2"
    
    # Print current directory
    echo "${indent}📁 $(basename "$dir")"
    
    # Iterate through directory contents
    for item in "$dir"/*; do
        # Skip if item should be excluded
        if should_exclude "$item"; then
            continue
        fi
        
        if [ -d "$item" ]; then
            # Recursively process subdirectories
            scan_directory "$item" "  $indent"
        elif [ -f "$item" ]; then
            # Display file name and contents
            echo "${indent}  📄 $(basename "$item")"
            display_file "$item"
        fi
    done
}

# Start scanning from target directory
scan_directory "$target_dir" ""