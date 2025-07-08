<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\HyrjeDaljeKryesore;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class WorkerTimeController extends Controller
{
    /**
     * Get worker time statistics with all breakdown data for DataTable
     */
    public function getWorkerStats(): JsonResponse
    {
        try {
            // Super simple approach
            $workers = HyrjeDaljeKryesore::select('username')
                ->whereNotNull('username')
                ->where('username', '!=', '')
                ->distinct()
                ->get();

            $result = [];

            foreach ($workers as $worker) {
                $username = $worker->username;

                // Get basic stats for this worker
                $workerData = HyrjeDaljeKryesore::where('username', $username)
                    ->whereNotNull('data_hyrje')
                    ->get();

                if ($workerData->count() > 0) {
                    // Calculate total hours using the same datetime parsing
                    $totalHours = 0;
                    foreach ($workerData as $record) {
                        if ($record->ora_hyrje && $record->ora_dalje) {
                            try {
                                // Parse as full datetime instead of just time
                                $start = \Carbon\Carbon::parse($record->ora_hyrje);
                                $end = \Carbon\Carbon::parse($record->ora_dalje);

                                // Handle overnight shifts
                                if ($end->lessThan($start)) {
                                    $end->addDay();
                                }

                                $totalHours += $start->diffInHours($end, true);
                            } catch (\Exception $e) {
                                // Skip invalid time records
                                continue;
                            }
                        }
                    }

                    // Create breakdown using the same working data
                    $breakdown = $this->createBreakdown($username, $workerData);

                    $result[] = [
                        'username' => $username,
                        'total_years' => $workerData->pluck('data_hyrje')->map(function ($date) {
                            return \Carbon\Carbon::parse($date)->year;
                        })->unique()->count(),
                        'total_months' => $workerData->pluck('data_hyrje')->map(function ($date) {
                            return \Carbon\Carbon::parse($date)->format('Y-m');
                        })->unique()->count(),
                        'total_days' => $workerData->count(),
                        'total_hours' => round($totalHours, 2),
                        'average_hours_per_day' => $workerData->count() > 0 ? round($totalHours / $workerData->count(), 2) : 0,
                        'first_work_date' => $workerData->min('data_hyrje'),
                        'last_work_date' => $workerData->max('data_hyrje'),
                        'breakdown' => $breakdown // Add the breakdown
                    ];
                }
            }

            return response()->json([
                'success' => true,
                'data' => $result
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch simple worker statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create breakdown data for a worker
     */
    private function createBreakdown($username, $workerData)
    {
        $breakdown = ['years' => []];

        // Group by year
        $yearGroups = $workerData->groupBy(function($record) {
            return \Carbon\Carbon::parse($record->data_hyrje)->year;
        });

        foreach ($yearGroups as $year => $yearRecords) {
            $yearTotalHours = 0;
            $months = [];

            // Group by month within each year
            $monthGroups = $yearRecords->groupBy(function($record) {
                return \Carbon\Carbon::parse($record->data_hyrje)->month;
            });

            foreach ($monthGroups as $month => $monthRecords) {
                $monthTotalHours = 0;
                $days = [];

                // Process each day
                foreach ($monthRecords as $dayRecord) {
                    $dayHours = 0;

                    if ($dayRecord->ora_hyrje && $dayRecord->ora_dalje) {
                        try {
                            // Parse as full datetime instead of just time
                            $start = \Carbon\Carbon::parse($dayRecord->ora_hyrje);
                            $end = \Carbon\Carbon::parse($dayRecord->ora_dalje);

                            // Handle overnight shifts (when end time is next day)
                            if ($end->lessThan($start)) {
                                $end->addDay();
                            }

                            $dayHours = $start->diffInHours($end, true);
                        } catch (\Exception $e) {
                            $dayHours = 0;
                        }
                    }

                    $days[] = [
                        'date' => \Carbon\Carbon::parse($dayRecord->data_hyrje)->format('Y-m-d'),
                        'day_name' => \Carbon\Carbon::parse($dayRecord->data_hyrje)->format('l'),
                        'entry_time' => $dayRecord->ora_hyrje ? \Carbon\Carbon::parse($dayRecord->ora_hyrje)->format('H:i:s') : null,
                        'exit_time' => $dayRecord->ora_dalje ? \Carbon\Carbon::parse($dayRecord->ora_dalje)->format('H:i:s') : null,
                        'hours_worked' => round($dayHours, 2)
                    ];

                    $monthTotalHours += $dayHours;
                }

                $months[] = [
                    'month' => $month,
                    'month_name' => \Carbon\Carbon::createFromDate($year, $month, 1)->format('F'),
                    'days_worked' => $monthRecords->count(),
                    'total_hours' => round($monthTotalHours, 2),
                    'average_hours_per_day' => $monthRecords->count() > 0 ? round($monthTotalHours / $monthRecords->count(), 2) : 0,
                    'days' => $days
                ];

                $yearTotalHours += $monthTotalHours;
            }

            $breakdown['years'][] = [
                'year' => $year,
                'months_worked' => $monthGroups->count(),
                'days_worked' => $yearRecords->count(),
                'total_hours' => round($yearTotalHours, 2),
                'average_hours_per_day' => $yearRecords->count() > 0 ? round($yearTotalHours / $yearRecords->count(), 2) : 0,
                'months' => $months
            ];
        }

        return $breakdown;
    }

    /**
     * Get summary statistics for dashboard
     */
    public function getSummaryStats(): JsonResponse
    {
        try {
            // Check if there's any data
            $recordCount = HyrjeDaljeKryesore::count();
            if ($recordCount === 0) {
                return response()->json([
                    'success' => true,
                    'data' => [
                        'total_workers' => 0,
                        'total_work_days' => 0,
                        'total_hours_all_workers' => 0,
                        'average_hours_per_day_all' => 0
                    ]
                ]);
            }

            // Simple counts
            $totalWorkers = HyrjeDaljeKryesore::select('username')
                ->whereNotNull('username')
                ->where('username', '!=', '')
                ->distinct()
                ->count();

            $totalWorkDays = HyrjeDaljeKryesore::select('data_hyrje')
                ->whereNotNull('data_hyrje')
                ->distinct()
                ->count();

            return response()->json([
                'success' => true,
                'data' => [
                    'total_workers' => $totalWorkers,
                    'total_work_days' => $totalWorkDays,
                    'total_hours_all_workers' => 0, // Temporarily 0 until we fix time parsing
                    'average_hours_per_day_all' => 0
                ]
            ]);
        } catch (\Exception $e) {
            \Log::error('Error in getSummaryStats: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch summary statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Export worker data to CSV (optional - since React handles CSV generation)
     */
    public function exportWorkerData(Request $request, $username)
    {
        try {
            $breakdown = HyrjeDaljeKryesore::getAllBreakdownData($username);

            $filename = "worker_time_data_{$username}_" . date('Y-m-d') . ".csv";

            $headers = [
                'Content-Type' => 'text/csv',
                'Content-Disposition' => "attachment; filename=\"{$filename}\"",
            ];

            $callback = function() use ($breakdown, $username) {
                $file = fopen('php://output', 'w');

                // CSV Headers
                fputcsv($file, ['Worker', 'Year', 'Month', 'Date', 'Day', 'Entry Time', 'Exit Time', 'Hours Worked']);

                if (isset($breakdown['years'])) {
                    foreach ($breakdown['years'] as $year) {
                        if (isset($year['months'])) {
                            foreach ($year['months'] as $month) {
                                if (isset($month['days'])) {
                                    foreach ($month['days'] as $day) {
                                        fputcsv($file, [
                                            $username,
                                            $year['year'],
                                            $month['month_name'],
                                            $day['date'],
                                            $day['day_name'],
                                            $day['entry_time'],
                                            $day['exit_time'],
                                            $day['hours_worked']
                                        ]);
                                    }
                                }
                            }
                        }
                    }
                }

                fclose($file);
            };

            return response()->stream($callback, 200, $headers);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to export data',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
