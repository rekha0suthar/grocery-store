import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import StyleTest from '../components/UI/StyleTest.jsx';
import Button from '../components/UI/Button.jsx';
import Card from '../components/UI/Card.jsx';
import Input from '../components/UI/Input.jsx';
import { testApiConnection, getApiStatus, testProductsEndpoint } from '../utils/apiTest.js';

const StyleTestPage = () => {
  const [apiStatus, setApiStatus] = useState(null);
  const [isTestingApi, setIsTestingApi] = useState(false);
  const [productsTest, setProductsTest] = useState(null);
  const [isTestingProducts, setIsTestingProducts] = useState(false);

  useEffect(() => {
    handleApiTest();
  }, []);

  const handleApiTest = async () => {
    setIsTestingApi(true);
    const result = await testApiConnection();
    setApiStatus(result);
    setIsTestingApi(false);
  };

  const handleProductsTest = async () => {
    setIsTestingProducts(true);
    const result = await testProductsEndpoint();
    setProductsTest(result);
    setIsTestingProducts(false);
  };

  const currentApiStatus = getApiStatus();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            API & Style Test Page
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Test API connections and Tailwind CSS styles.
          </p>
          <Link to="/login">
            <Button size="lg" className="mr-4">
              Go to Login
            </Button>
          </Link>
        </div>

        <Card className="p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">API Configuration</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Current Configuration</h3>
                <div className="bg-gray-100 p-3 rounded-md text-sm">
                  <p><strong>API URL:</strong> {currentApiStatus.baseURL}</p>
                  <p><strong>Environment:</strong> {currentApiStatus.environment}</p>
                  <p><strong>Debug Mode:</strong> {currentApiStatus.debug ? 'Enabled' : 'Disabled'}</p>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">API Connection Test</h3>
                <div className="space-y-2">
                  <Button
                    onClick={handleApiTest}
                    loading={isTestingApi}
                    size="sm"
                    className="w-full"
                  >
                    Test API Connection
                  </Button>
                  {apiStatus && (
                    <div className={`p-3 rounded-md text-sm ${
                      apiStatus.success 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {apiStatus.success ? (
                        <div>
                          <p className="font-medium">✅ Connection Successful</p>
                          <p>Status: {apiStatus.data?.message || 'OK'}</p>
                        </div>
                      ) : (
                        <div>
                          <p className="font-medium">❌ Connection Failed</p>
                          <p>Error: {apiStatus.error}</p>
                          {apiStatus.status && <p>Status: {apiStatus.status}</p>}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Products API Test</h2>
          <div className="space-y-4">
            <Button
              onClick={handleProductsTest}
              loading={isTestingProducts}
              size="sm"
              className="w-full md:w-auto"
            >
              Test Products Endpoint
            </Button>
            
            {productsTest && (
              <div className={`p-4 rounded-md ${
                productsTest.success 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {productsTest.success ? (
                  <div>
                    <p className="font-medium">✅ Products Retrieved Successfully</p>
                    <p>Count: {productsTest.count} products</p>
                    {productsTest.products.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm font-medium">First Product:</p>
                        <div className="text-xs bg-white p-2 rounded mt-1">
                          <p><strong>Name:</strong> {productsTest.products[0].name}</p>
                          <p><strong>Price:</strong> ${productsTest.products[0].price}</p>
                          <p><strong>Stock:</strong> {productsTest.products[0].stock}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <p className="font-medium">❌ Products Test Failed</p>
                    <p>Error: {productsTest.error}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>

        <StyleTest />

        <Card className="p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Button Styles</h2>
          <div className="flex flex-wrap gap-4">
            <Button variant="primary">Primary Button</Button>
            <Button variant="secondary">Secondary Button</Button>
            <Button variant="danger">Danger Button</Button>
            <Button variant="success">Success Button</Button>
            <Button variant="outline">Outline Button</Button>
            <Button variant="ghost">Ghost Button</Button>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Form Styles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="Enter your email"
            />
            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
            />
            <Input
              label="Full Name"
              type="text"
              placeholder="Enter your full name"
            />
            <Input
              label="Phone Number"
              type="tel"
              placeholder="Enter your phone"
            />
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Color Palette</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-500 text-white p-4 rounded-lg text-center">
              Blue 500
            </div>
            <div className="bg-green-500 text-white p-4 rounded-lg text-center">
              Green 500
            </div>
            <div className="bg-red-500 text-white p-4 rounded-lg text-center">
              Red 500
            </div>
            <div className="bg-yellow-500 text-white p-4 rounded-lg text-center">
              Yellow 500
            </div>
            <div className="bg-purple-500 text-white p-4 rounded-lg text-center">
              Purple 500
            </div>
            <div className="bg-pink-500 text-white p-4 rounded-lg text-center">
              Pink 500
            </div>
            <div className="bg-indigo-500 text-white p-4 rounded-lg text-center">
              Indigo 500
            </div>
            <div className="bg-gray-500 text-white p-4 rounded-lg text-center">
              Gray 500
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Typography</h2>
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-gray-900">Heading 1 - 4xl Bold</h1>
            <h2 className="text-3xl font-semibold text-gray-800">Heading 2 - 3xl Semibold</h2>
            <h3 className="text-2xl font-medium text-gray-700">Heading 3 - 2xl Medium</h3>
            <h4 className="text-xl font-medium text-gray-600">Heading 4 - xl Medium</h4>
            <p className="text-lg text-gray-600">Large paragraph text</p>
            <p className="text-base text-gray-700">Base paragraph text</p>
            <p className="text-sm text-gray-500">Small paragraph text</p>
            <p className="text-xs text-gray-400">Extra small paragraph text</p>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Spacing & Layout</h2>
          <div className="space-y-4">
            <div className="bg-blue-100 p-4 rounded">
              <p className="text-blue-800">Padding 4 (1rem)</p>
            </div>
            <div className="bg-green-100 p-6 rounded">
              <p className="text-green-800">Padding 6 (1.5rem)</p>
            </div>
            <div className="bg-red-100 p-8 rounded">
              <p className="text-red-800">Padding 8 (2rem)</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default StyleTestPage;
