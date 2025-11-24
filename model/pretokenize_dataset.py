import os
import glob
from datasets import load_dataset
from transformers import AutoTokenizer

def main():
    BASE_MODEL = "google/gemma-2b"
    PARQUET_DIR = r"D:\gigsup\education_model\career_parquet\*.parquet"
    OUTPUT_ROOT = r"D:\gigsup\education_model\career_tokenized_shards"

    MAX_LENGTH = 512
    NUM_PROC = 2   # keep 1 until working

    os.makedirs(OUTPUT_ROOT, exist_ok=True)

    print("Loading tokenizer...")
    tok = AutoTokenizer.from_pretrained(BASE_MODEL)
    if tok.pad_token is None:
        tok.add_special_tokens({"pad_token": "<pad>"})
    tok.padding_side = "right"

    def tokenize_batch(batch):
        merged_texts = [
            batch["text"][i].strip() + "\n\n" +
            batch["labels"][i].strip() + "\n" +
            tok.eos_token
            for i in range(len(batch["text"]))
        ]

        enc = tok(
            merged_texts,
            padding="max_length",
            truncation=True,
            max_length=MAX_LENGTH,
        )
        labels = enc["input_ids"].copy()

        # Replace pad token with -100 in labels
        labels = [
            [-100 if token == tok.pad_token_id else token for token in seq]
            for seq in labels
        ]

        enc["labels"] = labels
        return enc

    parquet_files = sorted(glob.glob(PARQUET_DIR))
    print(f"Found {len(parquet_files)} parquet shards.\n")

    for idx, parquet_path in enumerate(parquet_files):
        shard_name = f"shard_{idx:03d}"
        output_dir = os.path.join(OUTPUT_ROOT, shard_name)

        if os.path.exists(output_dir):
            print(f"[SKIP] {shard_name} already tokenized.")
            continue

        print(f"\n=== Processing {shard_name} ===")

        ds = load_dataset("parquet", data_files=parquet_path, split="train")

        print("Columns in this shard:", ds.column_names)

        tokenized = ds.map(
            tokenize_batch,
            batched=True,
            num_proc=NUM_PROC,   # force stable single-core run
            remove_columns=ds.column_names,
        )

        tokenized.save_to_disk(output_dir)
        print(f"✓ Saved: {output_dir}")

    print("\n=== Tokenization Completed ===")

if __name__ == "__main__":
    main()
