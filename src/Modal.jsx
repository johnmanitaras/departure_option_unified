import React, { useRef } from 'react';

    function Modal({ data, onClose }) {
      const contentRef = useRef(null);

      const handleCopy = async () => {
        if (contentRef.current) {
          try {
            await navigator.clipboard.writeText(contentRef.current.textContent);
            alert('Content copied to clipboard!');
          } catch (err) {
            console.error('Failed to copy text: ', err);
            alert('Failed to copy content to clipboard.');
          }
        }
      };

      return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg w-96 h-[32rem] overflow-hidden fixed-modal flex flex-col">
            <div className="p-4 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Data Received</h3>
              <button
                onClick={handleCopy}
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 text-sm"
              >
                Copy
              </button>
            </div>
            <div className="flex-grow overflow-y-auto p-4" ref={contentRef}>
              <pre className="text-sm text-gray-500">{JSON.stringify(data, null, 2)}</pre>
            </div>
            <div className="bg-gray-100 px-4 py-3 flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      );
    }

    export default Modal;
