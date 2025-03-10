import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  FileText,
  Upload,
  Trash2,
  Download,
  Calendar,
  FileSpreadsheet,
  X,
  Plus
} from 'lucide-react';
import { baseURL } from "../../Utils/Network";
import { DateANdTimeOptions } from '../../Utils/index.tsx';

interface Template {
  _id: string;
  name: string;
  description: string;
  type: 'annual_returns' | 'remittance_schedule' | 'withholding_tax';
  fileUrl: string;
  uploadedAt: string;
  version: string;
  downloadCount: number;
  createdAt: string;
  originalFilename: string;
  fileExtension: string;
}

interface TemplateFormData {
  name: string;
  description: string;
  type: 'annual_returns' | 'remittance_schedule' | 'withholding_tax';
  version: string;
}

const ManageTemplates: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [templateToDelete, setTemplateToDelete] = useState<Template | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<TemplateFormData>();

  useEffect(() => {
    fetchTemplates();
  }, []);

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

  const openAddModal = () => {
    reset({
      name: '',
      description: '',
      type: 'annual_returns',
      version: '1.0'
    });
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const openDeleteModal = (template: Template) => {
    setTemplateToDelete(template);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setTemplateToDelete(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      console.log("File selected:", e.target.files[0]);
    }
  };

  const handleDeleteTemplate = async () => {
    if (!templateToDelete) return;

    try {
      await axios.delete(`${baseURL}/templates/${templateToDelete._id}`);
      toast.success('Template deleted successfully!');
      fetchTemplates();
      closeDeleteModal();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete template. Please try again.');
    }
  };

  const onSubmit = async (data: TemplateFormData) => {
    console.log("Form submitted", data);
    if (!selectedFile) {
      toast.error('Please select a template file to upload');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('description', data.description);
      formData.append('type', data.type);
      formData.append('version', data.version);
      formData.append('file', selectedFile);

      await axios.post(`${baseURL}/templates`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success('Template uploaded successfully!');
      fetchTemplates();
      closeModal();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to upload template. Please try again.');
    }
  };

  const getTemplateIcon = (type: string) => {
    switch (type) {
      case 'annual_returns':
        return <Calendar size={24} className="text-green-600" />;
      case 'remittance_schedule':
        return <FileSpreadsheet size={24} className="text-green-600" />;
      case 'withholding_tax':
        return <FileText size={24} className="text-purple-600" />;
      default:
        return <FileText size={24} className="text-gray-600" />;
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

  const getTemplateTypeName = (type: string) => {
    switch (type) {
      case 'annual_returns':
        return 'Annual Returns';
      case 'remittance_schedule':
        return 'Remittance Schedule';
      case 'withholding_tax':
        return 'Withholding Tax';
      default:
        return type;
    }
  };

  const handleDownload = async (template: Template) => {
    try {
      toast.success(`Downloading ${template.name}...`);

      // Fetch the file as a blob
      const response = await axios.get(template.fileUrl, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));

      const link = document.createElement('a');
      link.href = url;

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

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Templates</h1>
          <p className="text-gray-600">Upload and manage templates for users</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={openAddModal}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Upload size={16} className="mr-2" />
            Upload Template
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.length > 0 ? (
            templates.map((template) => (
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
                  <div className="flex justify-between items-center text-xs text-gray-500 mb-4">
                    <span>Type: {getTemplateTypeName(template.type)}</span>
                    <span>Downloads: {template.downloadCount}</span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleDownload(template)}
                      className="flex-1 flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Download size={16} className="mr-2" />
                      Download
                    </button>
                    <button
                      onClick={() => openDeleteModal(template)}
                      className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full bg-white rounded-lg shadow p-6 text-center">
              <FileText size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Templates Available</h3>
              <p className="text-gray-600 mb-4">
                There are currently no templates uploaded. Click the button below to upload your first template.
              </p>
              <button
                onClick={openAddModal}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Upload size={16} className="mr-2" />
                Upload Template
              </button>
            </div>
          )}
        </div>
      )}

      {/* Upload Template Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                    <Upload size={20} className="text-green-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Upload New Template
                    </h3>
                    <div className="mt-4">
                      <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="space-y-6">
                          <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                              Template Name
                            </label>
                            <div className="mt-1">
                              <input
                                type="text"
                                id="name"
                                {...register('name', { required: 'Template name is required' })}
                                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                              />
                              {errors.name && (
                                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                              )}
                            </div>
                          </div>

                          <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                              Description
                            </label>
                            <div className="mt-1">
                              <textarea
                                id="description"
                                rows={3}
                                {...register('description', { required: 'Description is required' })}
                                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                              ></textarea>
                              {errors.description && (
                                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                              )}
                            </div>
                          </div>

                          <div>
                            <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                              Template Type
                            </label>
                            <div className="mt-1">
                              <select
                                id="type"
                                {...register('type', { required: 'Template type is required' })}
                                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                              >
                                <option value="annual_returns">Annual Returns</option>
                                <option value="remittance_schedule">Remittance Schedule</option>
                                <option value="withholding_tax">Withholding Tax</option>
                              </select>
                              {errors.type && (
                                <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
                              )}
                            </div>
                          </div>

                          <div>
                            <label htmlFor="version" className="block text-sm font-medium text-gray-700">
                              Version
                            </label>
                            <div className="mt-1">
                              <input
                                type="text"
                                id="version"
                                {...register('version', { required: 'Version is required' })}
                                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                              />
                              {errors.version && (
                                <p className="mt-1 text-sm text-red-600">{errors.version.message}</p>
                              )}
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Template File
                            </label>
                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                              <div className="space-y-1 text-center">
                                {selectedFile ? (
                                  <div className="flex flex-col items-center">
                                    <FileText size={36} className="text-green-500" />
                                    <p className="text-sm text-gray-700 mt-2">{selectedFile.name}</p>
                                    <button
                                      type="button"
                                      onClick={() => setSelectedFile(null)}
                                      className="mt-2 inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                    >
                                      <X size={12} className="mr-1" />
                                      Remove
                                    </button>
                                  </div>
                                ) : (
                                  <>
                                    <Plus size={36} className="mx-auto text-gray-400" />
                                    <div className="flex text-sm text-gray-600">
                                      <label
                                        htmlFor="file-upload"
                                        className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                                      >
                                        <span>Upload a file</span>
                                        <input
                                          id="file-upload"
                                          name="file-upload"
                                          type="file"
                                          className="sr-only"
                                          onChange={handleFileChange}
                                          accept=".xlsx,.xls,.doc,.docx,.pdf"
                                        />
                                      </label>
                                      <p className="pl-1">or drag and drop</p>
                                    </div>
                                    <p className="text-xs text-gray-500">
                                      Excel, Word, or PDF up to 10MB
                                    </p>
                                  </>
                                )}
                              </div>
                            </div>
                            {!selectedFile && (
                              <p className="mt-1 text-sm text-red-600">Please select a template file</p>
                            )}
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleSubmit(onSubmit)}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Upload Template
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <Trash2 size={20} className="text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Delete Template</h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete the template "{templateToDelete?.name}"? This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleDeleteTemplate}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Delete
                </button>
                <button
                  type="button"
                  onClick={closeDeleteModal}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageTemplates;