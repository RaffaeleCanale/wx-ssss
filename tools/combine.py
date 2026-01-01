import sys
import os
import argparse

sys.path.append(os.path.join(os.path.dirname(__file__), "vendor"))

import js2pysecrets as secrets

def main():
    parser = argparse.ArgumentParser(description="Combine shares to recover a secret.")
    parser.add_argument('shares', metavar='SHARE', type=str, nargs='+',
                        help='The share strings to combine')

    args = parser.parse_args()

    try:
        print ("Combining shares...")

        reconstructed_secret = secrets.combine(args.shares)

        # Output the result
        print("Reconstructed secret:")
        print(secrets.hex2str(reconstructed_secret))
    except Exception as e:
        print(f"Error combining shares: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()