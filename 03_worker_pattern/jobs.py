from transformers import T5ForConditionalGeneration, T5Tokenizer

print("Loading Model...")
tokenizer = T5Tokenizer.from_pretrained("google/flan-t5-base")
model = T5ForConditionalGeneration.from_pretrained("google/flan-t5-base")


def analyze(text: str):
    input_text = f"translate German to English: {text}"
    input_ids = tokenizer(input_text, return_tensors="pt").input_ids
    outputs = model.generate(input_ids)
    return {"translation": tokenizer.decode(outputs[0], skip_special_tokens=True)}
