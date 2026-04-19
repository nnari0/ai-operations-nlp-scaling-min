from fastapi import FastAPI
from pydantic import BaseModel
from transformers import pipeline

app = FastAPI()

nlp_model = pipeline(
    "sentiment-analysis",
    model="tabularisai/multilingual-sentiment-analysis",
)


class RequestData(BaseModel):
    text: str


@app.post("/predict")
async def predict(data: RequestData):
    result = nlp_model(data.text)
    return {"result": result}
