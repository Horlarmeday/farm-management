import { formatNaira as formatCurrency } from '@/lib/currency';
import { Activity, Bird, CheckCircle, DollarSign, TrendingUp } from 'lucide-react';
import React, { memo } from 'react';

interface KPICardsProps {
  stats: {
    activeBirds?: number;
    livestock?: { count: number };
    activeFarms?: number;
    totalRevenue?: number;
    alerts?: number;
  } | null;
}

const KPICards: React.FC<KPICardsProps> = memo(({ stats }) => {
  const totalAnimals = (stats?.activeBirds || 0) + (stats?.livestock?.count || 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
      {/* Total Animals Card */}
      <div className="group bg-white rounded-xl p-6 shadow-sm hover:shadow-lg border border-slate-200/60 hover:border-blue-200 transition-all duration-300 cursor-pointer animate-in slide-in-from-bottom-4 fade-in duration-500 delay-100">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors duration-200">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Total Animals</p>
                <p className="text-2xl font-bold text-slate-900">{totalAnimals.toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-sm">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              <span className="text-emerald-600 font-medium">+12%</span>
              <span className="text-slate-500">from last month</span>
            </div>
          </div>
        </div>
      </div>

      {/* Active Farms Card */}
      <div className="group bg-white rounded-xl p-6 shadow-sm hover:shadow-lg border border-slate-200/60 hover:border-emerald-200 transition-all duration-300 cursor-pointer animate-in slide-in-from-bottom-4 fade-in duration-500 delay-200">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center group-hover:bg-emerald-200 transition-colors duration-200">
                <Bird className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Active Farms</p>
                <p className="text-2xl font-bold text-slate-900">
                  {stats?.activeFarms?.toLocaleString() || '0'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-sm">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <span className="text-emerald-600 font-medium">All operational</span>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Card */}
      <div className="group bg-white rounded-xl p-6 shadow-sm hover:shadow-lg border border-slate-200/60 hover:border-amber-200 transition-all duration-300 cursor-pointer animate-in slide-in-from-bottom-4 fade-in duration-500 delay-300">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center group-hover:bg-amber-200 transition-colors duration-200">
                <DollarSign className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Monthly Revenue</p>
                <p className="text-2xl font-bold text-slate-900">
                  {formatCurrency(stats?.totalRevenue || 0)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-sm">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              <span className="text-emerald-600 font-medium">+8%</span>
              <span className="text-slate-500">from last month</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tasks Due Card */}
      <div className="group bg-white rounded-xl p-6 shadow-sm hover:shadow-lg border border-slate-200/60 hover:border-purple-200 transition-all duration-300 cursor-pointer animate-in slide-in-from-bottom-4 fade-in duration-500 delay-500">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors duration-200">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Tasks Due</p>
                <p className="text-2xl font-bold text-slate-900">5</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-sm">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-purple-600 font-medium">4 pending completion</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

KPICards.displayName = 'KPICards';

export default KPICards;