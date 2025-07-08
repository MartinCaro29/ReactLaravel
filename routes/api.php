<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ForgotPasswordController;
use App\Http\Controllers\WorkerTimeController;

// Public routes (no authentication required)
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/verify-email', [AuthController::class, 'verifyEmail']);
Route::post('/resend-verification', [AuthController::class, 'resendVerification']);
Route::post('/reset-password', [ForgotPasswordController::class, 'resetPassword']);
Route::post('/request-password-reset', [ForgotPasswordController::class, 'requestPasswordReset']);
Route::post('/verify-reset-code', [ForgotPasswordController::class, 'verifyResetCode']);

// Protected routes (authentication required)
Route::middleware(['auth:sanctum'])->group(function () {
    // Auth routes
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // User management routes
    Route::get('/users', [UserController::class, 'getAllUsers']);
    Route::post('/users', [UserController::class, 'createUser']); // ADD THIS LINE
    Route::put('/users/{id}', [UserController::class, 'updateUser']);
    Route::delete('/users/{id}', [UserController::class, 'deleteUser']);
    Route::get('/managers', [UserController::class, 'getManagers']);

    Route::get('/worker-time/stats', [WorkerTimeController::class, 'getWorkerStats']);
    Route::get('/worker-time/summary', [WorkerTimeController::class, 'getSummaryStats']);
    Route::get('/worker-time/{username}/export', [WorkerTimeController::class, 'exportWorkerData']); // Optional
});
