import React from 'react';
import { ChevronDown, Filter, MoreVertical, Search } from 'lucide-react';

const ROWS = [
  ['REQ_177563864023', '8th Apr 02:27 PM', 'Deepak Sharma', 'Genzo Pilot Pune', 'Delivery - Parcel', 'COMPLETED', 'CASH'],
  ['REQ_177556660723', '7th Apr 06:26 PM', 'Rishi Dogne', 'Gojo', 'Delivery - Bike', 'COMPLETED', 'CASH'],
  ['REQ_17754669539', '6th Apr 02:45 PM', 'Rishi Dogne', 'ajay', 'Delivery - Parcel', 'COMPLETED', 'CASH'],
  ['REQ_177546207030', '6th Apr 01:24 PM', 'Rishi Dogne', 'driver', 'Delivery - Parcel', 'COMPLETED', 'CASH'],
  ['REQ_177546189441', '6th Apr 01:21 PM', 'Rishi Dogne', 'driver', 'Delivery - Parcel', 'COMPLETED', 'CASH'],
  ['REQ_177546069487', '6th Apr 01:01 PM', 'Rishi Dogne', 'driver', 'Delivery - Parcel', 'CANCELLED', 'CASH'],
  ['REQ_177545891739', '6th Apr 12:31 PM', 'Rishi Dogne', 'driver', 'Delivery - Parcel', 'COMPLETED', 'CASH'],
  ['REQ_177522036929', '3rd Apr 06:16 PM', 'John Mexton', 'Devid Mexton', 'Delivery - Parcel', 'COMPLETED', 'CASH'],
  ['REQ_177521511085', '3rd Apr 04:48 PM', 'John Mexton', '-----', 'Delivery - Bike', 'CANCELLED', 'CASH'],
];

const TABS = ['All', 'Completed', 'Cancelled', 'Upcoming', 'On Trip'];

const STATUS_STYLES = {
  COMPLETED: 'bg-[#17b8a6] text-white',
  CANCELLED: 'bg-[#f26a4b] text-white',
  UPCOMING: 'bg-[#f6b44f] text-white',
  ON_TRIP: 'bg-[#4e8df6] text-white',
};

const PAYMENT_STYLES = {
  CASH: 'bg-[#17b8a6] text-white',
  ONLINE: 'bg-[#4f46e5] text-white',
};

const normalizeTabKey = (value) => value.toUpperCase().replace(/\s+/g, '_');

const Deliveries = () => {
  const [activeTab, setActiveTab] = React.useState('All');
  const [pageSize, setPageSize] = React.useState('10');

  const filteredRows = React.useMemo(() => {
    if (activeTab === 'All') {
      return ROWS;
    }

    const tabKey = normalizeTabKey(activeTab);
    return ROWS.filter((row) => row[5] === tabKey);
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-gray-50 font-['Inter',system-ui,sans-serif]">
      <div className="overflow-hidden rounded-[22px] border border-gray-200 bg-white shadow-[0_10px_32px_rgba(17,24,39,0.05)]">
        <div className="border-b border-gray-200 px-5 py-5 lg:px-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <span className="font-medium">show</span>
              <div className="relative">
                <select
                  value={pageSize}
                  onChange={(event) => setPageSize(event.target.value)}
                  className="h-11 appearance-none rounded-md border border-gray-300 bg-white pl-4 pr-10 text-sm font-medium text-gray-700 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                </select>
                <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" />
              </div>
              <span className="font-medium">entries</span>
            </div>

            <div className="flex flex-wrap items-center gap-5 xl:flex-nowrap">
              <div className="flex flex-wrap items-center gap-8 border-b border-gray-200 xl:min-w-[840px]">
                {TABS.map((tab) => {
                  const isActive = activeTab === tab;
                  return (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveTab(tab)}
                      className={`relative pb-5 text-[14px] font-semibold tracking-tight transition ${
                        isActive ? 'text-[#4054b2]' : 'text-gray-900 hover:text-[#4054b2]'
                      }`}
                    >
                      {tab}
                      {isActive && <span className="absolute inset-x-0 bottom-0 h-[2px] rounded-full bg-[#4054b2]" />}
                    </button>
                  );
                })}
              </div>

              <div className="ml-auto flex items-center gap-3">
                <button
                  type="button"
                  className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-600 transition hover:border-gray-400 hover:text-gray-900"
                >
                  <Search size={18} strokeWidth={2.1} />
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-md bg-[#f26a4b] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#eb5e3d]"
                >
                  <Filter size={16} strokeWidth={2.2} />
                  Filters
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto px-5 py-5 lg:px-6">
          <table className="min-w-full border-separate border-spacing-0">
            <thead>
              <tr className="bg-[#f6f6f8]">
                {['Request Id', 'Date', 'User Name', 'Driver Name', 'Transport Type', 'Trip Status', 'Payment Option', 'Action'].map((heading, index, array) => (
                  <th
                    key={heading}
                    className={`px-4 py-4 text-left text-[14px] font-semibold text-gray-900 ${
                      index === 0 ? 'rounded-l-[10px]' : ''
                    } ${index === array.length - 1 ? 'rounded-r-[10px]' : ''}`}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filteredRows.map((row) => (
                <tr key={row[0]} className="group">
                  <td className="border-b border-gray-200 px-4 py-5 text-[14px] font-medium text-gray-900">{row[0]}</td>
                  <td className="border-b border-gray-200 px-4 py-5 text-[14px] font-medium text-gray-900">{row[1]}</td>
                  <td className="border-b border-gray-200 px-4 py-5 text-[14px] font-medium text-gray-900">{row[2]}</td>
                  <td className="border-b border-gray-200 px-4 py-5 text-[14px] font-medium text-gray-900">{row[3]}</td>
                  <td className="border-b border-gray-200 px-4 py-5 text-[14px] font-medium text-gray-900">{row[4]}</td>
                  <td className="border-b border-gray-200 px-4 py-5">
                    <span className={`inline-flex rounded-md px-3 py-1 text-[11px] font-bold uppercase leading-none ${STATUS_STYLES[row[5]] || 'bg-gray-200 text-gray-700'}`}>
                      {row[5].replace('_', ' ')}
                    </span>
                  </td>
                  <td className="border-b border-gray-200 px-4 py-5">
                    <span className={`inline-flex rounded-md px-3 py-1 text-[11px] font-bold uppercase leading-none ${PAYMENT_STYLES[row[6]] || 'bg-gray-200 text-gray-700'}`}>
                      {row[6]}
                    </span>
                  </td>
                  <td className="border-b border-gray-200 px-4 py-5">
                    <button type="button" className="inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-700">
                      <MoreVertical size={18} />
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

export default Deliveries;
