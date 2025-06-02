<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\HomeController;
Route::get('/', [HomeController::class, 'index']) ->name('home');




Route::view('/about-us', 'about')->name('about');

Route::prefix('admin')->group(function () {
    Route::get('/users', function() {
        return '/admin/users';
    });
});

Route::name('admin.')->group(function () {
    Route::get('/users', function() {

    })->name('users');

});

