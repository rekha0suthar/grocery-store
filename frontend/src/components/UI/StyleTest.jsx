import React from 'react';

const StyleTest = () => {
  return (
    <div className="p-8 bg-blue-500 text-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-4">Tailwind CSS Test</h1>
      <p className="text-lg mb-4">If you can see this styled component, Tailwind CSS is working!</p>
      <div className="flex space-x-4">
        <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded">
          Green Button
        </button>
        <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded">
          Red Button
        </button>
      </div>
    </div>
  );
};

export default StyleTest;
