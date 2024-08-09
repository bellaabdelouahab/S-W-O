import os
import subprocess

def convert_ts_to_mp4(input_dir, output_dir):
    # Create output directory if it doesn't exist
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    # Iterate through all files in the input directory
    for filename in os.listdir(input_dir):
        if filename.endswith(".ts"):
            input_path = os.path.join(input_dir, filename)
            output_filename = os.path.splitext(filename)[0] + ".mp4"
            output_path = os.path.join(output_dir, output_filename)

            # FFmpeg command to convert .ts to .mp4
            command = [
                "ffmpeg",
                "-i", input_path,
                "-c:v", "libx264",
                "-c:a", "aac",
                "-strict", "experimental",
                output_path
            ]

            print(f"Converting {filename} to {output_filename}...")
            subprocess.run(command, check=True)
            print(f"Conversion complete: {output_filename}")

# Example usage
input_directory = "C:/Users/abdob/Downloads/Video/testtstomp4/input"
output_directory = "C:/Users/abdob/Downloads/Video/testtstomp4/output"

convert_ts_to_mp4(input_directory, output_directory)