/**
 * @file StatsCards.jsx
 * @description Dashboard component for stats cards. Used within the user or admin dashboard.
 */

function StatsCards({ urls }) {

  const totalLinks = urls.length;

  const totalClicks = urls.reduce((sum, item) => {
    return sum + item.click_count;
  }, 0);

  const activeLinks = urls.filter((item) => item.is_active !== 0).length;

  return (

    <div className="grid grid-cols-3 gap-6 mb-8">

      {/* Total Links */}
      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-gray-500 text-sm">Total Links</p>
        <h2 className="text-3xl font-bold">{totalLinks}</h2>
      </div>

      {/* Total Clicks */}
      <div className="bg-pink-500 text-white p-6 rounded-lg shadow">
        <p className="text-sm">Total Clicks</p>
        <h2 className="text-3xl font-bold">{totalClicks}</h2>
      </div>

      {/* Active Links */}
      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-gray-500 text-sm">Active Links</p>
        <h2 className="text-3xl font-bold">{activeLinks}</h2>
      </div>

    </div>

  );

}

export default StatsCards;