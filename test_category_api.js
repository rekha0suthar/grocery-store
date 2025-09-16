// Test script to verify category API error handling
const axios = require('axios');

const API_BASE = 'http://localhost:3000/api';

async function testCategoryAPI() {
  try {
    console.log('Testing Category API Error Handling...\n');

    // Test 1: Try to create a category with duplicate name
    console.log('Test 1: Creating category with duplicate name...');
    try {
      const response = await axios.post(`${API_BASE}/categories`, {
        name: 'Test Category',
        description: 'Test description'
      });
      console.log('Response:', response.data);
    } catch (error) {
      console.log('Error response:', error.response?.data);
    }

    // Test 2: Try to create the same category again
    console.log('\nTest 2: Creating same category again...');
    try {
      const response = await axios.post(`${API_BASE}/categories`, {
        name: 'Test Category',
        description: 'Test description'
      });
      console.log('Response:', response.data);
    } catch (error) {
      console.log('Error response:', error.response?.data);
    }

    // Test 3: Try to delete a category with products
    console.log('\nTest 3: Trying to delete category with products...');
    try {
      const response = await axios.delete(`${API_BASE}/categories/1`);
      console.log('Response:', response.data);
    } catch (error) {
      console.log('Error response:', error.response?.data);
    }

  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testCategoryAPI();
