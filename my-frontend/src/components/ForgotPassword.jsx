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

    const validatePassword = (password) => {
        const minLength = password.length >= 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[@$!%*?&]/.test(password);

        return {
            minLength,
            hasUpperCase,
            hasLowerCase,
            hasNumbers,
            hasSpecialChar,
            isValid: minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar
        };
    };

    const [passwordValidation, setPasswordValidation] = useState({
        minLength: false,
        hasUpperCase: false,
        hasLowerCase: false,
        hasNumbers: false,
        hasSpecialChar: false,
        isValid: false
    });

    useEffect(() => {
        const checkAuthentication = async () => {
            if (authLoading) return;

            if (user) {
                setEmail(user.email);
                setIsAuthenticated(true);
                setStep('reset');
                setVerificationCode('logged_in_user');
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
            handleError('Email is required');
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
                handleError('Error while sending the code. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendCode = async () => {
        try {
            await api.get('/sanctum/csrf-cookie');
            await api.post('/api/resend-verification', { email: email });
            setResendSuccess('The code was sent successfully!');
            setCountdown(60);
            setTimeout(() => setResendSuccess(''), 3000);
        } catch (err) {
            handleError('Error while sending the code. Please try again.');
        }
    };

    const handleVerifyCode = async (e) => {
        e.preventDefault();
        if (!verificationCode) {
            handleError('The verification code is required');
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
                    handleError('The verification code is incorrect or expired.');
                }
            } else {
                handleError('The verification code is incorrect or expired.');
            }
        } finally {
            setIsVerifying(false);
        }
    };

    const handlePasswordChange = (field, value) => {
        setPasswords(prev => ({ ...prev, [field]: value }));

        if (field === 'password') {
            setPasswordValidation(validatePassword(value));
        }
    };

    const handlePasswordReset = async (e) => {
        e.preventDefault();
        if (!passwords.password || !passwords.confirmPassword) {
            handleError('All fields are required');
            return;
        }
        if (passwords.password !== passwords.confirmPassword) {
            handleError('Passwords don\'t match');
            return;
        }

        const validation = validatePassword(passwords.password);
        if (!validation.isValid) {
            handleError('Please ensure that the password meets all criteria.');
            return;
        }

        setIsLoading(true);
        try {
            await api.get('/sanctum/csrf-cookie');

            if (isAuthenticated) {
                await api.post('/api/reset-password', {
                    email: email,
                    token: "auth",
                    new_password: passwords.password,
                    new_password_confirmation: passwords.confirmPassword
                });
            } else {
                await api.post('/api/reset-password', {
                    email: email,
                    token: verificationCode,
                    new_password: passwords.password,
                    new_password_confirmation: passwords.confirmPassword
                });
            }

            setAlert('success');
            setError('Password changed successfully. Redirecting...');

            setTimeout(() => {
                if (isAuthenticated) {
                    navigate('/dashboard');
                } else {
                    navigate('/login');
                }
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
                    setStep('reset');
                } else {
                    setStep('email');
                    setEmail('');
                    setVerificationCode('');
                }
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
                            <span className="visually-hidden">Checking...</span>
                        </Spinner>
                        <p className="mt-3">Checking status...</p>
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
                                Enter your email and we'll send you a code to reset your password
                            </p>
                        </div>

                        <Form onSubmit={handleEmailSubmit}>
                            <Form.Group className="mb-4">
                                <Form.Label className="auth-label">Email</Form.Label>
                                <Form.Control
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email"
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
                                        Sending...
                                    </>
                                ) : (
                                    'Send verification code'
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
                                We sent a verification code to <strong>{email}</strong>
                            </p>
                        </div>

                        <Form onSubmit={handleVerifyCode}>
                            <Form.Group className="mb-4">
                                <Form.Label className="auth-label">Verification Code</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={verificationCode}
                                    onChange={(e) => setVerificationCode(e.target.value)}
                                    placeholder="Enter 6-digit code"
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
                                        Verifying...
                                    </>
                                ) : (
                                    'Verify Code'
                                )}
                            </Button>

                            <Button
                                variant="outline-primary"
                                onClick={handleResendCode}
                                disabled={countdown > 0}
                                className="w-100 mb-3"
                                size="lg"
                            >
                                {countdown > 0 ? `Resend code (${countdown}s)` : 'Resend code'}
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
                                {isAuthenticated
                                    ? 'Change your account password.'
                                    : 'Code verified successfully! Now you can set a new password.'
                                }
                            </p>
                        </div>

                        <Form onSubmit={handlePasswordReset}>
                            <Form.Group className="mb-3">
                                <Form.Label className="auth-label">New Password</Form.Label>
                                <div className="password-input-wrapper">
                                    <Form.Control
                                        type={showPassword ? 'text' : 'password'}
                                        value={passwords.password}
                                        onChange={(e) => handlePasswordChange('password', e.target.value)}
                                        placeholder="Enter new password"
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

                                {passwords.password && (
                                    <div className="password-requirements mt-2">
                                        <small className="form-text">
                                            <div className={`requirement ${passwordValidation.minLength ? 'text-success' : 'text-danger'}`}>
                                                <i className={`fas ${passwordValidation.minLength ? 'fa-check' : 'fa-times'} me-1`}></i>
                                                At least 8 characters
                                            </div>
                                            <div className={`requirement ${passwordValidation.hasUpperCase ? 'text-success' : 'text-danger'}`}>
                                                <i className={`fas ${passwordValidation.hasUpperCase ? 'fa-check' : 'fa-times'} me-1`}></i>
                                                One uppercase letter (A-Z)
                                            </div>
                                            <div className={`requirement ${passwordValidation.hasLowerCase ? 'text-success' : 'text-danger'}`}>
                                                <i className={`fas ${passwordValidation.hasLowerCase ? 'fa-check' : 'fa-times'} me-1`}></i>
                                                One lowercase letter (a-z)
                                            </div>
                                            <div className={`requirement ${passwordValidation.hasNumbers ? 'text-success' : 'text-danger'}`}>
                                                <i className={`fas ${passwordValidation.hasNumbers ? 'fa-check' : 'fa-times'} me-1`}></i>
                                                One number (0-9)
                                            </div>
                                            <div className={`requirement ${passwordValidation.hasSpecialChar ? 'text-success' : 'text-danger'}`}>
                                                <i className={`fas ${passwordValidation.hasSpecialChar ? 'fa-check' : 'fa-times'} me-1`}></i>
                                                One special character (@$!%*?&)
                                            </div>
                                        </small>
                                    </div>
                                )}
                            </Form.Group>

                            <Form.Group className="mb-4">
                                <Form.Label className="auth-label">Confirm New Password</Form.Label>
                                <Form.Control
                                    type={showPassword ? 'text' : 'password'}
                                    value={passwords.confirmPassword}
                                    onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                                    placeholder="Confirm new password"
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
                                disabled={isLoading || !passwordValidation.isValid}
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
                                        Changing...
                                    </>
                                ) : (
                                    'Change Password'
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
                return 'Forgot your password?';
            case 'verify':
                return 'Verify your email';
            case 'reset':
                return isAuthenticated ? 'Change password' : 'New password';
            case 'initial':
            default:
                return 'Checking...';
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
                            <div className="text-center mb-4">
                                <a href ='/'>
                                    <img
                                        src={AuthLogo}
                                        alt="Logo"
                                        className="auth-logo"
                                    />
                                </a>
                            </div>

                            <h2 className="auth-title text-center mb-4">
                                {getTitle()}
                            </h2>

                            {getStepContent()}

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

                            {!isAuthenticated && step !== 'initial' && (
                                <p className="text-center mt-4 auth-footer-text">
                                    Remember your password?{' '}
                                    <a href="/login" className="auth-link fw-bold">
                                        Sign in here
                                    </a>
                                </p>
                            )}

                            {isAuthenticated && step !== 'initial' && (
                                <p className="text-center mt-4 auth-footer-text">
                                    <a href="/dashboard" className="auth-link fw-bold">
                                        <i className="fas fa-arrow-left me-2"></i>
                                        Back to dashboard
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
