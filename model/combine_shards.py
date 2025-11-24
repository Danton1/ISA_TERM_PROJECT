import os
import glob
from datasets import Dataset, concatenate_datasets

def main():
    SHARD_DIR = r"D:\gigsup\education_model\career_tokenized_shards\shard_*"
    OUTPUT_DIR = r"D:\gigsup\education_model\career_tokenized_combined"

    print("🔍 Searching for shards...")
    shard_paths = sorted(glob.glob(SHARD_DIR))

    if not shard_paths:
        raise ValueError("No shard directories found!")

    print(f"📦 Found {len(shard_paths)} shards.")

    datasets_list = []
    for idx, shard_path in enumerate(shard_paths):
        print(f"➡️ Loading shard {idx}: {shard_path}")
        ds = Dataset.load_from_disk(shard_path)
        datasets_list.append(ds)

    print("🔗 Concatenating shards...")
    combined = concatenate_datasets(datasets_list)

    print("🔀 Shuffling dataset...")
    combined = combined.shuffle(seed=42)

    print(f"💾 Saving combined dataset to: {OUTPUT_DIR}")
    combined.save_to_disk(OUTPUT_DIR)

    print("\n🎉 DONE — combined dataset is ready!")


if __name__ == "__main__":
    main()
