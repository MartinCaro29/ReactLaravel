<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class EmailVerificationToken extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'token',
        'expires_at',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
    ];

    // Relationship with user
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Check if token is expired
    public function isExpired()
    {
        return Carbon::now()->greaterThan($this->expires_at);
    }

    // Generate a new 6-digit token
    public static function generateToken()
    {
        return str_pad(rand(100000, 999999), 6, '0', STR_PAD_LEFT);
    }
}
