<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    public function up()
    {

        Schema::create('reports', function (Blueprint $table)
        {
            $table->id();
            $table->string('period'); // Format: Y-m (e.g., 2024-01)
            $table->foreignId('attendance_type_id')->nullable()->constrained()->onDelete('set null');
            $table->string('file_path')->nullable();
            $table->boolean('is_signed')->default(FALSE);
            $table->timestamp('signed_at')->nullable();
            $table->text('signature_data')->nullable();
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index('period');
            $table->index('is_signed');
            $table->index([ 'period', 'attendance_type_id' ]);
        });
    }

    public function down()
    {

        Schema::dropIfExists('reports');
    }

};
