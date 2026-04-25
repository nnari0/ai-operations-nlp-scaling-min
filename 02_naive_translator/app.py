from fastapi import FastAPI
from pydantic import BaseModel, Field
from transformers import T5ForConditionalGeneration, T5Tokenizer

app = FastAPI()

tokenizer = T5Tokenizer.from_pretrained("google/flan-t5-base")
model = T5ForConditionalGeneration.from_pretrained("google/flan-t5-base")


class RequestData(BaseModel):
    text: str = Field(..., min_length=1, max_length=1000)


@app.post("/predict")
async def predict(data: RequestData):
    input_text = f"translate German to English: {data.text}"
    input_ids = tokenizer(input_text, return_tensors="pt").input_ids
    outputs = model.generate(input_ids)
    translated_text = tokenizer.decode(outputs[0], skip_special_tokens=True)
    return {"translated_text": translated_text}
