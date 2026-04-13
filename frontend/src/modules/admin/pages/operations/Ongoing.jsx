import React from 'react';
import { MoreVertical, Search, Trash2 } from 'lucide-react';
import { adminService } from '../../services/adminService';

const STATUS_STYLES = {
  ACCEPTED: 'bg-teal-500 text-white',
  UPCOMING: 'bg-amber-400 text-white',
  ONGOING: 'bg-indigo-500 text-white',
};

const TAB_SET = ['All', 'Accepted', 'Upcoming', 'Ongoing'];

const formatDate = (value) => {
  const date = value ? new Date(value) : null;

  if (!date || Number.isNaN(date.getTime())) {
    return '--';
  }

  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const Ongoing = () => {
  const [activeTab, setActiveTab] = React.useState('All');
  const [search, setSearch] = React.useState('');
  const [limit, setLimit] = React.useState(10);
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  const loadRows = React.useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await adminService.getOngoingRides({
        limit,
        tab: activeTab.toLowerCase(),
        search,
      });

      const payload = response?.data?.data || response?.data || response;
      setRows(payload?.results || []);
    } catch (err) {
      setError(err?.message || 'Failed to load ongoing rides');
    } finally {
      setLoading(false);
    }
  }, [activeTab, limit, search]);

  React.useEffect(() => {
    loadRows();
  }, [loadRows]);

  const handleDelete = async (ride) => {
    const confirmed = window.confirm(`Delete ride ${ride.requestId}? This will remove it for both rider and driver.`);

    if (!confirmed) {
      return;
    }

    try {
      await adminService.deleteOngoingRide(ride.id);
      setRows((prev) => prev.filter((row) => row.id !== ride.id));
    } catch (err) {
      window.alert(err?.message || 'Failed to delete ride');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-400">Ongoing Requests</p>
          <h1 className="mt-1 text-[22px] font-black tracking-tight text-slate-900">ONGOING REQUESTS</h1>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-[12px] font-black uppercase tracking-[0.2em] text-slate-600">
          <Search size={14} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search ride"
            className="w-32 bg-transparent text-[12px] font-black uppercase tracking-[0.15em] text-slate-700 outline-none placeholder:text-slate-400"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-2 text-[12px] font-medium text-slate-500">
            <span>show</span>
            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-[12px] font-medium text-slate-700 outline-none"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
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
                {['Request Id', 'Date', 'User Name', 'Driver Name', 'Transport Type', 'Trip Status', 'Fare', 'Action'].map((heading) => (
                  <th key={heading} className="border-b border-slate-200 px-4 py-4 text-[13px] font-black text-slate-900">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-[13px] font-black text-slate-400">
                    Loading ongoing rides...
                  </td>
                </tr>
              )}

              {!loading && error && (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-[13px] font-black text-red-500">
                    {error}
                  </td>
                </tr>
              )}

              {!loading && !error && rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-[13px] font-black text-slate-400">
                    No ongoing rides found.
                  </td>
                </tr>
              )}

              {!loading && !error && rows.map((row) => (
                <tr key={row.id} className="border-b border-slate-100 last:border-b-0">
                  <td className="px-4 py-5 text-[13px] font-medium text-slate-900">{row.requestId}</td>
                  <td className="px-4 py-5 text-[13px] font-medium text-slate-900">{formatDate(row.date)}</td>
                  <td className="px-4 py-5 text-[13px] font-medium text-slate-900">{row.userName}</td>
                  <td className="px-4 py-5 text-[13px] font-medium text-slate-900">{row.driverName}</td>
                  <td className="px-4 py-5 text-[13px] font-medium text-slate-900">{row.transportType}</td>
                  <td className="px-4 py-5">
                    <span className={`rounded px-2.5 py-1 text-[10px] font-black uppercase ${STATUS_STYLES[row.tripStatus] || 'bg-slate-200 text-slate-700'}`}>
                      {row.tripStatus}
                    </span>
                  </td>
                  <td className="px-4 py-5">
                    <span className="rounded px-2.5 py-1 text-[10px] font-black uppercase bg-orange-500 text-white">
                      Rs {Number(row.fare || 0)}
                    </span>
                  </td>
                  <td className="px-4 py-5">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleDelete(row)}
                        className="text-rose-500 hover:text-rose-700"
                        title="Delete ride"
                      >
                        <Trash2 size={16} />
                      </button>
                      <button className="text-slate-400 hover:text-slate-700">
                        <MoreVertical size={16} />
                      </button>
                    </div>
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

export default Ongoing;
