<?php

namespace App\Http\Controllers;

use App\Models\Table;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TableController extends Controller
{
    public function index()
    {
        return Inertia::render('Tables/Index', [
            'tables' => Table::all(),
        ]);
    }

    public function create()
    {
        return Inertia::render('Tables/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string']
        ]);

        Table::create([
            'name' => $validated['name']
        ]);

        return redirect()->route('tables.index');
    }

    public function edit(Table $table)
    {
        return Inertia::render('Tables/Edit', [
            'table' => $table,
        ]);
    }

    public function update(Request $request, Table $table)
    {
        $validated = $request->validate([
            'name' => ['required', 'string']
        ]);

        $table->update($validated);

        return redirect()->route('tables.index');
    }

    public function destroy(Table $table)
    {
        $table->delete();
        return redirect()->route('tables.index');
    }
}
