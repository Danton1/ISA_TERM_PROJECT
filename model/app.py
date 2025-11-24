# ChatGPT and Copoilot assisted with the proofreading and optimization of this code.
import gradio as gr
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM, BitsAndBytesConfig
from peft import PeftModel

# ChatGPT was used in to help generate this code

BASE = "google/gemma-2b"                   # or "google/gemma-2-2b"
ADAPTER = "your-username/gemma-edu-2b-qlora/adapter"

bnb = BitsAndBytesConfig(load_in_4bit=True, bnb_4bit_compute_dtype=torch.bfloat16)
tok = AutoTokenizer.from_pretrained(BASE)

base = AutoModelForCausalLM.from_pretrained(
    BASE, quantization_config=bnb, device_map="auto"
)

model = PeftModel.from_pretrained(base, ADAPTER)
model.eval()

def chat(prompt, max_new_tokens=256, temperature=0.2):
    inputs = tok(prompt, return_tensors="pt").to(model.device)
    with torch.no_grad():
        out = model.generate(
            **inputs,
            max_new_tokens=max_new_tokens,
            temperature=temperature,
            do_sample=temperature > 0,
            pad_token_id=tok.eos_token_id
        )
    return tok.decode(out[0], skip_special_tokens=True)

demo = gr.Interface(
    fn=chat,
    inputs=[gr.Textbox(label="Prompt", lines=8), gr.Slider(32, 1024, 256, step=32, label="Max new tokens"), gr.Slider(0.0, 1.0, 0.2, step=0.05, label="Temperature")],
    outputs=gr.Textbox(label="Response"),
    title="Gemma 2B – Education QA (QLoRA adapter)"
)

if __name__ == "__main__":
    demo.launch()