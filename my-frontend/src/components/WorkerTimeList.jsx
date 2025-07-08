import React, { useEffect, useState } from 'react';
import { Container, Button, Alert, Spinner, Badge, Card, Row, Col, Table } from 'react-bootstrap';
import { useAuth } from './AuthContext';
import api from '../api';
import Navigation from "./Navigation";
import Footer from "./Footer";
import { FaClock, FaUsers, FaCalendarAlt, FaChartBar, FaDownload, FaPlus, FaMinus, FaFileExport } from 'react-icons/fa';
import '../styles/worker-time.css';

const WorkerTimeList = () => {
    const { user: currentUser, isAdmin, isManager } = useAuth();
    const [workers, setWorkers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Track expanded rows
    const [expandedRows, setExpandedRows] = useState({});
    const [expandedYears, setExpandedYears] = useState({});
    const [expandedMonths, setExpandedMonths] = useState({});

    // Summary stats
    const [summaryStats, setSummaryStats] = useState({
        total_workers: 0,
        total_work_days: 0,
        total_hours_all_workers: 0,
        average_hours_per_day_all: 0
    });

    // Fetch worker statistics with all breakdown data
    const fetchWorkerStats = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/worker-time/stats');
            setWorkers(response.data.data || []);
            setError(null);
        } catch (err) {
            setError('Failed to fetch worker statistics');
            console.error('Fetch worker stats error:', err);
        } finally {
            setLoading(false);
        }
    };

    // Fetch summary statistics
    const fetchSummaryStats = async () => {
        try {
            const response = await api.get('/api/worker-time/summary');
            setSummaryStats(response.data.data || {});
        } catch (err) {
            console.error('Fetch summary stats error:', err);
        }
    };

    // Generate CSV content from loaded data (for all workers)
    const generateCSVContent = () => {
        let csvContent = 'Worker,Year,Month,Date,Day,Entry Time,Exit Time,Hours Worked\n';

        workers.forEach(worker => {
            if (worker.breakdown && worker.breakdown.years) {
                worker.breakdown.years.forEach(year => {
                    year.months.forEach(month => {
                        month.days.forEach(day => {
                            csvContent += `"${worker.username}","${year.year}","${month.month_name}","${day.date}","${day.day_name}","${day.entry_time}","${day.exit_time}","${day.hours_worked}"\n`;
                        });
                    });
                });
            }
        });

        return csvContent;
    };

    // Export individual worker data
    const exportWorkerData = (username) => {
        try {
            const worker = workers.find(w => w.username === username);
            if (!worker || !worker.breakdown) {
                setError('No data available for export');
                return;
            }

            let csvContent = 'Worker,Year,Month,Date,Day,Entry Time,Exit Time,Hours Worked\n';

            worker.breakdown.years.forEach(year => {
                year.months.forEach(month => {
                    month.days.forEach(day => {
                        csvContent += `"${worker.username}","${year.year}","${month.month_name}","${day.date}","${day.day_name}","${day.entry_time}","${day.exit_time}","${day.hours_worked}"\n`;
                    });
                });
            });

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `worker_time_data_${username}_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            setSuccess(`Data exported successfully for ${username}`);
        } catch (err) {
            setError(`Failed to export data for ${username}`);
            console.error('Export error:', err);
        }
    };

    useEffect(() => {
        if (currentUser) {
            fetchWorkerStats();
            fetchSummaryStats();
        }
    }, [currentUser]);

    // Clear alerts after 5 seconds
    useEffect(() => {
        if (error || success) {
            const timer = setTimeout(() => {
                setError(null);
                setSuccess(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [error, success]);

    // Toggle worker row expansion
    const toggleWorkerExpansion = (username) => {
        setExpandedRows(prev => ({
            ...prev,
            [username]: !prev[username]
        }));
    };

    // Toggle year expansion
    const toggleYearExpansion = (username, year) => {
        const key = `${username}_${year}`;
        setExpandedYears(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    // Toggle month expansion
    const toggleMonthExpansion = (username, year, month) => {
        const key = `${username}_${year}_${month}`;
        setExpandedMonths(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    // Format hours display
    const formatHours = (hours) => {
        const h = Math.floor(hours);
        const m = Math.round((hours - h) * 60);
        return `${h}h ${m}m`;
    };

    // Format date display
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    };

    // Get month name
    const getMonthName = (monthNum) => {
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        return months[monthNum - 1] || `Month ${monthNum}`;
    };

    if (!currentUser || (!isAdmin() && !isManager())) {
        return (
            <>
                <Navigation/>
                <Container className="mt-4 vh-100">
                    <Card className="modern-card">
                        <Card.Body className="text-center py-5">
                            <FaClock className="text-muted mb-3" size={48} />
                            <h4>Access Denied</h4>
                            <p className="text-muted">You don't have permission to access worker time management.</p>
                            <Button variant="primary" href="/">Go to Home Page</Button>
                        </Card.Body>
                    </Card>
                </Container>
                <Footer/>
            </>
        );
    }

    if (loading) {
        return (
            <>
                <Navigation/>
                <Container className="mt-4 text-center">
                    <div className="loading-container">
                        <Spinner animation="border" className="spinner-mint" size="lg" />
                        <h4 className="mt-3">Loading Worker Time Data...</h4>
                        <p className="text-muted">Please wait while we process the time records</p>
                    </div>
                </Container>
                <Footer/>
            </>
        );
    }

    return (
        <>
            <Navigation/>

            <Container className="mt-4 mb-5">
                {/* Header Section */}
                <div className="page-header">
                    <div className="header-content">
                        <div>
                            <h1 className="page-title">
                                <FaClock className="me-3" />
                                Worker Time Management
                            </h1>
                            <p className="page-subtitle">Track and analyze worker time logs - All data loaded in single request</p>
                        </div>
                        <div className="header-actions">
                            <Button
                                variant="success"
                                onClick={() => {
                                    const csvContent = generateCSVContent();
                                    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                                    const link = document.createElement('a');
                                    const url = URL.createObjectURL(blob);
                                    link.setAttribute('href', url);
                                    link.setAttribute('download', `all_workers_time_data_${new Date().toISOString().split('T')[0]}.csv`);
                                    link.style.visibility = 'hidden';
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                    setSuccess('All workers data exported successfully');
                                }}
                                disabled={workers.length === 0}
                                className="me-2"
                            >
                                <FaFileExport className="me-2" />
                                Export All Data
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Summary Stats Cards */}
                <Row className="mb-4">
                    <Col md={3} sm={6}>
                        <Card className="stats-card">
                            <Card.Body>
                                <div className="stats-content">
                                    <div className="stats-number">{summaryStats.total_workers}</div>
                                    <div className="stats-label">Total Workers</div>
                                </div>
                                <div className="stats-icon total">
                                    <FaUsers />
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3} sm={6}>
                        <Card className="stats-card">
                            <Card.Body>
                                <div className="stats-content">
                                    <div className="stats-number">{summaryStats.total_work_days}</div>
                                    <div className="stats-label">Total Work Days</div>
                                </div>
                                <div className="stats-icon verified">
                                    <FaCalendarAlt />
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3} sm={6}>
                        <Card className="stats-card">
                            <Card.Body>
                                <div className="stats-content">
                                    <div className="stats-number">{formatHours(summaryStats.total_hours_all_workers)}</div>
                                    <div className="stats-label">Total Hours</div>
                                </div>
                                <div className="stats-icon admin">
                                    <FaClock />
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3} sm={6}>
                        <Card className="stats-card">
                            <Card.Body>
                                <div className="stats-content">
                                    <div className="stats-number">{formatHours(summaryStats.average_hours_per_day_all)}</div>
                                    <div className="stats-label">Avg Hours/Day</div>
                                </div>
                                <div className="stats-icon manager">
                                    <FaChartBar />
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                {/* Alerts */}
                {error && <Alert variant="danger" className="modern-alert">{error}</Alert>}
                {success && <Alert variant="success" className="modern-alert">{success}</Alert>}

                {/* Worker Time Table */}
                <Card className="modern-card">
                    <Card.Header className="modern-card-header">
                        <h5 className="mb-0">Worker Time Summary</h5>
                        <div className="table-actions">
                            <Badge bg="info" className="me-2">
                                {workers.length} Workers
                            </Badge>
                            <Badge bg="success" className="me-2">
                                Single API Call - All Data Loaded
                            </Badge>
                        </div>
                    </Card.Header>
                    <Card.Body className="p-0">
                        <div className="table-responsive">
                            <Table className="modern-table mb-0" hover>
                                <thead>
                                <tr>
                                    <th style={{ width: '50px' }}></th>
                                    <th>Worker</th>
                                    <th>Years</th>
                                    <th>Months</th>
                                    <th>Days</th>
                                    <th>Total Hours</th>
                                    <th>Avg Hours/Day</th>
                                    <th>First Work</th>
                                    <th>Last Work</th>
                                    <th>Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {workers.map((worker, index) => (
                                    <React.Fragment key={worker.username}>
                                        {/* Main Worker Row */}
                                        <tr className="worker-main-row">
                                            <td>
                                                <Button
                                                    variant="link"
                                                    size="sm"
                                                    className="p-0 expand-btn"
                                                    onClick={() => toggleWorkerExpansion(worker.username)}
                                                >
                                                    {expandedRows[worker.username] ?
                                                        <FaMinus className="text-primary" /> :
                                                        <FaPlus className="text-primary" />
                                                    }
                                                </Button>
                                            </td>
                                            <td className="fw-bold">{worker.username}</td>
                                            <td>
                                                <Badge bg="primary">{worker.total_years}</Badge>
                                            </td>
                                            <td>
                                                <Badge bg="info">{worker.total_months}</Badge>
                                            </td>
                                            <td>
                                                <Badge bg="success">{worker.total_days}</Badge>
                                            </td>
                                            <td className="fw-bold text-primary">
                                                {formatHours(worker.total_hours)}
                                            </td>
                                            <td>{formatHours(worker.average_hours_per_day)}</td>
                                            <td>{formatDate(worker.first_work_date)}</td>
                                            <td>{formatDate(worker.last_work_date)}</td>
                                            <td>
                                                <Button
                                                    variant="outline-primary"
                                                    size="sm"
                                                    onClick={() => exportWorkerData(worker.username)}
                                                    title="Export Data"
                                                >
                                                    <FaDownload />
                                                </Button>
                                            </td>
                                        </tr>

                                        {/* Expanded Years Section */}
                                        {expandedRows[worker.username] && worker.breakdown && (
                                            <tr>
                                                <td colSpan="10" className="p-0">
                                                    <div className="breakdown-container">
                                                        <div className="breakdown-section">
                                                            <h6 className="breakdown-title">
                                                                <FaCalendarAlt className="me-2" />
                                                                Yearly Breakdown
                                                            </h6>
                                                            <Table size="sm" className="breakdown-table">
                                                                <thead>
                                                                <tr>
                                                                    <th style={{ width: '50px' }}></th>
                                                                    <th>Year</th>
                                                                    <th>Months</th>
                                                                    <th>Days</th>
                                                                    <th>Total Hours</th>
                                                                    <th>Avg Hours/Day</th>
                                                                </tr>
                                                                </thead>
                                                                <tbody>
                                                                {worker.breakdown.years.map((year) => (
                                                                    <React.Fragment key={year.year}>
                                                                        <tr className="year-row">
                                                                            <td>
                                                                                <Button
                                                                                    variant="link"
                                                                                    size="sm"
                                                                                    className="p-0"
                                                                                    onClick={() => toggleYearExpansion(worker.username, year.year)}
                                                                                >
                                                                                    {expandedYears[`${worker.username}_${year.year}`] ?
                                                                                        <FaMinus className="text-info" /> :
                                                                                        <FaPlus className="text-info" />
                                                                                    }
                                                                                </Button>
                                                                            </td>
                                                                            <td className="fw-bold">{year.year}</td>
                                                                            <td>{year.months_worked}</td>
                                                                            <td>{year.days_worked}</td>
                                                                            <td className="fw-bold">{formatHours(year.total_hours)}</td>
                                                                            <td>{formatHours(year.average_hours_per_day)}</td>
                                                                        </tr>

                                                                        {/* Expanded Months Section */}
                                                                        {expandedYears[`${worker.username}_${year.year}`] && (
                                                                            <tr>
                                                                                <td colSpan="6" className="p-0">
                                                                                    <div className="month-breakdown">
                                                                                        <Table size="sm" className="month-table">
                                                                                            <thead>
                                                                                            <tr>
                                                                                                <th style={{ width: '50px' }}></th>
                                                                                                <th>Month</th>
                                                                                                <th>Days</th>
                                                                                                <th>Total Hours</th>
                                                                                                <th>Avg Hours/Day</th>
                                                                                            </tr>
                                                                                            </thead>
                                                                                            <tbody>
                                                                                            {year.months.map((month) => (
                                                                                                <React.Fragment key={month.month}>
                                                                                                    <tr className="month-row">
                                                                                                        <td>
                                                                                                            <Button
                                                                                                                variant="link"
                                                                                                                size="sm"
                                                                                                                className="p-0"
                                                                                                                onClick={() => toggleMonthExpansion(worker.username, year.year, month.month)}
                                                                                                            >
                                                                                                                {expandedMonths[`${worker.username}_${year.year}_${month.month}`] ?
                                                                                                                    <FaMinus className="text-warning" /> :
                                                                                                                    <FaPlus className="text-warning" />
                                                                                                                }
                                                                                                            </Button>
                                                                                                        </td>
                                                                                                        <td className="fw-bold">{month.month_name}</td>
                                                                                                        <td>{month.days_worked}</td>
                                                                                                        <td className="fw-bold">{formatHours(month.total_hours)}</td>
                                                                                                        <td>{formatHours(month.average_hours_per_day)}</td>
                                                                                                    </tr>

                                                                                                    {/* Expanded Days Section */}
                                                                                                    {expandedMonths[`${worker.username}_${year.year}_${month.month}`] && (
                                                                                                        <tr>
                                                                                                            <td colSpan="5" className="p-0">
                                                                                                                <div className="day-breakdown">
                                                                                                                    <Table size="sm" className="day-table">
                                                                                                                        <thead>
                                                                                                                        <tr>
                                                                                                                            <th>Date</th>
                                                                                                                            <th>Day</th>
                                                                                                                            <th>Entry Time</th>
                                                                                                                            <th>Exit Time</th>
                                                                                                                            <th>Hours Worked</th>
                                                                                                                        </tr>
                                                                                                                        </thead>
                                                                                                                        <tbody>
                                                                                                                        {month.days.map((day) => (
                                                                                                                            <tr key={day.date} className="day-row">
                                                                                                                                <td>{formatDate(day.date)}</td>
                                                                                                                                <td>
                                                                                                                                    <Badge bg="light" text="dark">
                                                                                                                                        {day.day_name}
                                                                                                                                    </Badge>
                                                                                                                                </td>
                                                                                                                                <td>
                                                                                                                                    <Badge bg="success">
                                                                                                                                        {day.entry_time}
                                                                                                                                    </Badge>
                                                                                                                                </td>
                                                                                                                                <td>
                                                                                                                                    <Badge bg="danger">
                                                                                                                                        {day.exit_time}
                                                                                                                                    </Badge>
                                                                                                                                </td>
                                                                                                                                <td className="fw-bold text-primary">
                                                                                                                                    {formatHours(day.hours_worked)}
                                                                                                                                </td>
                                                                                                                            </tr>
                                                                                                                        ))}
                                                                                                                        </tbody>
                                                                                                                    </Table>
                                                                                                                </div>
                                                                                                            </td>
                                                                                                        </tr>
                                                                                                    )}
                                                                                                </React.Fragment>
                                                                                            ))}
                                                                                            </tbody>
                                                                                        </Table>
                                                                                    </div>
                                                                                </td>
                                                                            </tr>
                                                                        )}
                                                                    </React.Fragment>
                                                                ))}
                                                                </tbody>
                                                            </Table>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                                </tbody>
                            </Table>
                        </div>
                    </Card.Body>
                </Card>

                {workers.length === 0 && !loading && (
                    <Card className="modern-card mt-4">
                        <Card.Body className="text-center py-5">
                            <FaClock className="text-muted mb-3" size={48} />
                            <h5>No Time Records Found</h5>
                            <p className="text-muted">No worker time data is available in the system.</p>
                            <Button variant="primary" onClick={fetchWorkerStats}>
                                Refresh Data
                            </Button>
                        </Card.Body>
                    </Card>
                )}
            </Container>

            <Footer/>
        </>
    );
};

export default WorkerTimeList;
