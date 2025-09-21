<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    public function up()
    {

        Schema::create('attendances', function (Blueprint $table)
        {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('attendance_type_id')->constrained()->onDelete('cascade');
            $table->datetime('check_in');
            $table->datetime('check_out')->nullable();
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 10, 8)->nullable();
            $table->text('notes')->nullable();
            $table->boolean('is_late')->default(FALSE);
            $table->boolean('is_early')->default(FALSE);
            $table->timestamps();

            $table->index([ 'user_id', 'attendance_type_id' ]);
            $table->index([ 'user_id', 'check_in' ]);
            $table->index([ 'attendance_type_id', 'check_in' ]);
            $table->index('check_in');
            $table->index('check_out');
            $table->index('is_late');
            $table->index('is_early');
            $table->index([ 'user_id', 'check_in', 'check_out' ]);
        });
    }

    public function down()
    {

        Schema::dropIfExists('attendances');
    }

};
