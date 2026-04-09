import { LayoutGrid, Package, Activity, Settings, Plus } from 'lucide-react';

export default function Home() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage your easy-build-expo projects and builds</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
          <Plus size={20} />
          <span>New Project</span>
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={<Package className="text-blue-500" />} label="Projects" value="0" />
        <StatCard icon={<Activity className="text-green-500" />} label="Total Builds" value="0" />
        <StatCard icon={<LayoutGrid className="text-purple-500" />} label="OTA Updates" value="0" />
        <StatCard icon={<Settings className="text-gray-500" />} label="Active Org" value="Personal" />
      </div>

      <section className="mt-12">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 text-center">
          <div className="inline-flex p-4 bg-blue-50 dark:bg-blue-900/30 rounded-full mb-4">
            <Plus className="text-blue-600 dark:text-blue-400" size={32} />
          </div>
          <h3 className="text-xl font-semibold dark:text-white">No projects yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2 mb-6">Create your first project to start building your Expo Android apps in the cloud.</p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
            Init your first project
          </button>
        </div>
      </section>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex items-center gap-4 mb-3">
        {icon}
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-2xl font-bold dark:text-white">{value}</div>
    </div>
  );
}
