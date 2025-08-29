<?php

namespace App\Http\Controllers;

use App\Models\Food;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class FoodController extends Controller
{
    public function create()
    {
        return Inertia::render('Foods/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'description' => 'nullable|string',
            'price' => 'required|numeric',
            'image' => 'nullable|image|max:2048|mimes:jpeg,png,jpg',
        ]);

        $imagePath = null;
        if ($request->hasfile('image')) {
            $imageName = time() . "." . $request->image->extension();
            $request->image->storeAs('images', $imageName, 'public');
            $imagePath = 'images/' . $imageName;
        }

        Food::create([
            'name' => $validated['name'],
            'description' => $validated['description'],
            'price' => $validated['price'],
            'image' => $imagePath,
        ]);
        return redirect()->route('foods.index')->with('success', 'Food item created successfully');
    }

    public function edit(Food $food)
    {
        return Inertia::render('Foods/Edit', [
            'food' => $food
        ]);
    }

    public function update(Request $request, Food $food)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'description' => 'nullable|string',
            'price' => 'required|numeric',
            'image' => 'nullable|image|max:2048|mimes:jpeg,png,jpg',
        ]);

        if ($request->hasfile('image')) {
            $imageName = time() . "." . $request->image->extension();
            $request->image->storeAs('images', $imageName, 'public');
            $validated['image'] = 'images/' . $imageName;
        } else {
            // Prevent overwriting image with null if no new image is uploaded
            unset($validated['image']);
        }

        $food->update($validated);

        return redirect()->route('foods.index')->with('success', 'Food item updated successfully');
    }

    public function destroy(Food $food)
    {
        if ($food->image) {
            Storage::disk('public')->delete($food->image);
        }

        $food->delete();
        return redirect()->route('foods.index')->with('success', 'Food item deleted successfully');
    }
}
