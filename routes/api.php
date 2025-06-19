<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ForgotPasswordController;

// Public routes (no authentication required)
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/verify-email', [AuthController::class, 'verifyEmail']);
Route::post('/resend-verification', [AuthController::class, 'resendVerification']);
Route::post('/reset-password', [ForgotPasswordController::class, 'resetPassword']);
Route::post('/request-password-reset', [ForgotPasswordController::class, 'requestPasswordReset']);
Route::post('/verify-reset-code', [ForgotPasswordController::class, 'verifyResetCode']);
Route::post('/resend-verification', [ForgotPasswordController::class, 'resendVerification']);
// Protected routes (authentication required)
Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);
});

