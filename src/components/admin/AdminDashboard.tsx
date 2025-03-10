import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Users, FileText, ClipboardList, ArrowUpRight, BarChart2 } from 'lucide-react';
import { baseURL } from "../../Utils/network.tsx";


interface DashboardStats {
  totalUsers: number;
  totalTemplates: number;
  pendingSubmissions: number;
  recentSubmissions: {
    _id: string;
    nstin: string;
    userName: string;
    templateType: string;
    status: string;
    submittedAt: string;
  }[];
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${baseURL}/admin/dashboard`);
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

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
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user?.name}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 mr-4">
              <Users size={24} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-xl font-semibold">{stats?.totalUsers || 0}</p>
            </div>
          </div>
          <div className="mt-4">
            <Link
              to="/admin/users"
              className="text-green-600 hover:text-blue-800 text-sm font-medium flex items-center"
            >
              Manage Users
              <ArrowUpRight size={16} className="ml-1" />
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 mr-4">
              <FileText size={24} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Templates</p>
              <p className="text-xl font-semibold">{stats?.totalTemplates || 0}</p>
            </div>
          </div>
          <div className="mt-4">
            <Link
              to="/admin/templates"
              className="text-green-600 hover:text-green-800 text-sm font-medium flex items-center"
            >
              Manage Templates
              <ArrowUpRight size={16} className="ml-1" />
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 mr-4">
              <ClipboardList size={24} className="text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pending Submissions</p>
              <p className="text-xl font-semibold">{stats?.pendingSubmissions || 0}</p>
            </div>
          </div>
          <div className="mt-4">
            <Link
              to="/admin/submissions"
              className="text-yellow-600 hover:text-yellow-800 text-sm font-medium flex items-center"
            >
              Review Submissions
              <ArrowUpRight size={16} className="ml-1" />
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Recent Submissions</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {stats?.recentSubmissions && stats.recentSubmissions.length > 0 ? (
              stats.recentSubmissions.map((submission) => (
                <div key={submission._id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{submission.userName}</p>
                      <p className="text-xs text-gray-500">NSTIN: {submission.nstin}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(submission.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-700">{submission.templateType}</span>
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
                <p>No recent submissions found.</p>
              </div>
            )}
          </div>
          {stats?.recentSubmissions && stats.recentSubmissions.length > 0 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <Link
                to="/admin/submissions"
                className="text-green-600 hover:text-blue-800 text-sm font-medium flex items-center justify-center"
              >
                View All Submissions
                <ArrowUpRight size={16} className="ml-1" />
              </Link>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">System Overview</h2>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-center h-48">
              <BarChart2 size={120} className="text-gray-300" />
            </div>
            <div className="text-center text-gray-500 mt-4">
              <p>Detailed analytics will be available soon.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-blue-800 mb-2">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/admin/templates"
            className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-blue-100"
          >
            <div className="flex items-center">
              <FileText size={20} className="text-green-600 mr-2" />
              <span className="text-blue-800 font-medium">Upload New Template</span>
            </div>
          </Link>
          <Link
            to="/admin/users"
            className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-blue-100"
          >
            <div className="flex items-center">
              <Users size={20} className="text-green-600 mr-2" />
              <span className="text-blue-800 font-medium">Add New User</span>
            </div>
          </Link>
          <Link
            to="/admin/submissions"
            className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-blue-100"
          >
            <div className="flex items-center">
              <ClipboardList size={20} className="text-green-600 mr-2" />
              <span className="text-blue-800 font-medium">Review Pending Submissions</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;