import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Upload, X, FileText, Plus, CheckCircle } from 'lucide-react';
import { baseURL } from "../../Utils/network.tsx";

interface SubmitFormData {
  templateType: string;
  taxPeriod: string;
  comments: string;
}

interface Template {
  _id: string;
  name: string;
  type: string;
}

const SubmitReturns: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [mainFile, setMainFile] = useState<File | null>(null);
  const [supportingDoc, setSupportingDoc] = useState<File | null>(null); // Single file
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<SubmitFormData>();

  useEffect(() => {
    const fetchTemplateTypes = async () => {
      try {
        const response = await axios.get(`${baseURL}/templates/types`);
        setTemplates(response.data);
      } catch (error) {
        toast.error('Failed to fetch template types. Please try again later.');
      }
    };

    fetchTemplateTypes();
  }, []);

  const handleMainFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setMainFile(e.target.files[0]);
    }
  };

  const handleSupportingDocChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSupportingDoc(e.target.files[0]); // Set single file
    }
  };

  const removeSupportingDoc = () => {
    setSupportingDoc(null); // Clear the file
  };

  const onSubmit = async (data: SubmitFormData) => {
    if (!mainFile) {
      toast.error('Please upload your completed template file');
      return;
    }

    try {
      setIsSubmitting(true);

      // Create form data for file upload
      const formData = new FormData();
      formData.append('templateType', data.templateType);
      formData.append('taxPeriod', data.taxPeriod);
      formData.append('comments', data.comments);
      formData.append('mainFile', mainFile);
      if (supportingDoc) {
        formData.append('supportingDoc', supportingDoc); // Append only if file exists
      }

      // Submit the form
      await axios.post(`${baseURL}/submissions`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Reset form and show success message
      setSubmitSuccess(true);
      reset();
      setMainFile(null);
      setSupportingDoc(null);

      toast.success('Your tax return has been submitted successfully!');

      // Reset success message after 5 seconds
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 5000);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit your return. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
          <CheckCircle className="h-6 w-6 text-green-600" />
        </div>
        <h3 className="mt-4 text-lg font-medium text-gray-900">Submission Successful!</h3>
        <p className="mt-2 text-sm text-gray-500">
          Your tax return has been submitted successfully. You can track the status of your submission on the dashboard.
        </p>
        <div className="mt-6">
          <button
            onClick={() => setSubmitSuccess(false)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Submit Another Return
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Submit Tax Returns</h1>
        <p className="text-gray-600">
          Upload your completed templates and supporting documents
        </p>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Return Submission Form</h2>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          <div className="grid grid-cols-1 gap-6 mb-6">
          <div>
              <label htmlFor="templateType" className="block text-sm font-medium text-gray-700 mb-1">
                Template Type *
              </label>
              <select
                id="templateType"
                {...register('templateType', { required: 'Template type is required' })}
                className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md ${errors.templateType ? 'border-red-300' : ''
                  }`}
              >
                <option value="">Select a template type</option>
                {templates.map((template) => (
                  <option key={template._id} value={template.type}>
                    {template.name}
                  </option>
                ))}
              </select>
              {errors.templateType && (
                <p className="mt-1 text-sm text-red-600">{errors.templateType.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="taxPeriod" className="block text-sm font-medium text-gray-700 mb-1">
                Tax Period *
              </label>
              <input
                type="month"
                id="taxPeriod"
                {...register('taxPeriod', { required: 'Tax period is required' })}
                className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${errors.taxPeriod ? 'border-red-300' : ''
                  }`}
              />
              {errors.taxPeriod && (
                <p className="mt-1 text-sm text-red-600">{errors.taxPeriod.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="mainFile" className="block text-sm font-medium text-gray-700 mb-1">
                Upload Completed Template *
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <FileText className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="mainFile"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                    >
                      <span>Upload a file</span>
                      <input
                        id="mainFile"
                        name="mainFile"
                        type="file"
                        className="sr-only"
                        onChange={handleMainFileChange}
                        accept=".xlsx,.xls,.doc,.docx,.pdf"
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    Excel, Word, or PDF up to 10MB
                  </p>
                </div>
              </div>
              {mainFile && (
                <div className="mt-2 flex items-center justify-between bg-blue-50 p-2 rounded-md">
                  <span className="text-sm text-blue-700 truncate">{mainFile.name}</span>
                  <button
                    type="button"
                    onClick={() => setMainFile(null)}
                    className="text-green-500 hover:text-blue-700"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
              {!mainFile && (
                <p className="mt-1 text-sm text-red-600">Please upload your completed template</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Supporting Document (Optional)
              </label>
              <div className="mt-1">
                <div className="flex items-center justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <Plus className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="supportingDoc"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                      >
                        <span>Add a supporting document</span>
                        <input
                          id="supportingDoc"
                          name="supportingDoc"
                          type="file"
                          className="sr-only"
                          onChange={handleSupportingDocChange}
                          accept=".xlsx,.xls,.doc,.docx,.pdf,.jpg,.jpeg,.png"
                        />
                      </label>
                    </div>
                    <p className="text-xs text-gray-500">
                      Excel, Word, PDF, or images up to 10MB
                    </p>
                  </div>
                </div>
              </div>
              {supportingDoc && (
                <div className="mt-2 flex items-center justify-between bg-gray-50 p-2 rounded-md">
                  <span className="text-sm text-gray-700 truncate">{supportingDoc.name}</span>
                  <button
                    type="button"
                    onClick={removeSupportingDoc}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="comments" className="block text-sm font-medium text-gray-700 mb-1">
                Additional Comments
              </label>
              <textarea
                id="comments"
                {...register('comments')}
                rows={3}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 mt-1 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="Any additional information you'd like to provide"
              ></textarea>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-md mb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Important Notes:</h3>
            <ul className="list-disc pl-5 text-xs text-gray-500 space-y-1">
              <li>Ensure all information in your template is accurate and complete</li>
              <li>Supporting documents should be clear and legible</li>
              <li>Large files may take longer to upload</li>
              <li>You will receive a confirmation once your submission is processed</li>
            </ul>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || !mainFile}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-green-300"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Upload size={16} className="mr-2" />
                  Submit Return
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmitReturns;