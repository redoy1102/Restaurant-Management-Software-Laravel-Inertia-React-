<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Table;
use App\Models\Food;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create a test user (chef)
        User::factory()->create([
            'name' => 'Chef John',
            'email' => 'chef@example.com',
        ]);

        // Create tables
        Table::create(['name' => 'Table 1']);
        Table::create(['name' => 'Table 2']);
        Table::create(['name' => 'Table 3']);
        Table::create(['name' => 'Table 4']);
        Table::create(['name' => 'Table 5']);

        // Create food items
        Food::create([
            'name' => 'Chicken Biryani',
            'description' => 'Aromatic basmati rice cooked with tender chicken and traditional spices',
            'image' => 'chicken-biryani.jpg',
            'price' => 15.99
        ]);

        Food::create([
            'name' => 'Beef Curry',
            'description' => 'Rich and flavorful beef curry with traditional Bengali spices',
            'image' => 'beef-curry.jpg',
            'price' => 18.99
        ]);

        Food::create([
            'name' => 'Fish Fry',
            'description' => 'Crispy fried fish marinated with spices',
            'image' => 'fish-fry.jpg',
            'price' => 12.99
        ]);

        Food::create([
            'name' => 'Vegetable Curry',
            'description' => 'Mixed vegetables cooked in aromatic curry sauce',
            'image' => 'vegetable-curry.jpg',
            'price' => 10.99
        ]);

        Food::create([
            'name' => 'Chicken Tandoori',
            'description' => 'Marinated chicken grilled in tandoor oven',
            'image' => 'chicken-tandoori.jpg',
            'price' => 16.99
        ]);

        Food::create([
            'name' => 'Lamb Kebab',
            'description' => 'Succulent lamb pieces grilled with herbs and spices',
            'image' => 'lamb-kebab.jpg',
            'price' => 19.99
        ]);
    }
}
