import os
import torch

_NUM_THREADS_ENV = os.environ.get("TORCH_NUM_THREADS")

if _NUM_THREADS_ENV is not None:
    num_threads = int(_NUM_THREADS_ENV)
    torch.set_num_threads(num_threads)
    torch.set_num_interop_threads(num_threads)
    print(f"Setting torch to use {num_threads} threads")
else:
    print(f"TORCH_NUM_THREADS environment variable not set, using default number of threads {torch.get_num_threads()}")

# import of transformer need to be done after setting the number of threads, otherwise the default number of threads will be used
from transformers import T5ForConditionalGeneration, T5Tokenizer


print("Loading Model...")
tokenizer = T5Tokenizer.from_pretrained("google/flan-t5-base")
model = T5ForConditionalGeneration.from_pretrained("google/flan-t5-base")


def analyze(text: str):
    input_text = f"translate German to English: {text}"
    input_ids = tokenizer(input_text, return_tensors="pt").input_ids
    outputs = model.generate(input_ids)
    return {"translation": tokenizer.decode(outputs[0], skip_special_tokens=True)}
