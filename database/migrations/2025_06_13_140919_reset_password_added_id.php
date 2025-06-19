<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('password_reset_tokens', function (Blueprint $table) {
            // Add id column as primary key at the beginning
            $table->id()->first();

            // Add user_id column after email
            $table->unsignedBigInteger('user_id')->nullable()->after('email');

            // Add foreign key constraint
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');

            // Add index on email for better performance
            $table->index('email');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('password_reset_tokens', function (Blueprint $table) {
            // Drop foreign key first
            $table->dropForeign(['user_id']);

            // Drop the columns
            $table->dropColumn(['id', 'user_id']);

            // Drop index
            $table->dropIndex(['email']);
        });
    }
};
