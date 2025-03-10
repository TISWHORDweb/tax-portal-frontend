import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  ClipboardList, 
  Search, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  Download,
  ChevronLeft,
  ChevronRight,
  FileText,
  X
} from 'lucide-react';
import { baseURL } from "../../Utils/Network";

interface Submission {
  _id: string;
  userId: {
    _id: string;
    name: string;
    nstin: string;
    email: string;
  };
  templateType: string;
  taxPeriod: string;
  mainFileUrl: string;
  supportingDocUrl: string;
  comments: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  reviewComments?: string;
}

const ReviewSubmissions: React.FC = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);
  const [currentSubmission, setCurrentSubmission] = useState<Submission | null>(null);
  const [reviewComment, setReviewComment] = useState<string>('');
  
  const fetchSubmissions = async (page = 1, search = '', status = 'all') => {
    try {
      setLoading(true);
      const response = await axios.get(`${baseURL}/admin/submissions?page=${page}&search=${search}&status=${status}`);
      setSubmissions(response.data.submissions);
      setTotalPages(response.data.totalPages);
      setCurrentPage(response.data.currentPage);
    } catch (error) {
      toast.error('Failed to fetch submissions. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions(currentPage, searchTerm, statusFilter);
  }, [currentPage, statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchSubmissions(1, searchTerm, statusFilter);
  };

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const openViewModal = (submission: Submission) => {
    setCurrentSubmission(submission);
    setReviewComment(submission.reviewComments || '');
    setIsViewModalOpen(true);
  };

  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setCurrentSubmission(null);
    setReviewComment('');
  };

  const handleApprove = async () => {
    if (!currentSubmission) return;
    
    try {
      await axios.put(`${baseURL}/admin/submissions/${currentSubmission._id}/approve`, {
        reviewComments: reviewComment
      });
      
      toast.success('Submission approved successfully!');
      fetchSubmissions(currentPage, searchTerm, statusFilter);
      closeViewModal();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to approve submission. Please try again.');
    }
  };

  const handleReject = async () => {
    if (!currentSubmission) return;
    
    if (!reviewComment.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    
    try {
      await axios.put(`${baseURL}/admin/submissions/${currentSubmission._id}/reject`, {
        reviewComments: reviewComment
      });
      
      toast.success('Submission rejected successfully!');
      fetchSubmissions(currentPage, searchTerm, statusFilter);
      closeViewModal();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reject submission. Please try again.');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle size={20} className="text-green-500" />;
      case 'rejected':
        return <XCircle size={20} className="text-red-500" />;
      default:
        return <Clock size={20} className="text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
            Rejected
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
            Pending
          </span>
        );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTaxPeriod = (period: string) => {
    const date = new Date(period);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Review Submissions</h1>
        <p className="text-gray-600">
          Review and process user tax return submissions
        </p>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between">
          <h2 className="text-lg font-medium text-gray-900 mb-4 md:mb-0">Submissions</h2>
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
            <select
              value={statusFilter}
              onChange={handleStatusFilterChange}
              className="block w-full md:w-auto pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <form onSubmit={handleSearch} className="flex">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={16} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by NSTIN or name..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <button
                type="submit"
                className="ml-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Search
              </button>
            </form>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      User
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Template Type
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Tax Period
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Submitted
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {submissions.length > 0 ? (
                    submissions.map((submission) => (
                      <tr key={submission._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {submission.userId.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {submission.userId.nstin}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{submission.templateType}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatTaxPeriod(submission.taxPeriod)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatDate(submission.submittedAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getStatusIcon(submission.status)}
                            <span className="ml-1.5">{getStatusBadge(submission.status)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => openViewModal(submission)}
                            className="text-green-600 hover:text-blue-900"
                          >
                            <Eye size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                        No submissions found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing page <span className="font-medium">{currentPage}</span> of{' '}
                      <span className="font-medium">{totalPages}</span>
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <span className="sr-only">Previous</span>
                        <ChevronLeft size={16} />
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            page === currentPage
                              ? 'z-10 bg-blue-50 border-blue-500 text-green-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <span className="sr-only">Next</span>
                        <ChevronRight size={16} />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* View Submission Modal */}
      {isViewModalOpen && currentSubmission && (
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
                    <ClipboardList size={20} className="text-green-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Submission Details
                      </h3>
                      <div>{getStatusBadge(currentSubmission.status)}</div>
                    </div>
                    <div className="mt-4 border-t border-gray-200 pt-4">
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-500">User Information</h4>
                        <p className="mt-1 text-sm text-gray-900">{currentSubmission.userId.name}</p>
                        <p className="text-sm text-gray-600">NSTIN: {currentSubmission.userId.nstin}</p>
                        <p className="text-sm text-gray-600">Email: {currentSubmission.userId.email}</p>
                      </div>
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-500">Submission Information</h4>
                        <p className="mt-1 text-sm text-gray-900">
                          <span className="font-medium">Template Type:</span> {currentSubmission.templateType}
                        </p>
                        <p className="text-sm text-gray-900">
                          <span className="font-medium">Tax Period:</span> {formatTaxPeriod(currentSubmission.taxPeriod)}
                        </p>
                        <p className="text-sm text-gray-900">
                          <span className="font-medium">Submitted:</span> {formatDate(currentSubmission.submittedAt)}
                        </p>
                        {currentSubmission.reviewedAt && (
                          <p className="text-sm text-gray-900">
                            <span className="font-medium">Reviewed:</span> {formatDate(currentSubmission.reviewedAt)}
                          </p>
                        )}
                      </div>
                      {currentSubmission.comments && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-500">User Comments</h4>
                          <p className="mt-1 text-sm text-gray-900">{currentSubmission.comments}</p>
                        </div>
                      )}
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-500">Files</h4>
                        <div className="mt-2 space-y-2">
                          <a
                            href={currentSubmission.mainFileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center p-2 border border-gray-300 rounded-md hover:bg-gray-50"
                          >
                            <FileText size={16} className="text-green-500 mr-2" />
                            <span className="text-sm text-gray-900">Main Template File</span>
                            <Download size={16} className="text-gray-500 ml-auto" />
                          </a>
                            <a
                              href={currentSubmission.supportingDocUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center p-2 border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                              <FileText size={16} className="text-green-500 mr-2" />
                              <span className="text-sm text-gray-900 truncate">Support File</span>
                              <Download size={16} className="text-gray-500 ml-auto" />
                            </a>
                        </div>
                      </div>
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-500">Review Comments</h4>
                        <textarea
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          rows={3}
                          className="shadow-sm focus:ring-blue-500 focus:border-blue-500 mt-1 block w-full sm:text-sm border-gray-300 rounded-md"
                          placeholder="Add your review comments here..."
                          disabled={currentSubmission.status !== 'pending'}
                        ></textarea>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                {currentSubmission.status === 'pending' ? (
                  <>
                    <button
                      type="button"
                      onClick={handleApprove}
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      <CheckCircle size={16} className="mr-2" />
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={handleReject}
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      <XCircle size={16} className="mr-2" />
                      Reject
                    </button>
                  </>
                ) : null}
                <button
                  type="button"
                  onClick={closeViewModal}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewSubmissions;