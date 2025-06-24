<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'username',
        'email',
        'password',
        'email_verified_at',
        'remember_token',
        'manager_id',
        'role',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'email_verified' => 'boolean',
        ];
    }

    // Relationship with verification tokens
    public function verificationTokens()
    {
        return $this->hasOne(EmailVerificationToken::class);
    }

    // Relationship with manager
    public function manager()
    {
        return $this->belongsTo(User::class, 'manager_id');
    }

    // Relationship with subordinates
    public function subordinates()
    {
        return $this->hasMany(User::class, 'manager_id');
    }

    // Check if user can edit another user
    public function canEdit(User $targetUser)
    {
        // Admin can edit everyone except themselves
        if ($this->role === 'admin') {
            return $this->id !== $targetUser->id;
        }

        // Manager can edit their subordinates
        if ($this->role === 'manager') {
            return $targetUser->manager_id === $this->id;
        }

        // Regular users can't edit anyone
        return false;
    }

    // Check if user can delete another user
    public function canDelete(User $targetUser)
    {
        return $this->canEdit($targetUser);
    }
}
