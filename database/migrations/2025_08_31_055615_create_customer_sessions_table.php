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
        Schema::create('customer_sessions', function (Blueprint $table) {
            $table->id();
            $table->string('session_token')->unique();
            $table->foreignId('table_id')->constrained('tables');
            $table->string('customer_name')->nullable();
            $table->string('customer_phone')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('customer_sessions');
    }
};
