import sys
import json
from transformers import AutoModelForSeq2SeqLM, AutoTokenizer

# Load a small local model (no API required)
MODEL_NAME = "google/flan-t5-small"  # small, local model

tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModelForSeq2SeqLM.from_pretrained(MODEL_NAME)

def generate_alerts(weather_json):
    # Build prompt
    prompt = f"""
You are a friendly weather assistant.
Generate a timeline-based weather alert for today for each location below.
Include short actionable messages with icons for morning, afternoon, and evening.

Weather Data:
{weather_json}

Format the response as JSON:
[
  {{
    "location": "Location Name",
    "timeline": [
      {{"time": "Morning", "message": "Message here", "icon": "☀️"}},
      {{"time": "Afternoon", "message": "Message here", "icon": "🌤️"}},
      {{"time": "Evening", "message": "Message here", "icon": "🌙"}}
    ]
  }}
]
"""
    inputs = tokenizer(prompt, return_tensors="pt", max_length=512, truncation=True)
    outputs = model.generate(**inputs, max_new_tokens=500)
    text = tokenizer.decode(outputs[0], skip_special_tokens=True)
    return text

if __name__ == "__main__":
    # Accept JSON string as input argument
    weather_data = sys.argv[1]
    result = generate_alerts(weather_data)
    print(result)
