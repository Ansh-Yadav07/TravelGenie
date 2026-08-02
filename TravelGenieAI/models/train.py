import pandas as pd
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import joblib
from settings import DATA_PATH, MODEL_PATH

def train_model():
    df = pd.read_csv(DATA_PATH)

    # Combine features into a single text field
    df["features"] = df["location"].astype(str) + " " + \
                     df["budget"].astype(str) + " " + \
                     df["mood"].astype(str) + " " + \
                     df["preferences"].astype(str)

    vectorizer = CountVectorizer()
    X = vectorizer.fit_transform(df["features"])

    joblib.dump((vectorizer, df, X), MODEL_PATH)
    print("Model trained and saved at", MODEL_PATH)

if __name__ == "__main__":
    train_model()