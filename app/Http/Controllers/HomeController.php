<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class HomeController extends Controller
{
    public function index(){
        return view('index', [
            'name' => 'Martin',
            'surname' => 'Caro'
        ]);
    }
}
