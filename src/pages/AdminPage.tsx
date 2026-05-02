import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import type { Profile } from '../lib/types';

const ADMIN_EMAIL = 'edwardwtlam@gmail.com';

interface DailyView {
  date: string;
  count: number;
}

interface UserWithEmail extends Profile {
  email?: string;
}

export default function AdminPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserWithEmail[]>([]);
  const [dailyViews, setDailyViews] = useState<DailyView[]>([]);
  const [totalViews, setTotalViews] = useState(0);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!user || user.email !== ADMIN_EMAIL) {
        navigate('/');
      } else {
        fetchData();
      }
    }
  }, [user, loading, navigate]);

  const fetchData = async () => {
    setLoadingData(true);
    try {
      // Fetch all profiles
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      setUsers(profilesData || []);

      // Fetch daily page views for last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: viewsData } = await supabase
        .from('page_views')
        .select('viewed_at')
        .gte('viewed_at', thirtyDaysAgo.toISOString())
        .order('viewed_at', { ascending: true });

      if (viewsData) {
        setTotalViews(viewsData.length);
        // Group by date (HKT = UTC+8)
        const grouped: Record<string, number> = {};
        viewsData.forEach(v => {
          const date = new Date(v.viewed_at);
          // Convert to HKT
          const hktDate = new Date(date.getTime() + 8 * 60 * 60 * 1000);
          const dateStr = hktDate.toISOString().split('T')[0];
          grouped[dateStr] = (grouped[dateStr] || 0) + 1;
        });

        // Fill in missing dates
        const result: DailyView[] = [];
        for (let i = 29; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const dateStr = d.toISOString().split('T')[0];
          result.push({ date: dateStr, count: grouped[dateStr] || 0 });
        }
        setDailyViews(result);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    }
    setLoadingData(false);
  };

  const downloadExcel = () => {
    if (users.length === 0) {
      alert('目前沒有訂閱用戶資料');
      return;
    }

    // Create CSV content
    const headers = ['用戶名稱', '電郵', '顯示名稱', '閱讀連續天數', '總積分', '今日已讀文章', '加入日期'];
    const rows = users.map((u: any) => [
      u.username || '',
      u.email || '',
      u.display_name || '',
      u.reading_streak || 0,
      u.total_points || 0,
      u.articles_read_today || 0,
      u.created_at ? new Date(u.created_at).toLocaleDateString('zh-HK') : '',
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    // Add BOM for Excel to recognize UTF-8
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `snkkids_users_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">載入中...</div>
      </div>
    );
  }

  if (!user || user.email !== ADMIN_EMAIL) {
    return null;
  }

  const maxViews = Math.max(...dailyViews.map(d => d.count), 1);
  const todayViews = dailyViews[dailyViews.length - 1]?.count || 0;
  const yesterdayViews = dailyViews[dailyViews.length - 2]?.count || 0;
  const weekViews = dailyViews.slice(-7).reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">管理後台</h1>
          <p className="text-gray-500 mt-1">SNKKids 網站數據概覽</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <div className="text-sm text-gray-500 mb-1">訂閱用戶</div>
            <div className="text-3xl font-bold text-indigo-600">{users.length}</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <div className="text-sm text-gray-500 mb-1">今日瀏覽</div>
            <div className="text-3xl font-bold text-green-600">{todayViews}</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <div className="text-sm text-gray-500 mb-1">昨日瀏覽</div>
            <div className="text-3xl font-bold text-blue-600">{yesterdayViews}</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <div className="text-sm text-gray-500 mb-1">過去 7 日</div>
            <div className="text-3xl font-bold text-amber-600">{weekViews}</div>
          </div>
        </div>

        {/* Daily Views Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">每日瀏覽人次（過去 30 天）</h2>
          {dailyViews.every(d => d.count === 0) ? (
            <div className="text-center text-gray-400 py-12">
              <p>尚未有瀏覽記錄</p>
              <p className="text-sm mt-1">瀏覽追蹤功能已啟動，數據將從今天開始累積</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="flex items-end gap-1 h-48 min-w-max">
                {dailyViews.map((d, i) => {
                  const height = maxViews > 0 ? Math.max((d.count / maxViews) * 160, d.count > 0 ? 4 : 0) : 0;
                  const isToday = i === dailyViews.length - 1;
                  const dateLabel = new Date(d.date + 'T00:00:00').toLocaleDateString('zh-HK', { month: 'numeric', day: 'numeric' });
                  return (
                    <div key={d.date} className="flex flex-col items-center group relative" style={{ width: '28px' }}>
                      {/* Tooltip */}
                      <div className="absolute bottom-full mb-1 bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                        {d.date}<br />{d.count} 次
                      </div>
                      {/* Bar */}
                      <div
                        className={`w-5 rounded-t transition-all ${isToday ? 'bg-indigo-500' : 'bg-indigo-300 hover:bg-indigo-400'}`}
                        style={{ height: `${height}px` }}
                      />
                      {/* Date label - show every 5 days */}
                      {(i % 5 === 0 || isToday) && (
                        <div className="text-xs text-gray-400 mt-1 transform -rotate-45 origin-top-left" style={{ fontSize: '9px', marginTop: '4px' }}>
                          {dateLabel}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">訂閱用戶列表</h2>
              <p className="text-sm text-gray-500 mt-0.5">共 {users.length} 位用戶</p>
            </div>
            <button
              onClick={downloadExcel}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              下載 Excel
            </button>
          </div>

          {users.length === 0 ? (
            <div className="text-center text-gray-400 py-12">
              <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p>目前沒有訂閱用戶</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 text-left">
                    <th className="px-6 py-3 font-medium">用戶名稱</th>
                    <th className="px-6 py-3 font-medium">電郵</th>
                    <th className="px-6 py-3 font-medium">顯示名稱</th>
                    <th className="px-6 py-3 font-medium text-center">閱讀連續天數</th>
                    <th className="px-6 py-3 font-medium text-center">總積分</th>
                    <th className="px-6 py-3 font-medium text-center">今日已讀</th>
                    <th className="px-6 py-3 font-medium">加入日期</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">@{u.username}</td>
                      <td className="px-6 py-4 text-gray-500 text-sm">{(u as any).email || '-'}</td>
                      <td className="px-6 py-4 text-gray-700">{u.display_name}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center gap-1 text-orange-600 font-medium">
                          🔥 {u.reading_streak}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-indigo-600 font-medium">{u.total_points}</span>
                      </td>
                      <td className="px-6 py-4 text-center text-gray-600">{u.articles_read_today}</td>
                      <td className="px-6 py-4 text-gray-500">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString('zh-HK') : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
