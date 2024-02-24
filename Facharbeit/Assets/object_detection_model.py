# Der Code wurde mithilfe des Buches Practical TensorFlow.js von Juan De Dios Santos Rivera erstellt, 
# jedoch aus der Programmiersprache JavaScript in Python übersetzt

import tensorflow as tf
from tensorflow import keras

# Mnist Datensatz wird geladen und in Trainings- und Testdaten aufgeteilt
(train_img,train_label),(test_img,test_label) = keras.datasets.mnist.load_data()
 
# Die folgenden Zeilen bringen die Daten in die benötigte Form
train_img = train_img.reshape([-1, 28, 28, 1])
test_img = test_img.reshape([-1, 28, 28, 1])
train_img = train_img/255.0
test_img = test_img/255.0
 
train_label = keras.utils.to_categorical(train_label)
test_label = keras.utils.to_categorical(test_label)

# Definition des Modells
model = keras.Sequential([
    keras.layers.Conv2D(32, (5, 5), padding="same", input_shape=[28, 28, 1]),
    keras.layers.MaxPool2D((2,2)),
    keras.layers.Conv2D(64, (5, 5), padding="same"),
    keras.layers.MaxPool2D((2,2)),
    keras.layers.Flatten(),
    keras.layers.Dense(1024, activation="relu"),
    keras.layers.Dropout(0.2),
    keras.layers.Dense(10, activation="softmax")
])
model.compile(optimizer="adam", loss="categorical_crossentropy", metrics=["accuracy"])


# Testen und bewerten
model.fit(train_img,train_label, validation_data=(test_img,test_label), epochs=10)
test_loss,test_acc = model.evaluate(test_img, test_label)
print("Genauigkeit:", test_acc)

model.save("object_detection_model.h5")