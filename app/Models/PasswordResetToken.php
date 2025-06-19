<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class PasswordResetToken extends Model
{
    use HasFactory;

    protected $fillable = [
        'email',
        'token',
        'expires_at',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }


    public function isExpired()
    {
        return Carbon::now()->greaterThan($this->expires_at);
    }

    public static function generateToken()
    {
        return str_pad(rand(100000, 999999), 6, '0', STR_PAD_LEFT);
    }
}
