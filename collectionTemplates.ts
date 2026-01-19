export interface CollectionField {
  label: string;
  options: string[];
}

export interface CollectionTemplate {
  id: string;
  name: string;
  description: string;
  fields: CollectionField[];
}

export const COLLECTION_TEMPLATES: CollectionTemplate[] = [
  {
    id: 'fashion',
    name: 'Fashion Brands',
    description: 'Clothing, accessories, and style',
    fields: [
      { label: 'Product Categories', options: ['Dresses', 'Tops', 'Bottoms', 'Outerwear', 'Shoes', 'Bags', 'Accessories', 'Jewelry', 'Swimwear', 'Activewear', 'Lingerie', 'Kids'] },
      { label: 'Occasions', options: ['Casual', 'Work', 'Formal', 'Evening', 'Weekend', 'Athletic', 'Special Events'] },
      { label: 'Styles', options: ['Minimalist', 'Maximalist', 'Vintage', 'Modern', 'Bohemian', 'Streetwear', 'Luxury', 'Sustainable'] },
      { label: 'Genders', options: ['Women', 'Men', 'Kids', 'Unisex'] },
      { label: 'Colors', options: ['Black', 'White', 'Neutral', 'Colorful', 'Pastel', 'Patterned'] }
    ]
  },
  {
    id: 'art_galleries',
    name: 'Art Galleries',
    description: 'Curated spaces for visual arts',
    fields: [
        { label: 'Specialties', options: ['Contemporary Art', 'Modern Art', 'Abstract', 'Realism', 'Sculpture', 'Photography', 'Street Art', 'Digital Art', 'Mixed Media', 'Installations'] },
        { label: 'Mediums', options: ['Oil Paintings', 'Acrylics', 'Watercolor', 'Prints', 'Ceramics', 'Textiles', 'Video Art'] },
        { label: 'Focus', options: ['Emerging Artists', 'Established Artists', 'Local Artists', 'International Artists'] }
    ]
  },
  {
    id: 'pottery_studios',
    name: 'Pottery & Ceramics Studios',
    description: 'Handmade functional and decorative art',
    fields: [
      { label: 'Product Categories', options: ['Vases', 'Bowls', 'Plates', 'Cups/Mugs', 'Planters', 'Sculptures', 'Tiles', 'Kitchen Items', 'Bathroom Items', 'Decorative Objects'] },
      { label: 'Techniques', options: ['Hand-thrown', 'Hand-built', 'Slab Construction', 'Wheel-thrown', 'Raku', 'Porcelain', 'Stoneware'] },
      { label: 'Styles', options: ['Minimalist', 'Rustic', 'Modern', 'Traditional', 'Organic', 'Geometric'] }
    ]
  },
  {
    id: 'coffee_roasters',
    name: 'Coffee Roasters & Cafés',
    description: 'Specialty coffee and cozy spots',
    fields: [
      { label: 'Offerings', options: ['Single-Origin', 'Blends', 'Espresso', 'Pour Over', 'Cold Brew', 'Pastries', 'Light Meals'] },
      { label: 'Roast Profiles', options: ['Light Roast', 'Medium Roast', 'Dark Roast', 'Decaf', 'Seasonal'] },
      { label: 'Ambiance', options: ['Cozy', 'Modern', 'Industrial', 'Community-Focused', 'Workspace-Friendly'] }
    ]
  },
  {
    id: 'bookstores',
    name: 'Bookstores & Publishers',
    description: 'Literature, rare finds, and community hubs',
    fields: [
      { label: 'Specialties', options: ["Fiction", "Non-Fiction", "Poetry", "Graphic Novels", "Children's Books", "Rare Books", "Art Books", "Academic"] },
      { label: 'Focus', options: ['Independent Press', 'Large Publisher', 'Local Authors', 'International', 'Vintage'] },
      { label: 'Vibe', options: ['Cozy', 'Modern', 'Academic', 'Community Hub', 'Specialty/Niche'] }
    ]
  },
  {
    id: 'home_decor',
    name: 'Home Decor Brands',
    description: 'Furniture, textiles, and interior accents',
    fields: [
      { label: 'Product Categories', options: ['Textiles', 'Lighting', 'Furniture', 'Wall Art', 'Rugs', 'Pillows', 'Throws', 'Tableware', 'Storage', 'Mirrors'] },
      { label: 'Styles', options: ['Mid-Century Modern', 'Scandinavian', 'Bohemian', 'Industrial', 'Farmhouse', 'Coastal', 'Maximalist', 'Minimalist'] },
      { label: 'Rooms', options: ['Living Room', 'Bedroom', 'Kitchen', 'Bathroom', 'Office', 'Outdoor'] }
    ]
  },
  {
    id: 'furniture_makers',
    name: 'Furniture Makers',
    description: 'Handcrafted and designer furniture',
    fields: [
      { label: 'Product Categories', options: ['Sofas', 'Chairs', 'Tables', 'Beds', 'Storage', 'Desks', 'Outdoor Furniture', 'Lighting', 'Shelving'] },
      { label: 'Materials', options: ['Wood', 'Metal', 'Upholstered', 'Rattan', 'Concrete', 'Glass', 'Reclaimed'] },
      { label: 'Styles', options: ['Modern', 'Vintage', 'Industrial', 'Handcrafted', 'Custom', 'Sustainable'] }
    ]
  },
  {
    id: 'beauty_skincare',
    name: 'Beauty & Skincare Brands',
    description: 'Cosmetics, skincare, and personal care',
    fields: [
      { label: 'Product Categories', options: ['Cleansers', 'Moisturizers', 'Serums', 'Makeup', 'Haircare', 'Body Care', 'Fragrances', 'Tools', 'Sunscreen'] },
      { label: 'Concerns', options: ['Anti-Aging', 'Acne', 'Sensitive Skin', 'Hydration', 'Brightening', 'Natural/Clean'] },
      { label: 'Special Features', options: ['Vegan', 'Cruelty-Free', 'Organic', 'Dermatologist-Tested', 'Gender-Neutral'] }
    ]
  },
  {
    id: 'restaurants_dining',
    name: 'Restaurants & Dining',
    description: 'Culinary experiences and local eateries',
    fields: [
      { label: 'Cuisine Types', options: ['Italian', 'Japanese', 'Mexican', 'French', 'American', 'Fusion', 'Vegan', 'Seafood', 'BBQ', 'Bakery'] },
      { label: 'Occasions', options: ['Casual Dining', 'Fine Dining', 'Brunch', 'Quick Bite', 'Date Night', 'Family-Friendly', 'Takeout'] },
      { label: 'Ambiance', options: ['Cozy', 'Modern', 'Upscale', 'Trendy', 'Historic', 'Outdoor Seating'] }
    ]
  },
  {
    id: 'wineries_distilleries',
    name: 'Wineries & Distilleries',
    description: 'Vineyards, cellars, and craft spirits',
    fields: [
      { label: 'Offerings', options: ['Red Wine', 'White Wine', 'Rosé', 'Sparkling', 'Spirits', 'Tastings', 'Tours', 'Events'] },
      { label: 'Specialties', options: ['Organic', 'Biodynamic', 'Natural Wine', 'Craft Spirits', 'Small Batch', 'Family-Owned'] },
      { label: 'Atmosphere', options: ['Rustic', 'Modern', 'Historic', 'Scenic', 'Intimate'] }
    ]
  },
  {
    id: 'jewelry_designers',
    name: 'Jewelry Designers',
    description: 'Fine, fashion, and handcrafted jewelry',
    fields: [
      { label: 'Product Categories', options: ['Rings', 'Necklaces', 'Earrings', 'Bracelets', 'Brooches', 'Custom Pieces', 'Wedding/Engagement'] },
      { label: 'Materials', options: ['Gold', 'Silver', 'Platinum', 'Gemstones', 'Pearls', 'Alternative Metals', 'Enamel', 'Wood'] },
      { label: 'Styles', options: ['Minimalist', 'Statement', 'Vintage', 'Contemporary', 'Handcrafted', 'Fine Jewelry', 'Fashion Jewelry'] }
    ]
  },
  {
    id: 'stationery',
    name: 'Stationery & Paper Goods',
    description: 'Design-forward paper and desk accessories',
    fields: [
      { label: 'Product Categories', options: ['Notebooks', 'Greeting Cards', 'Planners', 'Pens', 'Art Prints', 'Gift Wrap', 'Desk Accessories', 'Invitations'] },
      { label: 'Styles', options: ['Minimalist', 'Illustrated', 'Vintage', 'Modern', 'Whimiscal', 'Luxury', 'Eco-Friendly'] },
      { label: 'Occasions', options: ['Everyday', 'Wedding', 'Birthday', 'Holidays', 'Thank You', 'Sympathy'] }
    ]
  },
  {
    id: 'outdoor_gear',
    name: 'Outdoor & Adventure Gear',
    description: 'Equipment for hiking, camping, and climbing',
    fields: [
      { label: 'Product Categories', options: ['Backpacks', 'Tents', 'Sleeping Bags', 'Hiking Boots', 'Climbing Gear', 'Camping Equipment', 'Apparel', 'Accessories'] },
      { label: 'Activities', options: ['Hiking', 'Camping', 'Climbing', 'Skiing', 'Cycling', 'Water Sports', 'Travel'] },
      { label: 'Values', options: ['Sustainable', 'Durable', 'Lightweight', 'Technical', 'Eco-Conscious'] }
    ]
  },
  {
    id: 'interior_designers',
    name: 'Interior Designers & Studios',
    description: 'Professional design and styling services',
    fields: [
      { label: 'Specialties', options: ['Residential', 'Commercial', 'Hospitality', 'Sustainable Design', 'Historic Renovation', 'Custom Furniture'] },
      { label: 'Styles', options: ['Modern', 'Traditional', 'Eclectic', 'Scandinavian', 'Mid-Century', 'Coastal', 'Industrial'] },
      { label: 'Services', options: ['Full-Service', 'Consultations', 'E-Design', 'Styling', 'Project Management'] }
    ]
  },
  {
    id: 'plant_shops',
    name: 'Plant Shops & Florists',
    description: 'Houseplants, bouquets, and botanical goods',
    fields: [
      { label: 'Offerings', options: ['Houseplants', 'Succulents', 'Bouquets', 'Arrangements', 'Dried Flowers', 'Plant Care', 'Workshops'] },
      { label: 'Specialties', options: ['Rare Plants', 'Local Flowers', 'Sustainable', 'Seasonal', 'Event Florals', 'Subscriptions'] },
      { label: 'Vibe', options: ['Modern', 'Whimsical', 'Garden-Inspired', 'Educational', 'Community-Focused'] }
    ]
  },
];