export interface ProjectAnalytics {
  totalEvents: number;
  topEvents: { count: number; _id: string }[];
  countries: { count: number; _id: string }[];
  devices: { count: number; _id: string }[];
  cities: { count: number; _id: string }[];
  os: { count: number; _id: string }[];
  todayEvents?: number;
  eventGrowth?: number;
  activeUsersTimelineDay?: { date: string; count: number }[];
  activeUsersTimelineWeek?: { date: string; count: number }[];
  activeUsersTimelineMonth?: { date: string; count: number }[];
  activeUsersTimelineYear?: { date: string; count: number }[];
  revenueTimelineDay?: { date: string; profit: number }[];
  revenueTimelineWeek?: { date: string; profit: number }[];
  revenueTimelineMonth?: { date: string; profit: number }[];
  revenueTimelineYear?: { date: string; profit: number }[];
  retentionData?: {
    todaysCount: number;
    yesterdayCount: number;
    sevenDayCount: number;
    thirtyDayCount: number;
    oneDayRetentionCount: number;
    oneDayRetentionRate: number;
    sevenDayRetentionCount: number;
    sevenDayRetentionRate: number;
    thirtyDayRetentionCount: number;
    thirtyDayRetentionRate: number;
  };
}
