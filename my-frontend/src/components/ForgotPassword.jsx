import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Alert, Card, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import api from '../api';
import AuthLogo from '../images/logo.png';
import '../styles/ModernAuth.css';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const [step, setStep] = useState('initial');
    const [email, setEmail] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [passwords, setPasswords] = useState({
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [alert, setAlert] = useState('');
    const [countdown, setCountdown] = useState(0);
    const [resendSuccess, setResendSuccess] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const checkAuthentication = async () => {
            if (authLoading) return;

            if (user) {
                setEmail(user.email);
                setIsAuthenticated(true);
                try {
                    await api.post('/api/request-password-reset', { email: user.email });
                    setStep('verify');
                    setCountdown(60);
                } catch (err) {
                    setError(err.response?.data?.message || 'Failed to send reset code');
                }
            } else {
                setStep('email');
            }
        };

        checkAuthentication();
    }, [user, authLoading]);

    useEffect(() => {
        let timer;
        if (countdown > 0) {
            timer = setInterval(() => {
                setCountdown(prev => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [countdown]);

    const validatePassword = (password) => {
        const hasUpperCase = /[A-Z]/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        return hasUpperCase && hasSpecialChar;
    };

    const handleError = (message, alertType = 'danger') => {
        setError(message);
        setAlert(alertType);
        setTimeout(() => {
            setError('');
        }, 5000);
    };

    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        if (!email) {
            handleError('Email-i është i detyrueshëm');
            return;
        }

        setIsLoading(true);
        try {
            await api.get('/sanctum/csrf-cookie');
            await api.post('/api/request-password-reset', { email: email });
            setStep('verify');
            setCountdown(60);
        } catch (err) {
            if (err.response?.status === 404) {
                handleError('Ky email nuk ekziston.');
            } else {
                handleError('Gabim gjatë dërgimit të kodit. Ju lutemi provoni përsëri.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendCode = async () => {
        try {
            await api.get('/sanctum/csrf-cookie');
            await api.post('/api/resend-verification', { email: email });
            setResendSuccess('Kodi i verifikimit u ridërgua me sukses!');
            setCountdown(60);
            setTimeout(() => setResendSuccess(''), 3000);
        } catch (err) {
            handleError('Gabim gjatë ridërgimit të kodit. Ju lutemi provoni përsëri.');
        }
    };

    const handleVerifyCode = async (e) => {
        e.preventDefault();
        if (!verificationCode) {
            handleError('Kodi i verifikimit është i detyrueshëm');
            return;
        }

        setIsVerifying(true);
        try {
            await api.post('/api/verify-reset-code', {
                email: email,
                token: verificationCode
            });
            setStep('reset');
        } catch (err) {
            if (err.response?.status === 400) {
                const errorMessage = err.response?.data?.message;
                if (errorMessage === 'Kodi i verifikimit ka skaduar.') {
                    handleError('Kodi i verifikimit ka skaduar. Ju lutemi kërkoni një kod të ri.');
                } else if (errorMessage === 'Kodi i verifikimit është i pavlefshëm.') {
                    handleError('Kodi i verifikimit është i pavlefshëm.');
                } else {
                    handleError('Kodi i verifikimit është i pasaktë ose ka skaduar.');
                }
            } else {
                handleError('Kodi i verifikimit është i pasaktë ose ka skaduar.');
            }
        } finally {
            setIsVerifying(false);
        }
    };

    const handlePasswordReset = async (e) => {
        e.preventDefault();
        if (!passwords.password || !passwords.confirmPassword) {
            handleError('Të gjitha fushat janë të detyrueshme');
            return;
        }
        if (passwords.password !== passwords.confirmPassword) {
            handleError('Fjalëkalimet nuk përputhen');
            return;
        }
        if (passwords.password.length < 8 || !validatePassword(passwords.password)) {
            handleError('Fjalëkalimi duhet të jetë të paktën 8 karaktere i gjatë, të përmbajë një shkronjë të madhe dhe një karakter special.');
            return;
        }

        setIsLoading(true);
        try {
            await api.get('/sanctum/csrf-cookie');
            await api.post('/api/reset-password', {
                email: email,
                token: verificationCode,
                new_password: passwords.password,
                new_password_confirmation: passwords.confirmPassword
            });

            setAlert('success');
            setError('Fjalëkalimi u ndryshua me sukses! Po ridrejtoheni...');

            setTimeout(() => {
                navigate('/login');
            }, 2000);

        } catch (err) {
            if (err.response?.status === 400) {
                const errorMessage = err.response?.data?.message;
                if (errorMessage === 'Token has expired.') {
                    handleError('Kodi i verifikimit ka skaduar. Ju lutemi kërkoni një kod të ri.');
                } else if (errorMessage === 'User not found.') {
                    handleError('Përdoruesi nuk u gjet.');
                } else if (errorMessage === 'Invalid request data.') {
                    handleError('Të dhënat e kërkesës janë të pavlefshme.');
                } else if (errorMessage === 'Kodi i verifikimit është i pavlefshëm.') {
                    handleError('Kodi i verifikimit është i pavlefshëm.');
                } else {
                    handleError(errorMessage || 'Gabim gjatë ndryshimit të fjalëkalimit.');
                }
            } else if (err.response?.status === 404) {
                handleError('Përdoruesi nuk u gjet.');
            } else {
                handleError('Gabim gjatë ndryshimit të fjalëkalimit. Ju lutemi provoni përsëri.');
            }

            setTimeout(() => {
                if (isAuthenticated) {
                    setStep('verify');
                } else {
                    setStep('email');
                    setEmail('');
                }
                setVerificationCode('');
            }, 3000);
        } finally {
            setIsLoading(false);
        }
    };

    const getStepContent = () => {
        switch (step) {
            case 'initial':
                return (
                    <div className="text-center">
                        <Spinner animation="border" role="status">
                            <span className="visually-hidden">Duke kontrolluar...</span>
                        </Spinner>
                        <p className="mt-3">Duke kontrolluar gjendjen...</p>
                    </div>
                );

            case 'email':
                return (
                    <div>
                        <div className="text-center mb-4">
                            <div className="forgot-password-icon mb-3">
                                <i className="fas fa-key"></i>
                            </div>
                            <p className="forgot-password-text">
                                Shkruani email-in tuaj dhe ne do t'ju dërgojmë një kod për të rivendosur fjalëkalimin
                            </p>
                        </div>

                        <Form onSubmit={handleEmailSubmit}>
                            <Form.Group className="mb-4">
                                <Form.Label className="auth-label">Email</Form.Label>
                                <Form.Control
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Shkruani email-in tuaj"
                                    className="auth-input"
                                    size="lg"
                                    required
                                />
                            </Form.Group>

                            <Button
                                variant="primary"
                                type="submit"
                                size="lg"
                                className="auth-btn w-100 mb-3"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Spinner
                                            as="span"
                                            animation="border"
                                            size="sm"
                                            role="status"
                                            className="me-2"
                                        />
                                        Duke dërguar...
                                    </>
                                ) : (
                                    'Dërgo kodin e verifikimit'
                                )}
                            </Button>
                        </Form>
                    </div>
                );

            case 'verify':
                return (
                    <div>
                        <div className="text-center mb-4">
                            <div className="verification-icon mb-3">
                                <i className="fas fa-envelope-open"></i>
                            </div>
                            <p className="verification-text">
                                Kemi dërguar një kod verifikimi në <strong>{email}</strong>
                            </p>
                        </div>

                        <Form onSubmit={handleVerifyCode}>
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
                                    required
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
                                    'Verifiko Kodin'
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
                        </Form>
                    </div>
                );

            case 'reset':
                return (
                    <div>
                        <div className="text-center mb-4">
                            <div className="success-icon mb-3">
                                <i className="fas fa-check-circle"></i>
                            </div>
                            <p className="success-text">
                                Kodi u verifikua me sukses! Tani mund të vendosni fjalëkalimin e ri.
                            </p>
                        </div>

                        <Form onSubmit={handlePasswordReset}>
                            <Form.Group className="mb-3">
                                <Form.Label className="auth-label">Fjalëkalimi i ri</Form.Label>
                                <div className="password-input-wrapper">
                                    <Form.Control
                                        type={showPassword ? 'text' : 'password'}
                                        value={passwords.password}
                                        onChange={(e) => setPasswords({ ...passwords, password: e.target.value })}
                                        placeholder="Shkruani fjalëkalimin e ri"
                                        className="auth-input"
                                        size="lg"
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                    </button>
                                </div>
                                <Form.Text className="text-muted small">
                                    Të paktën 8 karaktere, 1 shkronjë e madhe, 1 karakter special
                                </Form.Text>
                            </Form.Group>

                            <Form.Group className="mb-4">
                                <Form.Label className="auth-label">Konfirmo fjalëkalimin e ri</Form.Label>
                                <Form.Control
                                    type={showPassword ? 'text' : 'password'}
                                    value={passwords.confirmPassword}
                                    onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                                    placeholder="Konfirmoni fjalëkalimin e ri"
                                    className="auth-input"
                                    size="lg"
                                    required
                                />
                            </Form.Group>

                            <Button
                                variant="primary"
                                type="submit"
                                size="lg"
                                className="auth-btn w-100"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Spinner
                                            as="span"
                                            animation="border"
                                            size="sm"
                                            role="status"
                                            className="me-2"
                                        />
                                        Duke ndryshuar...
                                    </>
                                ) : (
                                    'Ndrysho Fjalëkalimin'
                                )}
                            </Button>
                        </Form>
                    </div>
                );

            default:
                return null;
        }
    };

    const getTitle = () => {
        switch (step) {
            case 'email':
                return 'Harruat fjalëkalimin?';
            case 'verify':
                return 'Verifikoni email-in';
            case 'reset':
                return 'Fjalëkalimi i ri';
            case 'initial':
            default:
                return 'Duke kontrolluar...';
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
                                <a href ='/'>
                                    <img
                                        src={AuthLogo}
                                        alt="Logo"
                                        className="auth-logo"
                                    />
                                </a>
                            </div>

                            {/* Title */}
                            <h2 className="auth-title text-center mb-4">
                                {getTitle()}
                            </h2>

                            {/* Content */}
                            {getStepContent()}

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

                            {/* Footer Links */}
                            {!isAuthenticated && step !== 'initial' && (
                                <p className="text-center mt-4 auth-footer-text">
                                    Ju kujtua fjalëkalimi?{' '}
                                    <a href="/login" className="auth-link fw-bold">
                                        Hyni këtu
                                    </a>
                                </p>
                            )}

                            {isAuthenticated && step !== 'initial' && (
                                <p className="text-center mt-4 auth-footer-text">
                                    <a href="/dashboard" className="auth-link fw-bold">
                                        <i className="fas fa-arrow-left me-2"></i>
                                        Kthehu në dashboard
                                    </a>
                                </p>
                            )}
                        </Card.Body>
                    </Card>
                </div>
            </Container>
        </div>
    );
};

export default ForgotPassword;
