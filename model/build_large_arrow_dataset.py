import pyarrow as pa
import pyarrow.dataset as ds
import pyarrow.parquet as pq
import pandas as pd
import os

CSV_PATH = r"D:\gigsup\education_model\career_skill_training.csv"
OUT_DIR = r"D:\gigsup\education_model\career_parquet"

os.makedirs(OUT_DIR, exist_ok=True)

chunksize = 200_000
part = 0

for chunk in pd.read_csv(CSV_PATH, chunksize=chunksize):
    formatted = []

    for _, row in chunk.iterrows():
        prompt = (
            f"### Instruction:\n{row['instruction']}\n\n"
            f"### Input:\n{row['input']}\n\n"
            f"### Response:\n"
        )

        formatted.append({
            "text": prompt,  # Model sees this as input
            "labels": row["output"]  # Model learns to generate ONLY this
        })

    table = pa.Table.from_pylist(formatted)

    pq.write_table(table, os.path.join(OUT_DIR, f"part_{part}.parquet"))
    part += 1

print(f"Done. Created {part} parquet shards in {OUT_DIR}")
