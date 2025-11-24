from transformers import AutoModelForCausalLM, AutoTokenizer
from peft import PeftModel

MODEL_BASE = "google/gemma-2b"
ADAPTER_ID = r"D:\gigsup\education_model\ft-gemma-2b-edu-qlora"

print("🔹 Loading base Gemma model…")
base = AutoModelForCausalLM.from_pretrained(MODEL_BASE, torch_dtype="auto", device_map="auto")

print("🔹 Loading adapter…")
model = PeftModel.from_pretrained(base, ADAPTER_ID)
print("🔹 Merging adapter into base model…")
merged = model.merge_and_unload()

print("🔹 Saving merged model…")
merged.save_pretrained(r"D:\gigsup\education_model\gemma-edu-2b-merged")

# copy tokenizer from adapter folder
tok = AutoTokenizer.from_pretrained(ADAPTER_ID, use_fast=False)
tok.save_pretrained(r"D:\gigsup\education_model\gemma-edu-2b-merged")

print("✅ Merge complete.")