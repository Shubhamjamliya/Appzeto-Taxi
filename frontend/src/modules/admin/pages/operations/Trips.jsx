import React from 'react';
import { Filter, MoreVertical, Search } from 'lucide-react';

const STATUS_STYLES = {
  CANCELLED: 'bg-orange-500 text-white',
  COMPLETED: 'bg-teal-500 text-white',
  UPCOMING: 'bg-amber-400 text-white',
  ON_TRIP: 'bg-blue-500 text-white',
  ACCEPTED: 'bg-emerald-500 text-white',
};

const ROWS = [
  ['REQ_177571561595', '9th Apr 11:50 AM', 'Rishi', '----', 'Taxi - Taxi', 'CANCELLED', 'CASH'],
  ['REQ_17756704591', '8th Apr 11:17 PM', 'rohan', '----', 'Taxi - Bike', 'CANCELLED', 'CASH'],
  ['REQ_177541552426', '6th Apr 12:28 AM', 'Vikas Kumar Gupta', '----', 'Taxi - Bike', 'CANCELLED', 'CASH'],
  ['REQ_177539154127', '5th Apr 05:49 PM', 'Shreyash Jaiswal', '----', 'Taxi - Bike', 'CANCELLED', 'CASH'],
  ['REQ_177532595996', '4th Apr 11:35 PM', 'Rishi', '----', 'Taxi - Premium Car', 'CANCELLED', 'CASH'],
  ['REQ_177529243075', '4th Apr 02:17 PM', 'indradevi', '----', 'Taxi - Bike', 'CANCELLED', 'CASH'],
  ['REQ_177527202669', '4th Apr 08:37 AM', 'Vikas Kumar Gupta', '----', 'Taxi - Bike', 'CANCELLED', 'CASH'],
];

const TAB_SET = ['All', 'Completed', 'Cancelled', 'Upcoming', 'On Trip'];

const Trips = () => {
  const [activeTab, setActiveTab] = React.useState('All');

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-400">Ride Request</p>
          <h1 className="mt-1 text-[22px] font-black tracking-tight text-slate-900">INDEX</h1>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-[12px] font-black uppercase tracking-[0.2em] text-slate-600">
            <Search size={14} />
          </button>
          <button className="inline-flex items-center gap-2 rounded-full bg-[#f46b45] px-4 py-2 text-[12px] font-black uppercase tracking-[0.2em] text-white">
            <Filter size={14} />
            Filters
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-2 text-[12px] font-medium text-slate-500">
            <span>show</span>
            <select className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-[12px] font-medium text-slate-700 outline-none">
              <option>10</option>
              <option>25</option>
              <option>50</option>
            </select>
            <span>entries</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {TAB_SET.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative px-2 py-1 text-[13px] font-black text-slate-900 transition-all ${
                  activeTab === tab ? 'after:absolute after:left-0 after:-bottom-3 after:h-0.5 after:w-full after:bg-[#4054b2]' : 'opacity-80'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-0">
            <thead>
              <tr className="bg-slate-50 text-left">
                {['Request Id', 'Date', 'User Name', 'Driver Name', 'Transport Type', 'Trip Status', 'Payment Option', 'Action'].map((heading) => (
                  <th key={heading} className="border-b border-slate-200 px-4 py-4 text-[13px] font-black text-slate-900">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr key={row[0]} className="border-b border-slate-100 last:border-b-0">
                  <td className="px-4 py-5 text-[13px] font-medium text-slate-900">{row[0]}</td>
                  <td className="px-4 py-5 text-[13px] font-medium text-slate-900">{row[1]}</td>
                  <td className="px-4 py-5 text-[13px] font-medium text-slate-900">{row[2]}</td>
                  <td className="px-4 py-5 text-[13px] font-medium text-slate-900">{row[3]}</td>
                  <td className="px-4 py-5 text-[13px] font-medium text-slate-900">{row[4]}</td>
                  <td className="px-4 py-5">
                    <span className={`rounded px-2.5 py-1 text-[10px] font-black uppercase ${STATUS_STYLES[row[5]] || 'bg-slate-200 text-slate-700'}`}>
                      {row[5]}
                    </span>
                  </td>
                  <td className="px-4 py-5">
                    <span className="rounded px-2.5 py-1 text-[10px] font-black uppercase bg-orange-500 text-white">{row[6]}</span>
                  </td>
                  <td className="px-4 py-5">
                    <button className="text-slate-400 hover:text-slate-700">
                      <MoreVertical size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Trips;
