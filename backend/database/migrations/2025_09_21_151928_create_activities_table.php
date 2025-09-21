<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    public function up()
    {

        Schema::create('activities', function (Blueprint $table)
        {
            $table->id();
            $table->string('name'); // Nama kegiatan: Rapat, Apel, Briefing, dll
            $table->text('description')->nullable();
            $table->time('start_time'); // Waktu mulai kegiatan
            $table->time('end_time'); // Waktu selesai kegiatan
            $table->boolean('is_recurring')->default(FALSE); // Kegiatan rutin atau tidak
            $table->json('recurring_days')->nullable(); // Hari pengulangan [1,2,3,4,5] untuk Senin-Jumat
            $table->date('valid_from')->nullable(); // Berlaku dari tanggal
            $table->date('valid_to')->nullable(); // Berlaku sampai tanggal
            $table->boolean('is_active')->default(TRUE);
            $table->foreignId('created_by')->constrained('users');
            $table->timestamps();
            $table->softDeletes();
            $table->index([ 'is_active', 'is_recurring' ]);
            $table->index([ 'valid_from', 'valid_to' ]);
            $table->index('created_by');
        });

        Schema::create('activity_attendance', function (Blueprint $table)
        {
            $table->id();
            $table->foreignId('activity_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->datetime('check_in');
            $table->datetime('check_out')->nullable();
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 10, 8)->nullable();
            $table->text('notes')->nullable();
            $table->boolean('is_late')->default(FALSE);
            $table->boolean('is_early')->default(FALSE);
            $table->timestamps();

            $table->unique([ 'activity_id', 'user_id', 'check_in' ]);
            $table->index([ 'activity_id', 'user_id', 'check_in' ]);
            $table->index([ 'user_id', 'check_in' ]);
            $table->index([ 'activity_id', 'check_in' ]);
            $table->index('check_in');
            $table->index('check_out');
        });
    }

    public function down()
    {

        Schema::dropIfExists('activity_attendance');
        Schema::dropIfExists('activities');
    }

};
