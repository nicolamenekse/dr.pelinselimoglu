interface StatsCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  color: 'blue' | 'green' | 'purple' | 'orange'
  change?: string
}

export default function StatsCard({ title, value, icon, color, change }: StatsCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-200'
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {change && (
            <p className="text-sm text-green-600 mt-1 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              {change}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg border ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  )
}
