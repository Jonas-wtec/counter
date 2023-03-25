import pandas as pd
import numpy as np
import tensorflow as tf
from sklearn.model_selection import train_test_split

# Load the CSV file into a Pandas DataFrame
data = pd.read_csv('data.csv', delimiter=';', parse_dates=['time'])

# Drop the 'time' column from the DataFrame
data = data.drop(['time'], axis=1)

# Preprocess the data
data = pd.get_dummies(data, columns=['serialNum', 'location'])

# Convert the data to the appropriate data types
X = data.drop(['count', '_id'], axis=1).astype(np.float32).values
y = data['count'].astype(np.float32).values

# Split the data into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Define the deep learning model
model = tf.keras.models.Sequential([
    tf.keras.layers.Dense(64, activation='relu', input_shape=(X_train.shape[1],)),
    tf.keras.layers.Dropout(0.2),
    tf.keras.layers.Dense(1)
])

# Compile the model
model.compile(optimizer='adam', loss='mean_squared_error')

# Train the model
model.fit(X_train, y_train, validation_data=(X_test, y_test), epochs=10, batch_size=32)

# Evaluate the model on the test set
loss = model.evaluate(X_test, y_test)
print('Test set loss:', loss)
