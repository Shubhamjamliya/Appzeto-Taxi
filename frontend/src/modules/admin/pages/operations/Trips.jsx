import React from 'react';
import { Filter, LoaderCircle, MoreVertical, Search } from 'lucide-react';
import { adminService } from '../../services/adminService';

const STATUS_STYLES = {
  CANCELLED: 'bg-orange-500 text-white',
  COMPLETED: 'bg-teal-500 text-white',
  UPCOMING: 'bg-amber-400 text-white',
  ON_TRIP: 'bg-blue-500 text-white',
  ACCEPTED: 'bg-emerald-500 text-white',
};

const TAB_SET = ['All', 'Completed', 'Cancelled', 'Upcoming', 'On Trip'];

const unwrapResults = (response) => {
  const payload = response?.data || response || {};
  return {
    results: payload?.results || [],
    paginator: payload?.paginator || {},
  };
};

const formatDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

const Trips = () => {
  const [activeTab, setActiveTab] = React.useState('All');
  const [pageSize, setPageSize] = React.useState('10');
  const [search, setSearch] = React.useState('');
  const [rows, setRows] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    let active = true;

    const loadTrips = async () => {
      setIsLoading(true);
      setError('');

      try {
        const response = await adminService.getTrips({
          page: 1,
          limit: Number(pageSize) || 10,
          tab: activeTab.toLowerCase(),
          search,
        });
        const data = unwrapResults(response);

        if (!active) return;

        setRows(data.results);
      } catch (loadError) {
        if (active) {
          setRows([]);
          setError(loadError?.message || 'Could not load intercity trips.');
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    loadTrips();

    return () => {
      active = false;
    };
  }, [activeTab, pageSize, search]);

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
            <select
              value={pageSize}
              onChange={(event) => setPageSize(event.target.value)}
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-[12px] font-medium text-slate-700 outline-none"
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
            <span>entries</span>
          </div>

          <div className="flex flex-wrap items-center gap-4">
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
            <div className="relative">
              <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search intercity trips"
                className="h-10 rounded-full border border-slate-200 bg-white pl-9 pr-4 text-[12px] font-medium text-slate-700 outline-none focus:border-indigo-400"
              />
            </div>
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
              {isLoading && (
                <tr>
                  <td colSpan={8} className="px-4 py-14 text-center">
                    <div className="inline-flex items-center gap-3 text-sm font-medium text-slate-500">
                      <LoaderCircle size={18} className="animate-spin" />
                      Loading intercity trips
                    </div>
                  </td>
                </tr>
              )}

              {!isLoading && error && (
                <tr>
                  <td colSpan={8} className="px-4 py-14 text-center text-sm font-medium text-red-500">
                    {error}
                  </td>
                </tr>
              )}

              {!isLoading && !error && rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-14 text-center text-sm font-medium text-slate-500">
                    No intercity travel requests found.
                  </td>
                </tr>
              )}

              {!isLoading && !error && rows.map((row) => (
                <tr key={row.id} className="border-b border-slate-100 last:border-b-0">
                  <td className="px-4 py-5 text-[13px] font-medium text-slate-900">{row.requestId}</td>
                  <td className="px-4 py-5 text-[13px] font-medium text-slate-900">{formatDate(row.date)}</td>
                  <td className="px-4 py-5 text-[13px] font-medium text-slate-900">{row.userName}</td>
                  <td className="px-4 py-5 text-[13px] font-medium text-slate-900">{row.driverName}</td>
                  <td className="px-4 py-5 text-[13px] font-medium text-slate-900">
                    <div>{row.transportType}</div>
                    <div className="mt-1 text-[11px] font-bold text-slate-400">
                      {row.routeLabel || 'Intercity'}{row.passengers ? ` • ${row.passengers} pax` : ''}
                    </div>
                  </td>
                  <td className="px-4 py-5">
                    <span className={`rounded px-2.5 py-1 text-[10px] font-black uppercase ${STATUS_STYLES[row.tripStatus] || 'bg-slate-200 text-slate-700'}`}>
                      {String(row.tripStatus || '').replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-5">
                    <span className="rounded px-2.5 py-1 text-[10px] font-black uppercase bg-orange-500 text-white">{row.paymentOption}</span>
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
