import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

// Define a type for the data prop
interface SystemOverviewProps {
  totalUsers: number;
  totalTemplates: number;
  pendingSubmissions: number;
}

const SystemOverview: React.FC<SystemOverviewProps> = ({ totalUsers, totalTemplates, pendingSubmissions }) => {
  // Prepare data for the chart
  const data = [
    { name: 'Total Users', value: totalUsers },
    { name: 'Total Templates', value: totalTemplates },
    { name: 'Pending Submissions', value: pendingSubmissions },
  ];

  // Custom colors for each bar
  const colors = ['#8884d8', '#82ca9d', '#ffc658'];

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">System Overview</h2>
      </div>
      <div className="p-6">
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <XAxis dataKey="name" tick={{ fill: '#4a5568' }} />
              <YAxis tick={{ fill: '#4a5568' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(19, 6, 6, 0.1)',
                }}
              />
              <Legend
                wrapperStyle={{
                  paddingTop: '20px',
                }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        {/* <div className="text-center text-gray-500 mt-4">
          <p>Detailed analytics will be available soon.</p>
        </div> */}
      </div>
    </div>
  );
};

export default SystemOverview;