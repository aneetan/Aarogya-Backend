import { DatasetProps } from "../types/embedding.types";

// Load the dataset from JSON file
export function loadDataset() {
  try {
    const dataset = require('../../data/first_aid_dataset.json');
    return dataset;
  } catch (error) {
    console.error('Error loading dataset:', error);
    throw new Error('Could not load the first aid dataset');
  }
}

// Validate the dataset structure
export function validateDataset(dataset: DatasetProps) {
  if (!dataset || !dataset.intents || !Array.isArray(dataset.intents)) {
    throw new Error('Invalid dataset structure: intents array is missing');
  }
  
  // Basic validation for each intent
  dataset.intents.forEach((intent, index) => {
    if (!intent.intent_name) {
      throw new Error(`Intent at index ${index} is missing intent_name`);
    }
    if (!intent.response || !intent.response.steps) {
      throw new Error(`Intent ${intent.intent_name} is missing response steps`);
    }
  });
  
  return true;
}