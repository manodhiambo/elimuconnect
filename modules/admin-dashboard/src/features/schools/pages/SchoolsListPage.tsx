import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Building2, Plus, X } from 'lucide-react';
import axiosInstance from '../../../lib/axios';
import toast from 'react-hot-toast';

export const SchoolsListPage: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    nemisCode: '',
    name: '',
    county: '',
    subCounty: '',
    principalName: '',
    principalContact: '',
    phoneNumber: '',
    email: '',
  });

  const queryClient = useQueryClient();

  const { data: schools, isLoading } = useQuery({
    queryKey: ['schools'],
    queryFn: async () => {
      const response = await axiosInstance.get('/api/admin/schools');
      return response.data.data?.content || [];
    },
  });

  const createSchoolMutation = useMutation({
    mutationFn: async (schoolData: typeof formData) => {
      const response = await axiosInstance.post('/api/admin/schools', schoolData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schools'] });
      toast.success('School added successfully');
      setShowModal(false);
      setFormData({
        nemisCode: '',
        name: '',
        county: '',
        subCounty: '',
        principalName: '',
        principalContact: '',
        phoneNumber: '',
        email: '',
      });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add school');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createSchoolMutation.mutate(formData);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Schools Management</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add School
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading schools...</div>
      ) : schools && schools.length > 0 ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">NEMIS Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">School Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">County</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Principal</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {schools.map((school: any) => (
                <tr key={school.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{school.nemisCode}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{school.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{school.county}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{school.principalName}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{school.phoneNumber}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No schools registered yet.</p>
          <p className="text-sm text-gray-500 mt-2">Click Add School to register your first school.</p>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Add New School</h2>
              <button onClick={() => setShowModal(false)}>
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">NEMIS Code</label>
                <input
                  type="text"
                  required
                  value={formData.nemisCode}
                  onChange={(e) => setFormData({ ...formData, nemisCode: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">School Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">County</label>
                <input
                  type="text"
                  required
                  value={formData.county}
                  onChange={(e) => setFormData({ ...formData, county: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sub County</label>
                <input
                  type="text"
                  value={formData.subCounty}
                  onChange={(e) => setFormData({ ...formData, subCounty: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Principal Name</label>
                <input
                  type="text"
                  required
                  value={formData.principalName}
                  onChange={(e) => setFormData({ ...formData, principalName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Principal Contact</label>
                <input
                  type="tel"
                  required
                  value={formData.principalContact}
                  onChange={(e) => setFormData({ ...formData, principalContact: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">School Phone</label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createSchoolMutation.isPending}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
                >
                  {createSchoolMutation.isPending ? 'Adding...' : 'Add School'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
