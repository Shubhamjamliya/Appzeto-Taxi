import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  ChevronRight, 
  Edit2, 
  Trash2, 
  CreditCard,
  Save,
  X,
  Check,
  ChevronDown,
  Info,
  ShieldCheck,
  AlertCircle,
  GripVertical,
  Settings,
  Trash
} from 'lucide-react';

const PaymentMethods = () => {
  const [view, setView] = useState('list'); // 'list', 'edit', 'add'
  const [searchTerm, setSearchTerm] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const [methods, setMethods] = useState([
    { 
      id: 1, 
      name: 'account_transfer', 
      fields: ['account_holder_name', 'account_number', 'ifsc_code'], 
      status: true 
    }
  ]);

  const [formData, setFormData] = useState({
    methodName: 'account_transfer',
    fields: [
      { id: 1, type: 'Text', name: 'account_holder_name', placeholder: 'Enter Account Holder Name', isRequired: true },
      { id: 2, type: 'Number', name: 'account_number', placeholder: 'Enter Account Number', isRequired: true },
      { id: 3, type: 'Text', name: 'ifsc_code', placeholder: 'IFSC Code', isRequired: true }
    ]
  });

  const handleAddField = () => {
    const newId = formData.fields.length > 0 ? Math.max(...formData.fields.map(f => f.id)) + 1 : 1;
    setFormData({
      ...formData,
      fields: [...formData.fields, { id: newId, type: 'Text', name: '', placeholder: '', isRequired: false }]
    });
  };

  const handleRemoveField = (id) => {
    setFormData({
      ...formData,
      fields: formData.fields.filter(f => f.id !== id)
    });
  };

  const handleFieldChange = (id, key, value) => {
    setFormData({
      ...formData,
      fields: formData.fields.map(f => f.id === id ? { ...f, [key]: value } : f)
    });
  };

  const filteredMethods = methods.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (view === 'edit' || view === 'add') {
    return (
      <div className="space-y-8 p-1 animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans text-gray-950 max-w-7xl mx-auto pb-20">
        {/* HEADER */}
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-4">
              <button onClick={() => setView('list')} className="p-3 bg-white border border-gray-100 rounded-2xl hover:bg-gray-50 text-gray-400 hover:text-gray-950 transition-all shadow-sm">
                 <ArrowLeft size={20} />
              </button>
              <div>
                 <h1 className="text-xl font-black text-gray-900 tracking-tight uppercase leading-none mb-1.5">{view === 'edit' ? 'Edit Payment Method' : 'Add New Payment Method'}</h1>
                 <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    <span>Masters</span>
                    <ChevronRight size={10} />
                    <span>Payment Methods</span>
                    <ChevronRight size={10} />
                    <span className="text-indigo-600">Config</span>
                 </div>
              </div>
           </div>
           <button 
             onClick={handleAddField}
             className="bg-gray-950 text-white px-8 py-3.5 rounded-[24px] text-[13px] font-black flex items-center gap-3 hover:bg-black transition-all shadow-xl uppercase tracking-widest"
           >
              <Plus size={18} /> Add New Field
           </button>
        </div>

        {/* METHOD NAME */}
        <div className="bg-white rounded-[40px] border border-gray-50 shadow-sm p-10">
           <div className="max-w-md space-y-2">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5 focus:outline-none">
                 Method Name <span className="text-rose-500">*</span>
              </label>
              <input 
                 type="text" 
                 value={formData.methodName}
                 onChange={(e) => setFormData({...formData, methodName: e.target.value})}
                 placeholder="e.g. account_transfer"
                 className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-[20px] text-[14px] font-bold focus:bg-white focus:border-indigo-100 outline-none transition-all shadow-inner"
              />
           </div>

           {/* DYNAMIC FIELDS LIST */}
           <div className="mt-12 space-y-4">
              {formData.fields.map((field, idx) => (
                 <div key={field.id} className="group relative bg-gray-50/50 rounded-[32px] border border-transparent hover:border-indigo-100 hover:bg-white transition-all p-8 flex flex-wrap lg:flex-nowrap items-end gap-6 shadow-sm hover:shadow-xl hover:scale-[1.01]">
                    {/* Delete Icon - Floating Right Top */}
                    <button 
                      onClick={() => handleRemoveField(field.id)}
                      className="absolute top-6 right-6 p-2 text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                    >
                       <Trash size={16} />
                    </button>

                    {/* Field Type */}
                    <div className="w-full lg:w-1/4 space-y-2">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Input Field Type</label>
                       <div className="relative">
                          <select 
                             value={field.type}
                             onChange={(e) => handleFieldChange(field.id, 'type', e.target.value)}
                             className="w-full px-6 py-3.5 bg-white border border-gray-100 rounded-2xl text-[13px] font-bold outline-none appearance-none cursor-pointer"
                          >
                             <option>Text</option>
                             <option>Number</option>
                             <option>Email</option>
                             <option>File</option>
                          </select>
                          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                       </div>
                    </div>

                    {/* Field Name */}
                    <div className="w-full lg:w-1/3 space-y-2">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Input Field Name</label>
                       <input 
                          type="text" 
                          value={field.name}
                          onChange={(e) => handleFieldChange(field.id, 'name', e.target.value)}
                          placeholder="e.g. account_number"
                          className="w-full px-6 py-3.5 bg-white border border-gray-100 rounded-2xl text-[13px] font-bold outline-none shadow-sm"
                       />
                    </div>

                    {/* Placeholder */}
                    <div className="w-full lg:flex-1 space-y-2">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Placeholder</label>
                       <input 
                          type="text" 
                          value={field.placeholder}
                          onChange={(e) => handleFieldChange(field.id, 'placeholder', e.target.value)}
                          placeholder="Enter placeholder text"
                          className="w-full px-6 py-3.5 bg-white border border-gray-100 rounded-2xl text-[13px] font-bold outline-none shadow-sm"
                       />
                    </div>

                    {/* Required Toggle */}
                    <div className="flex items-center gap-3 mb-3 shrink-0">
                       <label className="flex items-center gap-2 cursor-pointer">
                          <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${field.isRequired ? 'bg-indigo-600 border-indigo-600 shadow-lg shadow-indigo-100' : 'border-gray-200'}`}>
                             {field.isRequired && <Check size={12} className="text-white" strokeWidth={4} />}
                             <input type="checkbox" className="hidden" checked={field.isRequired} onChange={() => handleFieldChange(field.id, 'isRequired', !field.isRequired)} />
                          </div>
                          <span className="text-[11px] font-black uppercase tracking-widest text-gray-700">Is Required?</span>
                       </label>
                    </div>
                 </div>
              ))}
           </div>

           <div className="mt-12 pt-10 border-t border-gray-50 flex justify-end gap-4 italic font-black">
              <button onClick={() => setView('list')} className="px-10 py-4 border border-gray-100 rounded-[24px] text-[13px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-950 transition-all">Discard</button>
              <button 
                onClick={() => setView('list')}
                className="px-12 py-4 bg-indigo-600 text-white rounded-[24px] text-[13px] font-black uppercase tracking-[0.2em] hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-100 flex items-center gap-3"
              >
                 <Save size={18} /> Submit Config
              </button>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-1 animate-in fade-in duration-700 font-sans text-gray-950">
      {/* HEADER */}
      <div className="flex items-start justify-between">
         <div>
            <h1 className="text-4xl font-black tracking-tight text-gray-900 mb-2 leading-none uppercase tracking-tighter">Payment Methods</h1>
            <div className="flex items-center gap-2 text-[13px] font-bold text-gray-400">
               <span className="text-gray-950 uppercase tracking-widest leading-none italic">Settlement masters</span>
               <ChevronRight size={14} />
               <span className="uppercase tracking-widest leading-none">Configurations</span>
            </div>
         </div>
         <button 
            onClick={() => setView('add')}
            className="bg-indigo-600 text-white px-8 py-3.5 rounded-[24px] text-[13px] font-black flex items-center gap-3 hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-100 uppercase tracking-widest"
         >
            <Plus size={18} /> Add Method
         </button>
      </div>

      {/* TOOLBAR */}
      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden">
          <div className="flex items-center gap-3 text-[13px] font-black uppercase tracking-widest text-gray-400 italic">
            show 
            <select 
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(e.target.value)}
              className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-gray-950 font-black focus:outline-none focus:border-indigo-200 shadow-inner"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
            </select>
            entries
          </div>

          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
            <input 
               type="text" 
               placeholder="Search methods or fields..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent rounded-[20px] text-[13px] font-bold focus:bg-white focus:border-indigo-100 outline-none transition-all shadow-inner"
            />
          </div>
        </div>
      </div>

      {/* PAYMENT METHODS LIST */}
      <div className="bg-white rounded-[40px] border border-gray-50 shadow-sm overflow-hidden min-h-[500px]">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                <th className="px-10 py-6">Method</th>
                <th className="px-6 py-6">Fields</th>
                <th className="px-6 py-6 text-center w-32">Status</th>
                <th className="px-10 py-6 text-right w-28">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredMethods.map((m) => (
                <tr key={m.id} className="group hover:bg-indigo-50/10 transition-all duration-300">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-4">
                       <div className="p-2.5 bg-gray-100 rounded-xl text-indigo-500 group-hover:bg-gray-950 group-hover:text-white transition-all shadow-inner">
                          <CreditCard size={20} />
                       </div>
                       <p className="text-[17px] font-black text-gray-950 uppercase tracking-tighter leading-none italic">{m.name}</p>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                     <div className="flex flex-wrap gap-1.5 opacity-60">
                        {m.fields.map(f => (
                           <span key={f} className="text-[10px] font-black text-gray-500 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded uppercase tracking-widest">{f}</span>
                        ))}
                     </div>
                  </td>
                  <td className="px-6 py-6">
                     <div className="flex justify-center items-center">
                        <label className="relative inline-flex items-center cursor-pointer">
                           <input type="checkbox" className="sr-only peer" checked={m.status} onChange={() => {}} />
                           <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                        </label>
                     </div>
                  </td>
                  <td className="px-10 py-6 text-right">
                     <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => setView('edit')}
                          className="p-3 text-amber-500 hover:bg-amber-50 rounded-xl transition-all shadow-sm border border-transparent hover:border-amber-100"
                          title="Edit Configuration"
                        >
                           <Edit2 size={18} />
                        </button>
                        <button 
                          className="p-3 text-rose-500 hover:bg-rose-50 rounded-xl transition-all shadow-sm border border-transparent hover:border-rose-100"
                          title="Remove Method"
                        >
                           <Trash2 size={18} />
                        </button>
                     </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-8 border-t border-gray-50 bg-gray-50/20 text-center">
           <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest italic opacity-50">Industrial Grade Driver Settlement Config Enabled</p>
        </div>
      </div>

    </div>
  );
};

const ArrowLeft = ({ size }) => <ChevronRight size={size} className="rotate-180" />;

export default PaymentMethods;
