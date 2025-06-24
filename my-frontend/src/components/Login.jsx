import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Alert, Card, Spinner } from 'react-bootstrap';
import { useAuth } from './AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';
import AuthLogo from '../images/logo.png';
import '../styles/ModernAuth.css';
import api from '../api';

const Login = () => {
    const navigate = useNavigate();
    const { user, login, loading } = useAuth();

    const [step, setStep] = useState('login');
    const [userLog, setUserLog] = useState({ email: '', password: '' });
    const [verificationCode, setVerificationCode] = useState('');
    const [error, setError] = useState('');
    const [alert, setAlert] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [resendSuccess, setResendSuccess] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        let timer;
        if (countdown > 0) {
            timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
        }
        return () => clearInterval(timer);
    }, [countdown]);

    if (user) {
        return <Navigate to="/dashboard" replace />;
    }

    const handleChange = (e) => {
        setUserLog({ ...userLog, [e.target.name]: e.target.value });
        setError('');
        setAlert('');
    };

    const handleError = (message, alertType = 'danger') => {
        setError(message);
        setAlert(alertType);
        setTimeout(() => setError(''), 5000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!userLog.email || !userLog.password) {
            handleError('Please fill in all fields!');
            return;
        }

        try {
            const response = await login(userLog.email, userLog.password, rememberMe);

            if (response.needsVerification) {
                setStep('verify');
                setCountdown(60);
                return;
            }

            navigate('/dashboard');
        } catch (err) {
            // Enhanced error handling for specific cases
            if (err.response?.status === 401) {
                handleError('Invalid email or password. Please check your credentials and try again.');
            } else if (err.response?.status === 429) {
                handleError('Too many login attempts. Please wait a few minutes before trying again.');
            } else if (err.response?.status === 422) {
                handleError('Please enter a valid email address.');
            } else if (err.response?.data?.error) {
                handleError(err.response.data.error);
            } else {
                const errorMessage = err.error || err.message || 'Email or password is incorrect. Please check and try again.';
                handleError(errorMessage);
            }
        }
    };

    const handleVerifyEmail = async (e) => {
        e.preventDefault();
        setIsVerifying(true);

        try {
            const response = await api.post('/api/verify-email', {
                email: userLog.email,
                token: verificationCode,
            });

            setAlert('success');
            setError('Email verified successfully! Redirecting...');

            setTimeout(() => {
                navigate('/dashboard');
            }, 2000);

        } catch (err) {
            setIsVerifying(false);
            const errorMsg = err.response?.data === 'Token not found or expired.' ? 'Verification code not found or expired.' :
                err.response?.data === 'Token has expired.' ? 'Verification code has expired.' :
                    err.response?.data === 'Invalid token.' ? 'Invalid verification code.' :
                        'Error during verification. Please try again.';

            handleError(errorMsg);
        }
    };

    const handleResendCode = async () => {
        try {
            await api.post('/api/resend-verification', { email: userLog.email });
            setResendSuccess('Verification code resent successfully!');
            setCountdown(60);
            setTimeout(() => setResendSuccess(''), 3000);
        } catch (err) {
            handleError('Error resending code. Please try again.');
        }
    };

    return (
        <div className="modern-auth-container">
            <div className="auth-background">
                <div className="auth-overlay"></div>
                <div className="floating-shapes">
                    <div className="shape shape-1"></div>
                    <div className="shape shape-2"></div>
                    <div className="shape shape-3"></div>
                    <div className="shape shape-4"></div>
                </div>
            </div>

            <Container className="h-100 d-flex align-items-center justify-content-center">
                <div className="auth-card-wrapper">
                    <Card className="auth-card shadow-lg">
                        <Card.Body className="p-4 p-md-5">
                            {/* Logo */}
                            <div className="text-center mb-4">
                                <img
                                    src={AuthLogo}
                                    alt="Logo"
                                    className="auth-logo"
                                />
                            </div>

                            {/* Title */}
                            <h2 className="auth-title text-center mb-4">
                                {step === 'login' ? 'Mirë se erdhët përsëri' : 'Verifikoni Email-in'}
                            </h2>

                            {step === 'login' && (
                                <p className="auth-subtitle text-center mb-4">
                                    Hyni në llogarinë tuaj për të vazhduar
                                </p>
                            )}

                            {/* Login Form */}
                            {step === 'login' ? (
                                <Form onSubmit={handleSubmit}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="auth-label">Email</Form.Label>
                                        <Form.Control
                                            type="email"
                                            name="email"
                                            value={userLog.email}
                                            onChange={handleChange}
                                            placeholder="Shkruani email-in tuaj"
                                            className="auth-input"
                                            size="lg"
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label className="auth-label">Fjalëkalimi</Form.Label>
                                        <div className="password-input-wrapper">
                                            <Form.Control
                                                type={showPassword ? 'text' : 'password'}
                                                name="password"
                                                value={userLog.password}
                                                onChange={handleChange}
                                                placeholder="Shkruani fjalëkalimin tuaj"
                                                className="auth-input"
                                                size="lg"
                                            />
                                            <button
                                                type="button"
                                                className="password-toggle"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                            </button>
                                        </div>
                                    </Form.Group>

                                    <div className="d-flex justify-content-between align-items-center mb-4">
                                        <Form.Check
                                            type="checkbox"
                                            id="remember-me"
                                            label="Më mbaj mend"
                                            checked={rememberMe}
                                            onChange={() => setRememberMe(!rememberMe)}
                                            className="auth-checkbox"
                                        />
                                        <a href="/forgotpassword" className="auth-link">
                                            Harruat fjalëkalimin?
                                        </a>
                                    </div>

                                    <Button
                                        variant="primary"
                                        type="submit"
                                        size="lg"
                                        className="auth-btn w-100 mb-3"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <Spinner
                                                    as="span"
                                                    animation="border"
                                                    size="sm"
                                                    role="status"
                                                    className="me-2"
                                                />
                                                Duke u kyçur...
                                            </>
                                        ) : (
                                            'Hyr'
                                        )}
                                    </Button>

                                    <p className="text-center auth-footer-text">
                                        Nuk keni një llogari?{' '}
                                        <a href="/register" className="auth-link fw-bold">
                                            Regjistrohuni këtu
                                        </a>
                                    </p>
                                </Form>
                            ) : (
                                /* Verification Form */
                                <div>
                                    <div className="text-center mb-4">
                                        <div className="verification-icon mb-3">
                                            <i className="fas fa-envelope-open"></i>
                                        </div>
                                        <p className="verification-text">
                                            Kemi dërguar një kod verifikimi në <strong>{userLog.email}</strong>
                                        </p>
                                    </div>

                                    <Form onSubmit={handleVerifyEmail}>
                                        <Form.Group className="mb-4">
                                            <Form.Label className="auth-label">Kodi i Verifikimit</Form.Label>
                                            <Form.Control
                                                type="text"
                                                value={verificationCode}
                                                onChange={(e) => setVerificationCode(e.target.value)}
                                                placeholder="Shkruani kodin 6-shifror"
                                                className="auth-input text-center"
                                                size="lg"
                                                maxLength="6"
                                            />
                                        </Form.Group>

                                        <Button
                                            variant="primary"
                                            type="submit"
                                            size="lg"
                                            className="auth-btn w-100 mb-3"
                                            disabled={isVerifying}
                                        >
                                            {isVerifying ? (
                                                <>
                                                    <Spinner
                                                        as="span"
                                                        animation="border"
                                                        size="sm"
                                                        role="status"
                                                        className="me-2"
                                                    />
                                                    Duke verifikuar...
                                                </>
                                            ) : (
                                                'Verifiko Email-in'
                                            )}
                                        </Button>

                                        <Button
                                            variant="outline-primary"
                                            onClick={handleResendCode}
                                            disabled={countdown > 0}
                                            className="w-100 mb-3"
                                            size="lg"
                                        >
                                            {countdown > 0 ? `Ridërgo kodin (${countdown}s)` : 'Ridërgo kodin'}
                                        </Button>

                                        <div className="text-center">
                                            <button
                                                type="button"
                                                className="btn btn-link auth-link"
                                                onClick={() => setStep('login')}
                                            >
                                                <i className="fas fa-arrow-left me-2"></i>
                                                Kthehu te hyrja
                                            </button>
                                        </div>
                                    </Form>
                                </div>
                            )}

                            {/* Alerts */}
                            {error && (
                                <Alert variant={alert} className="mt-3 auth-alert">
                                    <i className={`fas ${alert === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle'} me-2`}></i>
                                    {error}
                                </Alert>
                            )}

                            {resendSuccess && (
                                <Alert variant="success" className="mt-3 auth-alert">
                                    <i className="fas fa-check-circle me-2"></i>
                                    {resendSuccess}
                                </Alert>
                            )}
                        </Card.Body>
                    </Card>
                </div>
            </Container>
        </div>
    );
};

export default Login;
