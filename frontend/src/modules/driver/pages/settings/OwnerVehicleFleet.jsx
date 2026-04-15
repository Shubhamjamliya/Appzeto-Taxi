import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Bike,
  Car,
  Edit3,
  LoaderCircle,
  Plus,
  Trash2,
  Truck,
  X,
  AlertCircle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  getCurrentDriver,
  getDriverVehicleTypes,
  updateDriverVehicle,
  deleteDriverVehicle,
} from '../../services/registrationService';
import { useImageUpload } from '../../../../shared/hooks/useImageUpload';

const unwrap = (response) => response?.data?.data || response?.data || response;

const getVehicleTypes = (response) => {
  const data = unwrap(response);
  return data?.vehicle_types || data?.results || (Array.isArray(data) ? data : []);
};

const getTypeLabel = (type) => type?.name || type?.vehicle_type || type?.label || 'Vehicle';

const iconFor = (iconType = '') => {
  const value = String(iconType).toLowerCase();
  if (value.includes('bike')) return Bike;
  if (value.includes('truck') || value.includes('hcv') || value.includes('lcv') || value.includes('mcv')) {
    return Truck;
  }
  return Car;
};

const OwnerVehicleFleet = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [formData, setFormData] = useState({
    vehicleTypeId: '',
    vehicleMake: '',
    vehicleModel: '',
    vehicleNumber: '',
    vehicleColor: '',
    vehicleImage: '',
  });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const {
    uploading: imageUploading,
    preview: imagePreview,
    handleFileChange: onVehicleImageChange,
    setPreview: setVehicleImagePreview,
  } = useImageUpload({
    folder: 'driver-vehicles',
    onSuccess: (url) => {
      setFormData((prev) => ({ ...prev, vehicleImage: url }));
    },
  });

  useEffect(() => {
    let active = true;

    const load = async () => {
      setIsLoading(true);
      setMessage('');

      try {
        const [driverResponse, typeResponse] = await Promise.all([
          getCurrentDriver(),
          getDriverVehicleTypes(),
        ]);

        if (!active) return;

        const driver = unwrap(driverResponse);
        const types = getVehicleTypes(typeResponse);

        setVehicleTypes(types);
        
        // Get all vehicles - for now we'll show the primary vehicle
        // In a real system, you'd have a separate API endpoint for all owner vehicles
        if (driver?.vehicleNumber) {
          setVehicles([
            {
              _id: driver._id,
              vehicleTypeId: driver.vehicleTypeId,
              vehicleMake: driver.vehicleMake,
              vehicleModel: driver.vehicleModel,
              vehicleNumber: driver.vehicleNumber,
              vehicleColor: driver.vehicleColor,
              vehicleImage: driver.vehicleImage,
              isPrimary: true,
            },
          ]);
        }
      } catch (error) {
        if (active) {
          setMessage(error.message || 'Could not load vehicles.');
          setMessageType('error');
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    load();
    return () => {
      active = false;
    };
  }, []);

  const selectedType = useMemo(() => {
    return vehicleTypes.find((type) => String(type._id || type.id) === String(formData.vehicleTypeId));
  }, [formData.vehicleTypeId, vehicleTypes]);

  const ActiveIcon = iconFor(selectedType?.icon_types || selectedType?.name);

  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      vehicleTypeId: String(vehicle.vehicleTypeId?._id || vehicle.vehicleTypeId || ''),
      vehicleMake: vehicle.vehicleMake || '',
      vehicleModel: vehicle.vehicleModel || '',
      vehicleNumber: vehicle.vehicleNumber || '',
      vehicleColor: vehicle.vehicleColor || '',
      vehicleImage: vehicle.vehicleImage || '',
    });
    setVehicleImagePreview(vehicle.vehicleImage || null);
    setIsEditing(true);
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.vehicleTypeId) {
      setMessage('Select a vehicle type first.');
      setMessageType('error');
      return;
    }

    setIsSaving(true);
    setMessage('');

    try {
      const response = await updateDriverVehicle(formData);
      const updated = unwrap(response);

      // Update the vehicle in the list
      setVehicles((prev) =>
        prev.map((v) =>
          v._id === editingVehicle._id
            ? {
                ...v,
                vehicleTypeId: updated.vehicleTypeId,
                vehicleMake: updated.vehicleMake,
                vehicleModel: updated.vehicleModel,
                vehicleNumber: updated.vehicleNumber,
                vehicleColor: updated.vehicleColor,
                vehicleImage: updated.vehicleImage,
              }
            : v
        )
      );

      setIsEditing(false);
      setEditingVehicle(null);
      setMessage('Vehicle updated successfully.');
      setMessageType('success');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.message || 'Could not update vehicle.');
      setMessageType('error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (vehicle) => {
    setDeleteConfirm(null);
    
    if (vehicles.length === 1) {
      setMessage('Cannot delete the last vehicle. Add another vehicle first.');
      setMessageType('error');
      return;
    }

    try {
      await deleteDriverVehicle(vehicle._id);
      setVehicles((prev) => prev.filter((v) => v._id !== vehicle._id));
      setMessage('Vehicle deleted successfully.');
      setMessageType('success');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.message || 'Could not delete vehicle.');
      setMessageType('error');
    }
  };

  const handleAddVehicle = () => {
    navigate('/taxi/driver/add-vehicle');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoaderCircle size={32} className="animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans p-6 lg:p-8 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate('/taxi/driver/profile')}
          className="w-10 h-10 bg-white rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft size={20} className="text-gray-700" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">My Vehicles</h1>
          <p className="text-sm text-gray-600 mt-1">Manage your vehicle fleet</p>
        </div>
        <button
          onClick={handleAddVehicle}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
        >
          <Plus size={18} />
          Add Vehicle
        </button>
      </div>

      {/* Message Alert */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={`mb-6 p-4 rounded-lg border flex items-center gap-3 ${
            messageType === 'error'
              ? 'bg-red-50 border-red-200 text-red-700'
              : 'bg-green-50 border-green-200 text-green-700'
          }`}
        >
          <AlertCircle size={18} />
          <p className="text-sm font-medium">{message}</p>
        </motion.div>
      )}

      {/* Vehicles Grid */}
      {vehicles.length === 0 ? (
        <div className="text-center py-20">
          <Car size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No vehicles yet</h3>
          <p className="text-gray-600 mb-6">Add your first vehicle to get started</p>
          <button
            onClick={handleAddVehicle}
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            <Plus size={18} />
            Add Vehicle
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((vehicle) => {
            const VehicleIcon = iconFor(vehicleTypes.find(
              (t) => String(t._id || t.id) === String(vehicle.vehicleTypeId?._id || vehicle.vehicleTypeId)
            )?.icon_types || 'car');

            const vehicleTypeLabel = getTypeLabel(
              vehicleTypes.find(
                (t) => String(t._id || t.id) === String(vehicle.vehicleTypeId?._id || vehicle.vehicleTypeId)
              )
            );

            return (
              <motion.div
                key={vehicle._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow"
              >
                {/* Vehicle Image/Icon */}
                <div className="mb-4 h-32 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg flex items-center justify-center border border-indigo-100">
                  {vehicle.vehicleImage ? (
                    <img
                      src={vehicle.vehicleImage}
                      alt={vehicle.vehicleNumber}
                      className="h-full w-full object-cover rounded-lg"
                    />
                  ) : (
                    <VehicleIcon size={48} className="text-indigo-400" />
                  )}
                </div>

                {/* Vehicle Info */}
                <div className="space-y-3 mb-5 border-b border-gray-100 pb-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                      {vehicleTypeLabel}
                    </p>
                    <h3 className="text-lg font-bold text-gray-900">
                      {vehicle.vehicleMake} {vehicle.vehicleModel}
                    </h3>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-600">
                      <span className="text-gray-500">Plate: </span>
                      {vehicle.vehicleNumber}
                    </p>
                    <p className="text-sm font-medium text-gray-600">
                      <span className="text-gray-500">Color: </span>
                      {vehicle.vehicleColor}
                    </p>
                  </div>

                  {vehicle.isPrimary && (
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
                      <div className="w-2 h-2 rounded-full bg-emerald-600" />
                      Primary
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => handleEdit(vehicle)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-50 text-indigo-600 rounded-lg font-medium hover:bg-indigo-100 transition-colors"
                  >
                    <Edit3 size={16} />
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(vehicle)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-colors"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Edit Modal */}
      <AnimatePresence>
        {isEditing && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditing(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-[2.5rem] p-6 pb-10 shadow-2xl max-w-lg mx-auto space-y-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between sticky -top-6 bg-white pb-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Edit Vehicle</p>
                  <h2 className="text-2xl font-bold text-gray-900">Update Details</h2>
                </div>
                <button
                  onClick={() => setIsEditing(false)}
                  className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  <X size={22} />
                </button>
              </div>

              <div className="space-y-4">
                {/* Vehicle Type Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider pl-1">
                    Vehicle Type
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {vehicleTypes.map((type) => {
                      const id = String(type._id || type.id);
                      const TypeIcon = iconFor(type.icon_types || type.name);
                      const selected = String(formData.vehicleTypeId) === id;

                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => handleChange('vehicleTypeId', id)}
                          className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl transition-all min-h-[90px] border-2 ${
                            selected
                              ? 'bg-indigo-50 border-indigo-600 text-indigo-600'
                              : 'bg-gray-50 border-gray-200 text-gray-400 hover:border-gray-300'
                          }`}
                        >
                          <TypeIcon size={24} />
                          <span className="text-xs font-bold uppercase tracking-wider text-center">
                            {getTypeLabel(type)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Make & Model */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg focus-within:border-indigo-500 transition-colors">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
                      Make
                    </label>
                    <input
                      value={formData.vehicleMake}
                      onChange={(e) => handleChange('vehicleMake', e.target.value)}
                      placeholder="e.g. Suzuki"
                      className="w-full bg-transparent border-none p-0 text-sm font-medium text-gray-900 focus:outline-none placeholder:text-gray-400"
                    />
                  </div>
                  <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg focus-within:border-indigo-500 transition-colors">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
                      Model
                    </label>
                    <input
                      value={formData.vehicleModel}
                      onChange={(e) => handleChange('vehicleModel', e.target.value)}
                      placeholder="e.g. WagonR"
                      className="w-full bg-transparent border-none p-0 text-sm font-medium text-gray-900 focus:outline-none placeholder:text-gray-400"
                    />
                  </div>
                </div>

                {/* Plate Number */}
                <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg focus-within:border-indigo-500 transition-colors">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
                    Plate Number
                  </label>
                  <input
                    value={formData.vehicleNumber}
                    onChange={(e) => handleChange('vehicleNumber', e.target.value.toUpperCase())}
                    placeholder="e.g. MP 09 AB 1234"
                    className="w-full bg-transparent border-none p-0 text-sm font-medium text-gray-900 focus:outline-none placeholder:text-gray-400 uppercase"
                  />
                </div>

                {/* Color */}
                <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg focus-within:border-indigo-500 transition-colors">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
                    Color
                  </label>
                  <input
                    value={formData.vehicleColor}
                    onChange={(e) => handleChange('vehicleColor', e.target.value)}
                    placeholder="e.g. White, Black"
                    className="w-full bg-transparent border-none p-0 text-sm font-medium text-gray-900 focus:outline-none placeholder:text-gray-400"
                  />
                </div>

                {/* Vehicle Image */}
                <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-3">
                    Vehicle Image
                  </label>
                  <div className="flex items-center gap-3">
                    {imagePreview ? (
                      <div className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200">
                        <Car size={28} className="text-gray-400" />
                      </div>
                    )}
                    <label className="flex-1 cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={onVehicleImageChange}
                        disabled={imageUploading}
                        className="hidden"
                      />
                      <div className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg text-center hover:bg-indigo-700 transition-colors disabled:opacity-50">
                        {imageUploading ? 'Uploading...' : 'Upload Image'}
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-900 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirm(null)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl"
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
                <AlertCircle size={24} className="text-red-600" />
              </div>
              <h3 className="text-center text-lg font-bold text-gray-900 mb-2">Delete Vehicle?</h3>
              <p className="text-center text-gray-600 mb-6">
                Are you sure you want to delete{' '}
                <span className="font-semibold">
                  {deleteConfirm.vehicleMake} {deleteConfirm.vehicleModel}
                </span>
                ? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-900 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OwnerVehicleFleet;
