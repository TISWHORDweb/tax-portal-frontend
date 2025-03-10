import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { FileDown, Upload, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { baseURL } from '../../Utils/network';

interface Submission {
  _id: string;
  templateType: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
}

const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const [recentSubmissions, setRecentSubmissions] = useState<Submission[]>([]);
  const [availableTemplates, setAvailableTemplates] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch recent submissions
        const submissionsResponse = await axios.get(`${baseURL}/submissions/recent`);
        setRecentSubmissions(submissionsResponse.data);
        
        // Fetch available templates count
        const templatesResponse = await axios.get(`${baseURL}/templates/count`);
        setAvailableTemplates(templatesResponse.data.count);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle size={20} className="text-green-500" />;
      case 'rejected':
        return <AlertCircle size={20} className="text-red-500" />;
      default:
        return <Clock size={20} className="text-yellow-500" />;
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
        <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.name}</h1>
        <p className="text-gray-600">NSTIN: {user?.nstin}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 mr-4">
              <FileDown size={24} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Available Templates</p>
              <p className="text-xl font-semibold">{availableTemplates}</p>
            </div>
          </div>
          <div className="mt-4">
            <Link
              to="/user/templates"
              className="text-green-600 hover:text-blue-800 text-sm font-medium"
            >
              Download templates →
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 mr-4">
              <Upload size={24} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Submit Returns</p>
              <p className="text-xl font-semibold">File Now</p>
            </div>
          </div>
          <div className="mt-4">
            <Link
              to="/user/submit"
              className="text-green-600 hover:text-green-800 text-sm font-medium"
            >
              Submit returns →
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 mr-4">
              <Clock size={24} className="text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Recent Submissions</p>
              <p className="text-xl font-semibold">{recentSubmissions.length}</p>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-purple-600 text-sm font-medium">
              {recentSubmissions.length > 0 ? 'See below for details' : 'No recent submissions'}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Recent Submissions</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {recentSubmissions.length > 0 ? (
            recentSubmissions.map((submission) => (
              <div key={submission._id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {getStatusIcon(submission.status)}
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{submission.templateType}</p>
                      <p className="text-sm text-gray-500">
                        Submitted on {new Date(submission.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        submission.status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : submission.status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-4 text-center text-gray-500">
              <p>No submissions found. Start by downloading templates and submitting your returns.</p>
              <Link
                to="/user/templates"
                className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Download Templates
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;