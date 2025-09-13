from fastapi import FastAPI
import uvicorn

# Create a simple app
app = FastAPI()

# Define a single, simple endpoint
@app.get("/")
def read_root():
    # This will print directly to your terminal when the endpoint is visited
    print("--- SERVER TEST WAS SUCCESSFUL ---")
    return {"Hello": "World"}

# This part runs the server when you execute the file
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)