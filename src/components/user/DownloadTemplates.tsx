import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FileDown, Calendar, FileText, FileSpreadsheet } from 'lucide-react';
import { baseURL } from '../../Utils/network';
import { DateANdTimeOptions } from '../../Utils';

interface Template {
  _id: string;
  name: string;
  description: string;
  type: 'annual_returns' | 'remittance_schedule' | 'withholding_tax';
  fileUrl: string;
  uploadedAt: string;
  version: string;
  originalFilename: string;
  fileExtension: string;
  createdAt: string;
}

const DownloadTemplates: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${baseURL}/templates`);
        setTemplates(response.data);
      } catch (error) {
        toast.error('Failed to fetch templates. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  const getTemplateIcon = (type: string) => {
    switch (type) {
      case 'annual_returns':
        return <Calendar size={24} className="text-green-600" />;
      case 'remittance_schedule':
        return <FileSpreadsheet size={24} className="text-green-600" />;
      case 'withholding_tax':
        return <FileText size={24} className="text-purple-600" />;
      default:
        return <FileDown size={24} className="text-gray-600" />;
    }
  };

  const getTemplateColor = (type: string) => {
    switch (type) {
      case 'annual_returns':
        return 'border-blue-200 bg-blue-50';
      case 'remittance_schedule':
        return 'border-green-200 bg-green-50';
      case 'withholding_tax':
        return 'border-purple-200 bg-purple-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const handleDownload = async (template: Template) => {
    try {
      toast.success(`Downloading ${template.name}...`);
  
      // Log the download
      await axios.post(`${baseURL}/templates/download-log`, { templateId: template._id });
  
      // Fetch the file as a blob
      const response = await axios.get(template.fileUrl, {
        responseType: 'blob', // Ensure the response is treated as a binary file
      });
  
      // Create a temporary URL for the blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
  
      // Create a hidden <a> element to trigger the download
      const link = document.createElement('a');
      link.href = url;
      
      // Use the original filename with extension for download
      // If originalFilename exists, use it; otherwise, construct a filename with extension
      const downloadFilename = template.originalFilename || 
        `${template.name}.${template.fileExtension}`;
      
      link.setAttribute('download', downloadFilename);
      document.body.appendChild(link);
      link.click();
  
      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error('Failed to download template. Please try again.');
      console.error('Download error:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Download Templates</h1>
        <p className="text-gray-600">
          Download the required templates for your tax returns and submissions
        </p>
      </div>

      {templates.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <FileDown size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Templates Available</h3>
          <p className="text-gray-600">
            There are currently no templates available for download. Please check back later.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <div
              key={template._id}
              className={`border rounded-lg shadow-sm overflow-hidden ${getTemplateColor(
                template.type
              )}`}
            >
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="mr-3">{getTemplateIcon(template.type)}</div>
                  <h3 className="text-lg font-medium text-gray-900">{template.name}</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">{template.description}</p>
                <div className="flex justify-between items-center text-xs text-gray-500 mb-4">
                  <span>Version: {template.version}</span>
                  <span>
                      Updated: {new Date(template?.createdAt).toLocaleDateString('en-US', DateANdTimeOptions)}
                  </span>
                </div>
                <button
                  onClick={() => handleDownload(template)}
                  className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <FileDown size={16} className="mr-2" />
                  Download Template
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-lg font-medium text-blue-800 mb-2">How to use these templates</h3>
        <ol className="list-decimal pl-5 text-blue-700 space-y-1">
          <li>Download the appropriate template for your tax submission</li>
          <li>Fill in all required information accurately</li>
          <li>Save the completed template to your computer</li>
          <li>Go to the "Submit Returns" page to upload your completed template</li>
          <li>Attach any supporting documents as required</li>
          <li>Submit your return for processing</li>
        </ol>
      </div>
    </div>
  );
};

export default DownloadTemplates;