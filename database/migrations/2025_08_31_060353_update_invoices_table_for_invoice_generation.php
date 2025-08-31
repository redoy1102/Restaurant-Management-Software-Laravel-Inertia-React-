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
        Schema::table('invoices', function (Blueprint $table) {
            $table->string('invoice_number')->unique()->after('order_id');
            $table->decimal('subtotal', 10, 2)->nullable()->after('total_amount');
            $table->decimal('tax_amount', 10, 2)->default(0)->after('subtotal');
            $table->decimal('discount_amount', 10, 2)->default(0)->after('tax_amount');
            $table->string('payment_method')->nullable()->after('status');
            $table->timestamp('issued_at')->nullable()->after('payment_method');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            $table->dropColumn([
                'invoice_number',
                'subtotal',
                'tax_amount',
                'discount_amount',
                'payment_method',
                'issued_at'
            ]);
        });
    }
};
