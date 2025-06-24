<?php
// Alternative minimal migration
// Run: php artisan make:migration add_missing_user_columns

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // Only add manager_id if it doesn't exist
        if (!Schema::hasColumn('users', 'manager_id')) {
            Schema::table('users', function (Blueprint $table) {
                $table->unsignedBigInteger('manager_id')->nullable()->after('email');
                $table->foreign('manager_id')->references('id')->on('users')->onDelete('set null');
            });
        }

        // If role column exists but needs to be updated to include manager/admin
        if (Schema::hasColumn('users', 'role')) {
            // Modify existing role column to ensure it has all values
            DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('user', 'manager', 'admin') DEFAULT 'user'");
        }
    }

    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'manager_id')) {
                $table->dropForeign(['manager_id']);
                $table->dropColumn('manager_id');
            }
        });
    }
};
