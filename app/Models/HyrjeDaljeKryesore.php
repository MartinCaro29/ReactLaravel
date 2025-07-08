<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class HyrjeDaljeKryesore extends Model
{
    use HasFactory;

    protected $table = 'hyrje_dalje_kryesore';

    // Since this table doesn't have created_at/updated_at columns
    public $timestamps = false;

    // No primary key auto-increment
    public $incrementing = false;

    protected $fillable = [
        'username',
        'data_hyrje',
        'ora_hyrje',
        'ora_dalje'
    ];

    protected $casts = [
        'data_hyrje' => 'date',
        'ora_hyrje' => 'datetime:H:i:s',
        'ora_dalje' => 'datetime:H:i:s'
    ];

    /**
     * Calculate hours worked for this entry
     */
    public function getHoursWorkedAttribute()
    {
        if (!$this->ora_hyrje || !$this->ora_dalje) {
            return 0;
        }

        $start = Carbon::createFromFormat('H:i:s', $this->ora_hyrje);
        $end = Carbon::createFromFormat('H:i:s', $this->ora_dalje);

        // Handle cases where end time is next day
        if ($end->lessThan($start)) {
            $end->addDay();
        }

        return $start->diffInHours($end, true); // true for float result
    }

    /**
     * Get comprehensive worker time statistics
     */
    public static function getWorkerTimeStats()
    {
        return self::select([
            'username',
            DB::raw('COUNT(DISTINCT YEAR(data_hyrje)) as total_years'),
            DB::raw('COUNT(DISTINCT CONCAT(YEAR(data_hyrje), "-", LPAD(MONTH(data_hyrje), 2, "0"))) as total_months'),
            DB::raw('COUNT(DISTINCT data_hyrje) as total_days'),
            DB::raw('
                    SUM(
                        CASE
                            WHEN ora_dalje IS NOT NULL AND ora_hyrje IS NOT NULL THEN
                                CASE
                                    WHEN TIME(ora_dalje) >= TIME(ora_hyrje) THEN
                                        TIME_TO_SEC(TIMEDIFF(TIME(ora_dalje), TIME(ora_hyrje))) / 3600.0
                                    ELSE
                                        (86400 - TIME_TO_SEC(TIME(ora_hyrje)) + TIME_TO_SEC(TIME(ora_dalje))) / 3600.0
                                END
                            ELSE 0
                        END
                    ) as total_hours
                '),
            DB::raw('
                    AVG(
                        CASE
                            WHEN ora_dalje IS NOT NULL AND ora_hyrje IS NOT NULL THEN
                                CASE
                                    WHEN TIME(ora_dalje) >= TIME(ora_hyrje) THEN
                                        TIME_TO_SEC(TIMEDIFF(TIME(ora_dalje), TIME(ora_hyrje))) / 3600.0
                                    ELSE
                                        (86400 - TIME_TO_SEC(TIME(ora_hyrje)) + TIME_TO_SEC(TIME(ora_dalje))) / 3600.0
                                END
                            ELSE 0
                        END
                    ) as average_hours_per_day
                '),
            DB::raw('MIN(data_hyrje) as first_work_date'),
            DB::raw('MAX(data_hyrje) as last_work_date')
        ])
            ->whereNotNull('data_hyrje')
            ->whereNotNull('ora_hyrje')
            ->whereNotNull('ora_dalje')
            ->where('data_hyrje', '!=', '')
            ->where('ora_hyrje', '!=', '')
            ->where('ora_dalje', '!=', '')
            ->groupBy('username')
            ->orderBy('username')
            ->get();
    }

    /**
     * Get yearly breakdown for a specific worker
     */
    public static function getYearlyBreakdown($username)
    {
        return self::select([
            DB::raw('YEAR(data_hyrje) as year'),
            DB::raw('COUNT(DISTINCT CONCAT(YEAR(data_hyrje), "-", LPAD(MONTH(data_hyrje), 2, "0"))) as months_worked'),
            DB::raw('COUNT(DISTINCT data_hyrje) as days_worked'),
            DB::raw('
                    SUM(
                        CASE
                            WHEN ora_dalje IS NOT NULL AND ora_hyrje IS NOT NULL THEN
                                CASE
                                    WHEN TIME(ora_dalje) >= TIME(ora_hyrje) THEN
                                        TIME_TO_SEC(TIMEDIFF(TIME(ora_dalje), TIME(ora_hyrje))) / 3600.0
                                    ELSE
                                        (86400 - TIME_TO_SEC(TIME(ora_hyrje)) + TIME_TO_SEC(TIME(ora_dalje))) / 3600.0
                                END
                            ELSE 0
                        END
                    ) as total_hours
                '),
            DB::raw('
                    AVG(
                        CASE
                            WHEN ora_dalje IS NOT NULL AND ora_hyrje IS NOT NULL THEN
                                CASE
                                    WHEN TIME(ora_dalje) >= TIME(ora_hyrje) THEN
                                        TIME_TO_SEC(TIMEDIFF(TIME(ora_dalje), TIME(ora_hyrje))) / 3600.0
                                    ELSE
                                        (86400 - TIME_TO_SEC(TIME(ora_hyrje)) + TIME_TO_SEC(TIME(ora_dalje))) / 3600.0
                                END
                            ELSE 0
                        END
                    ) as average_hours_per_day
                ')
        ])
            ->where('username', $username)
            ->whereNotNull('data_hyrje')
            ->whereNotNull('ora_hyrje')
            ->whereNotNull('ora_dalje')
            ->where('data_hyrje', '!=', '')
            ->where('ora_hyrje', '!=', '')
            ->where('ora_dalje', '!=', '')
            ->groupBy(DB::raw('YEAR(data_hyrje)'))
            ->orderBy('year', 'desc')
            ->get();
    }

    /**
     * Get monthly breakdown for a specific worker and year
     */
    public static function getMonthlyBreakdown($username, $year)
    {
        return self::select([
            DB::raw('MONTH(data_hyrje) as month'),
            DB::raw('MONTHNAME(data_hyrje) as month_name'),
            DB::raw('COUNT(DISTINCT data_hyrje) as days_worked'),
            DB::raw('
                    SUM(
                        CASE
                            WHEN ora_dalje IS NOT NULL AND ora_hyrje IS NOT NULL THEN
                                CASE
                                    WHEN TIME(ora_dalje) >= TIME(ora_hyrje) THEN
                                        TIME_TO_SEC(TIMEDIFF(TIME(ora_dalje), TIME(ora_hyrje))) / 3600.0
                                    ELSE
                                        (86400 - TIME_TO_SEC(TIME(ora_hyrje)) + TIME_TO_SEC(TIME(ora_dalje))) / 3600.0
                                END
                            ELSE 0
                        END
                    ) as total_hours
                '),
            DB::raw('
                    AVG(
                        CASE
                            WHEN ora_dalje IS NOT NULL AND ora_hyrje IS NOT NULL THEN
                                CASE
                                    WHEN TIME(ora_dalje) >= TIME(ora_hyrje) THEN
                                        TIME_TO_SEC(TIMEDIFF(TIME(ora_dalje), TIME(ora_hyrje))) / 3600.0
                                    ELSE
                                        (86400 - TIME_TO_SEC(TIME(ora_hyrje)) + TIME_TO_SEC(TIME(ora_dalje))) / 3600.0
                                END
                            ELSE 0
                        END
                    ) as average_hours_per_day
                ')
        ])
            ->where('username', $username)
            ->whereYear('data_hyrje', $year)
            ->whereNotNull('data_hyrje')
            ->whereNotNull('ora_hyrje')
            ->whereNotNull('ora_dalje')
            ->where('data_hyrje', '!=', '')
            ->where('ora_hyrje', '!=', '')
            ->where('ora_dalje', '!=', '')
            ->groupBy(DB::raw('MONTH(data_hyrje)'), DB::raw('MONTHNAME(data_hyrje)'))
            ->orderBy('month')
            ->get();
    }

    /**
     * Get daily breakdown for a specific worker, year, and month
     */
    public static function getDailyBreakdown($username, $year, $month)
    {
        return self::select([
            'data_hyrje',
            'ora_hyrje',
            'ora_dalje',
            DB::raw('DAYNAME(data_hyrje) as day_name'),
            DB::raw('
                    CASE
                        WHEN ora_dalje IS NOT NULL AND ora_hyrje IS NOT NULL THEN
                            CASE
                                WHEN TIME(ora_dalje) >= TIME(ora_hyrje) THEN
                                    TIME_TO_SEC(TIMEDIFF(TIME(ora_dalje), TIME(ora_hyrje))) / 3600.0
                                ELSE
                                    (86400 - TIME_TO_SEC(TIME(ora_hyrje)) + TIME_TO_SEC(TIME(ora_dalje))) / 3600.0
                            END
                        ELSE 0
                    END as hours_worked
                ')
        ])
            ->where('username', $username)
            ->whereYear('data_hyrje', $year)
            ->whereMonth('data_hyrje', $month)
            ->whereNotNull('data_hyrje')
            ->whereNotNull('ora_hyrje')
            ->whereNotNull('ora_dalje')
            ->where('data_hyrje', '!=', '')
            ->where('ora_hyrje', '!=', '')
            ->where('ora_dalje', '!=', '')
            ->orderBy('data_hyrje')
            ->get();
    }

    /**
     * Get all breakdown data for a specific worker at once
     */
    public static function getAllBreakdownData($username)
    {
        $years = self::getYearlyBreakdown($username);
        $breakdown = [
            'years' => []
        ];

        foreach ($years as $year) {
            $months = self::getMonthlyBreakdown($username, $year->year);
            $yearData = [
                'year' => $year->year,
                'months_worked' => $year->months_worked,
                'days_worked' => $year->days_worked,
                'total_hours' => round($year->total_hours, 2),
                'average_hours_per_day' => round($year->average_hours_per_day, 2),
                'months' => []
            ];

            foreach ($months as $month) {
                $days = self::getDailyBreakdown($username, $year->year, $month->month);
                $monthData = [
                    'month' => $month->month,
                    'month_name' => $month->month_name,
                    'days_worked' => $month->days_worked,
                    'total_hours' => round($month->total_hours, 2),
                    'average_hours_per_day' => round($month->average_hours_per_day, 2),
                    'days' => $days->map(function($day) {
                        return [
                            'date' => $day->data_hyrje->format('Y-m-d'),
                            'day_name' => $day->day_name,
                            'entry_time' => $day->ora_hyrje,
                            'exit_time' => $day->ora_dalje,
                            'hours_worked' => round($day->hours_worked, 2)
                        ];
                    })
                ];
                $yearData['months'][] = $monthData;
            }

            $breakdown['years'][] = $yearData;
        }

        return $breakdown;
    }
}
