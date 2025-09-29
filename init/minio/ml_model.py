import os
import shutil
import numpy as np
import tensorflow as tf
import tensorflow.keras as keras # type: ignore
from keras import layers
from minio import Minio

# Config MinIO
MINIO_ENDPOINT = "localhost:9000"
ACCESS_KEY = "minioadmin"
SECRET_KEY = "minioadmin"
BUCKET_NAME = "ml-models"

client = Minio(
    MINIO_ENDPOINT,
    access_key=ACCESS_KEY,
    secret_key=SECRET_KEY,
    secure=False
)

# Dataset preparation
(x_train, y_train), (x_test, y_test) = keras.datasets.mnist.load_data()
x_train = x_train[:5000].astype("float32") / 255.0
y_train = y_train[:5000]
x_test = x_test[:1000].astype("float32") / 255.0
y_test = y_test[:1000]

dataset_file = "mnist_subset.npz"
np.savez(dataset_file, x_train=x_train, y_train=y_train, x_test=x_test, y_test=y_test)
client.fput_object(BUCKET_NAME, "classification-models/dataset/mnist_subset.npz", dataset_file)
print("✅ Dataset uploaded to MinIO")

# Function train & upload model
def train_and_upload(version: str, epochs: int = 3):
    model = keras.Sequential([
        layers.Flatten(input_shape=(28, 28)),
        layers.Dense(128, activation="relu"),
        layers.Dense(10, activation="softmax")
    ])
    model.compile(optimizer="adam", loss="sparse_categorical_crossentropy", metrics=["accuracy"])
    model.fit(x_train, y_train, epochs=epochs, validation_data=(x_test, y_test), verbose=2)

    model_dir = f"models/model1/saved_model_1_v{version}"
    model.export(model_dir)

    model_zip = f"{model_dir}.zip"
    shutil.make_archive(model_dir, "zip", model_dir)

    client.fput_object(BUCKET_NAME, f"classification-models/model_1/{os.path.basename(model_zip)}", model_zip)
    print(f"✅ Model v{version} uploaded to MinIO")

# Train 2 versions
train_and_upload("0", epochs=2)  # version 1.0
train_and_upload("1", epochs=5)  # version 1.1
