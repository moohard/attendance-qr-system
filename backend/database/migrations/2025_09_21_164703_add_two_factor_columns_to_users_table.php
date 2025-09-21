<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    public function up()
    {

        Schema::table('users', function (Blueprint $table)
        {
            $table->text('google2fa_secret')->nullable()->after('password');
            $table->boolean('google2fa_enabled')->default(FALSE)->after('google2fa_secret');
            $table->text('backup_codes')->nullable()->after('google2fa_enabled');
        });
    }

    public function down()
    {

        Schema::table('users', function (Blueprint $table)
        {
            $table->dropColumn([ 'google2fa_secret', 'google2fa_enabled', 'backup_codes' ]);
        });
    }

};
