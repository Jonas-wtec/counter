import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense
import matplotlib.pyplot as plt
from sklearn.metrics import confusion_matrix

# Load the data
df = pd.read_csv('dataContinous.csv', delimiter=';')

# Split the data into training and testing sets
X = df[['Unix Timestamp', 'motion']]
y = df['count']
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

# Normalize the data
X_mean = X_train.mean()
X_std = X_train.std()
X_train = (X_train - X_mean) / X_std
X_test = (X_test - X_mean) / X_std

# Define the model
num_classes = len(np.unique(y_train))
deepLearningModel = Sequential([
    Dense(32, activation='relu', input_shape=(2,)),
    Dense(16, activation='relu'),
    Dense(num_classes, activation='softmax')
])

# Compile the model
deepLearningModel.compile(optimizer='adam',
              loss='sparse_categorical_crossentropy',
              metrics=['accuracy'])

# Train the model
history = deepLearningModel.fit(X_train, y_train, epochs=100, batch_size=32, validation_data=(X_test, y_test))

# Evaluate the model
test_loss, test_acc = deepLearningModel.evaluate(X_test, y_test)
print('Test accuracy:', test_acc)

# Generate predictions on the test set
y_pred = np.argmax(deepLearningModel.predict(X_test), axis=-1)

# Create a confusion matrix
cm = confusion_matrix(y_test, y_pred)

# Plot the confusion matrix
fig, ax = plt.subplots(figsize=(8, 8))
ax.imshow(cm, cmap='Oranges')
ax.grid(False)
ax.set_xlabel('Estimate Anzahl Personen', fontsize=12, color='black')
ax.set_ylabel('Echte Anzahl Personen', fontsize=12, color='black')
ax.xaxis.set(ticks=range(num_classes))
ax.yaxis.set(ticks=range(num_classes))
ax.set_xticklabels(['0', '1', '2'])
ax.set_yticklabels(['0', '1', '2'])
for i in range(num_classes):
    for j in range(num_classes):
        ax.text(j, i, cm[i, j], ha='center', va='center', color='black')
plt.savefig("ConfusionMatrix.svg")
