import os
import torch
import glob
import pandas as pd
from datasets import load_dataset, Dataset
from transformers import (
    AutoTokenizer,
    AutoModelForCausalLM,
    TrainingArguments,
)
from trl import SFTTrainer
from peft import LoraConfig, get_peft_model

# Disable bitsandbytes entirely (Windows fix)
os.environ["BITSANDBYTES_NOWELCOME"] = "1"
os.environ["BITSANDBYTES_DISABLE"] = "1"
os.environ["PEFT_BACKEND"] = "torch"  # ensure PEFT uses torch backend

torch.backends.cuda.matmul.allow_tf32 = True
import datasets
datasets.logging.set_verbosity_error()


# ============================================================
# CONFIGURATION
# ============================================================
CSV_PATH = r"D:\gigsup\education_model\career_skill_training.csv"   # your dataset
BASE_MODEL = "google/gemma-2b"
OUTPUT_DIR = "ft-gemma-2b-edu-qlora"                   # output folder for adapter
# ============================================================

# 1️⃣ Load tokenizer
tok = AutoTokenizer.from_pretrained(BASE_MODEL)
tok.pad_token = tok.eos_token
tok.padding_side = "right"

# 2️⃣ Load CSV dataset
train_dataset = Dataset.load_from_disk(r"D:\gigsup\education_model\career_tokenized_combined")
train_dataset = train_dataset.shuffle(seed=42)
print(train_dataset.column_names)
sample = train_dataset[0]
print(len(sample["input_ids"]))
print(len(sample["labels"]))
print(sample["labels"][:50])

# print(f"Length of Training set: {len(dataset)}")

# 3️⃣ Load base Gemma model (full precision)
model = AutoModelForCausalLM.from_pretrained(
    BASE_MODEL,
    torch_dtype=torch.bfloat16,
    device_map="auto",
)

# 4️⃣ Apply LoRA adapter
peft_cfg = LoraConfig(
    r=16,
    lora_alpha=32,
    lora_dropout=0.05,
    target_modules=[
        "q_proj", "k_proj", "v_proj", "o_proj",
        "gate_proj", "up_proj", "down_proj"
    ],
)
model = get_peft_model(model, peft_cfg)
model.to(torch.bfloat16)
model.train()
model.peft_config["default"].inference_mode = False
model.print_trainable_parameters()

# 5️⃣ Training setup — no bitsandbytes
args = TrainingArguments(
    output_dir=OUTPUT_DIR,
    per_device_train_batch_size=4,
    gradient_accumulation_steps=4,
    learning_rate=2e-4,
    num_train_epochs=2,
    fp16=False,
    bf16=True,
    warmup_ratio=0.05,
    max_grad_norm=1.0,
    logging_steps=25,
    save_strategy="epoch",
    save_total_limit=2,
    report_to="none",
    optim="adamw_torch",   # ✅ normal PyTorch AdamW
)

# 6️⃣ Trainer
trainer = SFTTrainer(
    model=model,
    tokenizer=tok,
    train_dataset=train_dataset,
    args=args,
    max_seq_length=160,
    packing=True,
)

# 7️⃣ Train
trainer.train()

# 8️⃣ Save adapter + tokenizer
trainer.model.save_pretrained(OUTPUT_DIR)
tok.save_pretrained(OUTPUT_DIR)

print(f"✅ Training complete. Adapter saved to: {OUTPUT_DIR}")
