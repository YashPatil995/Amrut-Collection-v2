// Seed script for Amrut Collection
import { db } from '../src/lib/db'

// Image pools gathered via image-search
const IMG = {
  hero: [
    "https://sfile.chatglm.cn/images-ppt/9e1133c681b3.jpg",
    "https://sfile.chatglm.cn/images-ppt/268025ca9eb9.jpg",
    "https://sfile.chatglm.cn/images-ppt/ded3f8f6977c.jpg",
    "https://sfile.chatglm.cn/images-ppt/6648926abf81.jpg",
    "https://sfile.chatglm.cn/images-ppt/e2d25549dc5e.jpg",
    "https://sfile.chatglm.cn/images-ppt/0a47502a7ad9.jpg",
    "https://sfile.chatglm.cn/images-ppt/24088694756b.jpg",
    "https://sfile.chatglm.cn/images-ppt/f42d2e47b206.jpg",
  ],
  men: [
    "https://sfile.chatglm.cn/images-ppt/c3288b45ad94.jpg",
    "https://sfile.chatglm.cn/images-ppt/91e912b6a690.jpg",
    "https://sfile.chatglm.cn/images-ppt/f2873c189e41.webp",
    "https://sfile.chatglm.cn/images-ppt/eddb66449c26.jpg",
    "https://sfile.chatglm.cn/images-ppt/6dbdb0583486.jpg",
    "https://sfile.chatglm.cn/images-ppt/012299e613c2.png",
    "https://sfile.chatglm.cn/images-ppt/4d2dd62c69b1.jpg",
    "https://sfile.chatglm.cn/images-ppt/6f778a40bc8a.png",
  ],
  men2: [
    "https://sfile.chatglm.cn/images-ppt/6c74416330e9.webp",
    "https://sfile.chatglm.cn/images-ppt/147b389cdd3b.jpg",
    "https://sfile.chatglm.cn/images-ppt/4486d511e444.jpg",
    "https://sfile.chatglm.cn/images-ppt/2372107e2a6a.jpeg",
    "https://sfile.chatglm.cn/images-ppt/049fcb05d301.jpg",
    "https://sfile.chatglm.cn/images-ppt/98a8a966779c.jpg",
  ],
  women: [
    "https://sfile.chatglm.cn/images-ppt/c970047c73ec.jpg",
    "https://sfile.chatglm.cn/images-ppt/da6ec4d267e9.jpg",
    "https://sfile.chatglm.cn/images-ppt/c6be089b1c41.jpg",
    "https://sfile.chatglm.cn/images-ppt/bbee72084086.jpeg",
    "https://sfile.chatglm.cn/images-ppt/0fb9ae52d589.jpg",
    "https://sfile.chatglm.cn/images-ppt/2dfda303c154.jpg",
    "https://sfile.chatglm.cn/images-ppt/527f7d6aeb7f.jpeg",
    "https://sfile.chatglm.cn/images-ppt/5d86ef7ab147.jpg",
  ],
  women2: [
    "https://sfile.chatglm.cn/images-ppt/0ffa57ec7084.jpg",
    "https://sfile.chatglm.cn/images-ppt/e3cee721c69d.jpg",
    "https://sfile.chatglm.cn/images-ppt/d5ee92a4b174.jpg",
    "https://sfile.chatglm.cn/images-ppt/7124b2c217fe.webp",
    "https://sfile.chatglm.cn/images-ppt/dee5d86a5c7e.jpg",
  ],
  sarees: [
    "https://sfile.chatglm.cn/images-ppt/270381d0ff13.jpg",
    "https://sfile.chatglm.cn/images-ppt/c0a4c0671dfc.jpg",
    "https://sfile.chatglm.cn/images-ppt/8159ae69c369.png",
    "https://sfile.chatglm.cn/images-ppt/cbd8cab27be7.jpg",
    "https://sfile.chatglm.cn/images-ppt/6117c81034a2.jpg",
    "https://sfile.chatglm.cn/images-ppt/0eedad0a433f.jpg",
  ],
  kids: [
    "https://sfile.chatglm.cn/images-ppt/29e02e8a37f7.jpg",
    "https://sfile.chatglm.cn/images-ppt/9de7dcb0bb22.jpg",
    "https://sfile.chatglm.cn/images-ppt/6e036f6a9955.jpg",
    "https://sfile.chatglm.cn/images-ppt/c59f4145111d.jpg",
    "https://sfile.chatglm.cn/images-ppt/1d8343de0877.jpg",
    "https://sfile.chatglm.cn/images-ppt/0fa707b8fc75.jpg",
  ],
  accessories: [
    "https://sfile.chatglm.cn/images-ppt/a40008d1abae.png",
    "https://sfile.chatglm.cn/images-ppt/ae798dc5b62b.jpg",
    "https://sfile.chatglm.cn/images-ppt/6eca623282f2.jpg",
    "https://sfile.chatglm.cn/images-ppt/a884c3b136ed.jpg",
    "https://sfile.chatglm.cn/images-ppt/408e9cfb63b6.jpg",
    "https://sfile.chatglm.cn/images-ppt/73a784f872e6.jpg",
  ],
  footwear: [
    "https://sfile.chatglm.cn/images-ppt/e8b049cb85e7.jpg",
    "https://sfile.chatglm.cn/images-ppt/f53fe7405a2b.webp",
    "https://sfile.chatglm.cn/images-ppt/d2b2273a313d.jpg",
    "https://sfile.chatglm.cn/images-ppt/b86766d4aafa.jpg",
    "https://sfile.chatglm.cn/images-ppt/a03e425e1416.png",
  ],
}

const S = JSON.stringify

const brands = [
  { name: "FabIndia", slug: "fabindia", country: "India" },
  { name: "Manyavar", slug: "manyavar", country: "India" },
  { name: "Biba", slug: "biba", country: "India" },
  { name: "Aurelia", slug: "aurelia", country: "India" },
  { name: "Global Desi", slug: "global-desi", country: "India" },
  { name: "Allen Solly", slug: "allen-solly", country: "India" },
  { name: "Peter England", slug: "peter-england", country: "India" },
  { name: "Levi's", slug: "levis", country: "USA" },
  { name: "Roadster", slug: "roadster", country: "India" },
  { name: "U.S. Polo Assn.", slug: "us-polo-assn", country: "USA" },
  { name: "Van Heusen", slug: "van-heusen", country: "India" },
  { name: "Killer", slug: "killer", country: "India" },
]

// categories: men/women/kids + subcategories
const categories = [
  { name: "Men", slug: "men", gender: "men", icon: "Men", image: IMG.men[0] },
  { name: "Women", slug: "women", gender: "women", icon: "Women", image: IMG.women[0] },
  { name: "Kids", slug: "kids", gender: "kids", icon: "Baby", image: IMG.kids[0] },
  // Men sub
  { name: "Shirts", slug: "men-shirts", gender: "men", parent: "men", image: IMG.men[1] },
  { name: "T-Shirts", slug: "men-tshirts", gender: "men", parent: "men", image: IMG.men2[4] },
  { name: "Jeans", slug: "men-jeans", gender: "men", parent: "men", image: IMG.men2[0] },
  { name: "Jackets", slug: "men-jackets", gender: "men", parent: "men", image: IMG.men2[1] },
  { name: "Ethnic Wear", slug: "men-ethnic", gender: "men", parent: "men", image: IMG.men[2] },
  { name: "Footwear", slug: "men-footwear", gender: "men", parent: "men", image: IMG.footwear[0] },
  // Women sub
  { name: "Sarees", slug: "women-sarees", gender: "women", parent: "women", image: IMG.sarees[0] },
  { name: "Kurtis", slug: "women-kurtis", gender: "women", parent: "women", image: IMG.women[2] },
  { name: "Dresses", slug: "women-dresses", gender: "women", parent: "women", image: IMG.women[4] },
  { name: "Tops", slug: "women-tops", gender: "women", parent: "women", image: IMG.women[5] },
  { name: "Ethnic Sets", slug: "women-ethnic-sets", gender: "women", parent: "women", image: IMG.women2[0] },
  { name: "Handbags", slug: "women-handbags", gender: "women", parent: "women", image: IMG.accessories[1] },
  { name: "Jewellery", slug: "women-jewellery", gender: "women", parent: "women", image: IMG.accessories[0] },
  // Kids sub
  { name: "Boys Clothing", slug: "kids-boys", gender: "kids", parent: "kids", image: IMG.kids[1] },
  { name: "Girls Clothing", slug: "kids-girls", gender: "kids", parent: "kids", image: IMG.kids[2] },
  { name: "Party Wear", slug: "kids-party", gender: "kids", parent: "kids", image: IMG.kids[3] },
]

type PSeed = {
  name: string; slug: string; desc: string; fabric: string; material: string; wash: string;
  price: number; mrp: number; stock: number; rating: number; reviewCount: number; sold: number;
  colors: string[]; sizes: string[]; patterns: string[]; images: string[]; tags: string[];
  gender: string; brandIdx: number; catSlug: string;
  isTrending?: boolean; isNew?: boolean; isBestseller?: boolean; isFeatured?: boolean;
}

const products: PSeed[] = [
  // ---- MEN ----
  { name: "Royal Silk Kurta Pajama Set", slug: "royal-silk-kurta-set", desc: "An exquisite silk kurta pajama set crafted for festive occasions. Features intricate thread embroidery on the placket and a mandarin collar. Perfect for weddings, pujas and cultural celebrations.", fabric: "Pure Silk", material: "Art Silk with cotton lining", wash: "Dry clean only. Do not bleach. Iron at low temperature.", price: 3499, mrp: 5999, stock: 24, rating: 4.7, reviewCount: 128, sold: 342, colors: ["Maroon","Cream","Olive"], sizes: ["S","M","L","XL","XXL"], patterns: ["Embroidered","Solid"], images: [IMG.men[2],IMG.men[3],IMG.hero[3]], tags: ["festive","ethnic","wedding"], gender: "men", brandIdx: 1, catSlug: "men-ethnic", isTrending: true, isBestseller: true, isFeatured: true },
  { name: "Premium Cotton Formal Shirt", slug: "premium-cotton-formal-shirt", desc: "A timeless formal shirt in breathable cotton with a tailored fit. Crisp collar and mother-of-pearl buttons make it an office wardrobe essential.", fabric: "100% Cotton", material: "Combed Cotton", wash: "Machine wash cold. Do not bleach. Tumble dry low.", price: 1299, mrp: 2199, stock: 56, rating: 4.5, reviewCount: 86, sold: 210, colors: ["White","Sky Blue","Ivory"], sizes: ["38","40","42","44"], patterns: ["Solid","Striped"], images: [IMG.men[0],IMG.men[1]], tags: ["formal","office"], gender: "men", brandIdx: 5, catSlug: "men-shirts", isBestseller: true },
  { name: "Slim Fit Casual Denim Shirt", slug: "slim-fit-denim-shirt", desc: "A versatile denim shirt with a modern slim fit. Soft-washed cotton denim that pairs effortlessly with chinos or jeans.", fabric: "Cotton Denim", material: "100% Cotton", wash: "Machine wash cold inside out. Do not bleach.", price: 1599, mrp: 2799, stock: 40, rating: 4.4, reviewCount: 54, sold: 132, colors: ["Indigo","Olive"], sizes: ["S","M","L","XL"], patterns: ["Solid"], images: [IMG.men[4],IMG.men2[3]], tags: ["casual","denim"], gender: "men", brandIdx: 7, catSlug: "men-shirts", isNew: true },
  { name: "Classic Crew Neck T-Shirt", slug: "classic-crew-neck-tshirt", desc: "Everyday comfort meets style in this premium combed cotton t-shirt. Ribbed crew neck and a relaxed regular fit.", fabric: "Cotton Jersey", material: "100% Combed Cotton", wash: "Machine wash cold. Do not bleach. Tumble dry low.", price: 599, mrp: 999, stock: 120, rating: 4.3, reviewCount: 210, sold: 540, colors: ["Matte Black","Olive","Cream","Maroon"], sizes: ["S","M","L","XL","XXL"], patterns: ["Solid"], images: [IMG.men2[4],IMG.men2[5]], tags: ["casual","essentials"], gender: "men", brandIdx: 8, catSlug: "men-tshirts", isBestseller: true },
  { name: "Stretch Slim Fit Jeans", slug: "stretch-slim-fit-jeans", desc: "Dark wash stretch denim jeans with a slim leg. Engineered for comfort with a hint of elastane for all-day mobility.", fabric: "Stretch Denim", material: "98% Cotton 2% Elastane", wash: "Machine wash cold inside out. Do not bleach.", price: 1899, mrp: 3299, stock: 48, rating: 4.5, reviewCount: 96, sold: 268, colors: ["Indigo","Matte Black"], sizes: ["30","32","34","36","38"], patterns: ["Solid"], images: [IMG.men2[0],IMG.men2[2]], tags: ["casual","denim"], gender: "men", brandIdx: 9, catSlug: "men-jeans", isTrending: true },
  { name: "Quilted Bomber Jacket", slug: "quilted-bomber-jacket", desc: "A stylish quilted bomber jacket with a ribbed hem and cuffs. Lightweight warmth for transitional weather.", fabric: "Polyester", material: "Polyester shell, polyester lining", wash: "Machine wash cold. Do not bleach. Tumble dry low.", price: 2499, mrp: 4499, stock: 22, rating: 4.6, reviewCount: 41, sold: 88, colors: ["Olive","Matte Black","Maroon"], sizes: ["M","L","XL"], patterns: ["Quilted"], images: [IMG.men2[1],IMG.men2[3]], tags: ["winter","outerwear"], gender: "men", brandIdx: 11, catSlug: "men-jackets", isNew: true, isFeatured: true },
  { name: "Handwoven Linen Nehru Jacket", slug: "linen-nehru-jacket", desc: "A handwoven linen Nehru jacket in earthy tones. Pair it with a kurta or shirt for a refined indo-western look.", fabric: "Pure Linen", material: "100% Linen", wash: "Dry clean recommended. Cool iron.", price: 2999, mrp: 4999, stock: 18, rating: 4.8, reviewCount: 33, sold: 64, colors: ["Beige","Olive","Cream"], sizes: ["38","40","42","44"], patterns: ["Solid","Textured"], images: [IMG.men[5],IMG.men[7]], tags: ["festive","indo-western"], gender: "men", brandIdx: 0, catSlug: "men-ethnic", isFeatured: true },
  { name: "Handcrafted Leather Loafers", slug: "leather-loafers", desc: "Genuine leather loafers with a cushioned footbed and slip-resistant sole. Timeless slip-on style for any occasion.", fabric: "Leather", material: "Genuine Leather", wash: "Wipe with damp cloth. Use leather conditioner.", price: 2199, mrp: 3999, stock: 30, rating: 4.5, reviewCount: 62, sold: 144, colors: ["Tan","Matte Black","Brown"], sizes: ["6","7","8","9","10","11"], patterns: ["Solid"], images: [IMG.footwear[0],IMG.footwear[2]], tags: ["footwear","leather"], gender: "men", brandIdx: 11, catSlug: "men-footwear", isTrending: true },

  // ---- WOMEN ----
  { name: "Banarasi Silk Saree with Zari Border", slug: "banarasi-silk-saree", desc: "A regal Banarasi silk saree woven with golden zari motifs and a richly brocaded border. Comes with an unstitched blouse piece.", fabric: "Pure Silk", material: "Banarasi Art Silk", wash: "Dry clean only. Store in muslin cloth.", price: 4999, mrp: 8999, stock: 16, rating: 4.9, reviewCount: 154, sold: 220, colors: ["Maroon","Red","Royal Blue","Emerald"], sizes: ["Free Size"], patterns: ["Woven","Zari"], images: [IMG.sarees[0],IMG.sarees[1],IMG.sarees[2]], tags: ["festive","wedding","saree"], gender: "women", brandIdx: 2, catSlug: "women-sarees", isTrending: true, isBestseller: true, isFeatured: true },
  { name: "Kanjivaram Festive Saree", slug: "kanjivaram-festive-saree", desc: "Lustrous Kanjivaram silk saree with contrast pallu and temple border. A timeless heirloom piece for celebrations.", fabric: "Pure Silk", material: "Kanjivaram Silk", wash: "Dry clean only.", price: 6499, mrp: 11999, stock: 12, rating: 4.8, reviewCount: 88, sold: 130, colors: ["Maroon","Peacock Blue","Gold"], sizes: ["Free Size"], patterns: ["Woven","Temple Border"], images: [IMG.sarees[3],IMG.sarees[4],IMG.sarees[5]], tags: ["festive","wedding","saree"], gender: "women", brandIdx: 2, catSlug: "women-sarees", isFeatured: true },
  { name: "Anarkali Kurti with Churidar", slug: "anarkali-kurti-churidar", desc: "A flowing Anarkali kurti with intricate yoke embroidery and a matching churidar. Floor-length silhouette for graceful elegance.", fabric: "Rayon", material: "Premium Rayon", wash: "Hand wash cold. Do not bleach. Dry in shade.", price: 1799, mrp: 3299, stock: 38, rating: 4.6, reviewCount: 102, sold: 256, colors: ["Maroon","Teal","Cream","Olive"], sizes: ["XS","S","M","L","XL","XXL"], patterns: ["Embroidered","Printed"], images: [IMG.women[0],IMG.women[1]], tags: ["ethnic","festive"], gender: "women", brandIdx: 3, catSlug: "women-kurtis", isBestseller: true, isTrending: true },
  { name: "Straight Cut Cotton Kurti", slug: "straight-cut-cotton-kurti", desc: "A breezy straight-cut cotton kurti with block prints. Comfortable everyday ethnic wear with side slits.", fabric: "Cotton", material: "100% Cotton", wash: "Machine wash cold. Do not bleach.", price: 899, mrp: 1599, stock: 64, rating: 4.4, reviewCount: 134, sold: 312, colors: ["Ivory","Olive","Indigo","Maroon"], sizes: ["XS","S","M","L","XL"], patterns: ["Block Print"], images: [IMG.women[2],IMG.women[3]], tags: ["everyday","ethnic"], gender: "women", brandIdx: 0, catSlug: "women-kurtis", isNew: true },
  { name: "Floral Wrap Maxi Dress", slug: "floral-wrap-maxi-dress", desc: "A feminine floral wrap maxi dress with a flattering tie waist. Flowy georgette that moves beautifully.", fabric: "Georgette", material: "Polyester Georgette", wash: "Hand wash cold. Do not bleach. Dry in shade.", price: 1499, mrp: 2799, stock: 44, rating: 4.5, reviewCount: 71, sold: 168, colors: ["Rose","Olive","Cream"], sizes: ["XS","S","M","L","XL"], patterns: ["Floral"], images: [IMG.women[4],IMG.women[5]], tags: ["western","dress"], gender: "women", brandIdx: 4, catSlug: "women-dresses", isTrending: true },
  { name: "Embroidered Crop Top", slug: "embroidered-crop-top", desc: "A dainty embroidered crop top with smocked back for a snug fit. Pairs beautifully with high-waist skirts or jeans.", fabric: "Cotton Blend", material: "Cotton Polyester Blend", wash: "Hand wash cold. Do not bleach.", price: 799, mrp: 1399, stock: 70, rating: 4.3, reviewCount: 58, sold: 142, colors: ["Cream","Black","Olive"], sizes: ["XS","S","M","L"], patterns: ["Embroidered"], images: [IMG.women[6],IMG.women[7]], tags: ["western","top"], gender: "women", brandIdx: 4, catSlug: "women-tops", isNew: true },
  { name: "Chanderi Palazzo Set", slug: "chanderi-palazzo-set", desc: "An elegant Chanderi palazzo set with a printed kurta, palazzo pants and a dupatta. Lightweight and festive-ready.", fabric: "Chanderi", material: "Chanderi Cotton Silk", wash: "Hand wash cold. Do not bleach.", price: 2299, mrp: 3999, stock: 26, rating: 4.7, reviewCount: 49, sold: 96, colors: ["Teal","Maroon","Mustard"], sizes: ["S","M","L","XL","XXL"], patterns: ["Printed","Solid"], images: [IMG.women2[0],IMG.women2[1]], tags: ["ethnic","set"], gender: "women", brandIdx: 3, catSlug: "women-ethnic-sets", isFeatured: true },
  { name: "Lehenga Choli with Dupatta", slug: "lehenga-choli-dupatta", desc: "A stunning lehenga choli set with sequin embroidery and a net dupatta. Designed for the spotlight at weddings and festivals.", fabric: "Velvet & Net", material: "Velvet, Net, Satin lining", wash: "Dry clean only.", price: 5499, mrp: 9999, stock: 14, rating: 4.8, reviewCount: 67, sold: 78, colors: ["Maroon","Royal Blue","Gold"], sizes: ["S","M","L","XL"], patterns: ["Embroidered","Sequined"], images: [IMG.women2[2],IMG.women2[3],IMG.women2[4]], tags: ["festive","wedding","lehenga"], gender: "women", brandIdx: 2, catSlug: "women-ethnic-sets", isTrending: true, isBestseller: true, isFeatured: true },
  { name: "Embellished Potli Handbag", slug: "embellished-potli-handbag", desc: "A handcrafted potli handbag with bead embellishments and a drawstring closure. The perfect festive accessory.", fabric: "Velvet", material: "Velvet with beadwork", wash: "Wipe with dry cloth only.", price: 999, mrp: 1799, stock: 52, rating: 4.4, reviewCount: 38, sold: 90, colors: ["Maroon","Gold","Black"], sizes: ["One Size"], patterns: ["Embellished"], images: [IMG.accessories[1],IMG.accessories[2]], tags: ["accessory","bag","festive"], gender: "women", brandIdx: 0, catSlug: "women-handbags", isNew: true },
  { name: "Kundan Statement Necklace Set", slug: "kundan-statement-necklace-set", desc: "A lavish Kundan necklace set with matching earrings. Gold-tone finish with intricate stone work for a royal look.", fabric: "Metal & Stone", material: "Brass alloy, Kundan stones", wash: "Keep away from water and perfume. Store in pouch.", price: 1499, mrp: 2999, stock: 34, rating: 4.6, reviewCount: 44, sold: 102, colors: ["Gold"], sizes: ["One Size"], patterns: ["Kundan"], images: [IMG.accessories[0],IMG.accessories[3]], tags: ["jewellery","festive"], gender: "women", brandIdx: 0, catSlug: "women-jewellery", isTrending: true },

  // ---- KIDS ----
  { name: "Boys Ethnic Kurta Pajama", slug: "boys-ethnic-kurta-pajama", desc: "A charming kurta pajama set for boys with a printed jacket. Soft cotton blend for all-day comfort at festivals.", fabric: "Cotton Blend", material: "Cotton Polyester Blend", wash: "Machine wash cold. Do not bleach.", price: 1199, mrp: 2199, stock: 42, rating: 4.5, reviewCount: 56, sold: 124, colors: ["Cream","Maroon","Olive"], sizes: ["2-3Y","4-5Y","6-7Y","8-9Y","10-11Y"], patterns: ["Printed"], images: [IMG.kids[1],IMG.kids[0]], tags: ["kids","ethnic","festive"], gender: "kids", brandIdx: 2, catSlug: "kids-boys", isBestseller: true },
  { name: "Girls Floral Frock Dress", slug: "girls-floral-frock-dress", desc: "A twirl-worthy floral frock for girls with a satin bow and tulle layers. Perfect for birthdays and parties.", fabric: "Cotton & Tulle", material: "Cotton, Polyester Tulle", wash: "Hand wash cold. Do not bleach. Dry in shade.", price: 999, mrp: 1799, stock: 50, rating: 4.6, reviewCount: 48, sold: 110, colors: ["Rose","Cream","Mint"], sizes: ["2-3Y","4-5Y","6-7Y","8-9Y","10-11Y"], patterns: ["Floral"], images: [IMG.kids[2],IMG.kids[3]], tags: ["kids","party","dress"], gender: "kids", brandIdx: 4, catSlug: "kids-girls", isTrending: true, isNew: true },
  { name: "Kids Party Wear Lehenga Choli", slug: "kids-party-lehenga-choli", desc: "A mini lehenga choli for little girls with sequin embroidery and a net dupatta. Festive glam for the young diva.", fabric: "Velvet & Net", material: "Velvet, Net", wash: "Dry clean only.", price: 1799, mrp: 3299, stock: 20, rating: 4.7, reviewCount: 29, sold: 54, colors: ["Maroon","Rose","Gold"], sizes: ["3-4Y","5-6Y","7-8Y","9-10Y"], patterns: ["Embroidered","Sequined"], images: [IMG.kids[4],IMG.kids[5]], tags: ["kids","party","festive"], gender: "kids", brandIdx: 2, catSlug: "kids-party", isFeatured: true },
  { name: "Boys Casual Shirt & Shorts Set", slug: "boys-casual-shirt-shorts-set", desc: "A cool coordinated shirt and shorts set for boys. Breathable cotton for summer play days.", fabric: "Cotton", material: "100% Cotton", wash: "Machine wash cold. Do not bleach.", price: 799, mrp: 1399, stock: 58, rating: 4.3, reviewCount: 37, sold: 88, colors: ["Olive","Navy","Cream"], sizes: ["2-3Y","4-5Y","6-7Y","8-9Y"], patterns: ["Printed"], images: [IMG.kids[0],IMG.kids[5]], tags: ["kids","casual"], gender: "kids", brandIdx: 8, catSlug: "kids-boys", isNew: true },

  // ---- More WOMEN for variety ----
  { name: "Cotton Leggings - Pack of 2", slug: "cotton-leggings-pack-2", desc: "Soft stretch cotton leggings in a pack of two. Full length with an elasticated waistband for everyday comfort.", fabric: "Cotton Lycra", material: "95% Cotton 5% Lycra", wash: "Machine wash cold. Do not bleach.", price: 699, mrp: 1199, stock: 90, rating: 4.4, reviewCount: 167, sold: 430, colors: ["Matte Black","Maroon","Navy","Olive"], sizes: ["S","M","L","XL","XXL"], patterns: ["Solid"], images: [IMG.women2[0],IMG.women[7]], tags: ["essentials","leggings"], gender: "women", brandIdx: 8, catSlug: "women-ethnic-sets", isBestseller: true },

  // ---- More MEN ----
  { name: "Henley Neck T-Shirt", slug: "henley-neck-tshirt", desc: "A stylish henley t-shirt with a button placket in premium cotton. Relaxed fit for laid-back weekends.", fabric: "Cotton", material: "100% Cotton", wash: "Machine wash cold. Do not bleach.", price: 749, mrp: 1299, stock: 76, rating: 4.4, reviewCount: 63, sold: 158, colors: ["Olive","Maroon","Cream"], sizes: ["S","M","L","XL","XXL"], patterns: ["Solid"], images: [IMG.men2[5],IMG.men[4]], tags: ["casual"], gender: "men", brandIdx: 8, catSlug: "men-tshirts", isNew: true },
  { name: "Slim Fit Chino Trousers", slug: "slim-fit-chino-trousers", desc: "Versatile slim fit chinos in stretch cotton twill. Dress them up or down for work and weekend.", fabric: "Cotton Twill", material: "98% Cotton 2% Elastane", wash: "Machine wash cold. Do not bleach.", price: 1599, mrp: 2799, stock: 44, rating: 4.5, reviewCount: 52, sold: 134, colors: ["Beige","Olive","Navy","Matte Black"], sizes: ["30","32","34","36","38"], patterns: ["Solid"], images: [IMG.men2[2],IMG.men[6]], tags: ["casual","formal"], gender: "men", brandIdx: 5, catSlug: "men-shirts", isTrending: true },

  // ---- More WOMEN ----
  { name: "Georgette Gown with Dupatta", slug: "georgette-gown-dupatta", desc: "A flowing georgette gown with stone work on the yoke and a matching dupatta. Effortless festive elegance.", fabric: "Georgette", material: "Polyester Georgette", wash: "Hand wash cold. Do not bleach.", price: 2499, mrp: 4499, stock: 24, rating: 4.6, reviewCount: 41, sold: 78, colors: ["Maroon","Teal","Wine"], sizes: ["S","M","L","XL","XXL"], patterns: ["Embroidered"], images: [IMG.women2[4],IMG.women2[3]], tags: ["festive","gown"], gender: "women", brandIdx: 3, catSlug: "women-dresses", isNew: true, isFeatured: true },

  // ---- More KIDS ----
  { name: "Girls Anarkali Kurta Set", slug: "girls-anarkali-kurta-set", desc: "A pretty Anarkali kurta set for girls with printed yoke and matching leggings. Festive-ready and comfy.", fabric: "Cotton Blend", material: "Cotton Polyester Blend", wash: "Machine wash cold. Do not bleach.", price: 1099, mrp: 1999, stock: 36, rating: 4.5, reviewCount: 33, sold: 70, colors: ["Rose","Yellow","Teal"], sizes: ["2-3Y","4-5Y","6-7Y","8-9Y","10-11Y"], patterns: ["Printed"], images: [IMG.kids[3],IMG.kids[2]], tags: ["kids","ethnic"], gender: "kids", brandIdx: 2, catSlug: "kids-girls", isBestseller: true },
  { name: "Kids Casual Sneakers", slug: "kids-casual-sneakers", desc: "Lightweight cushioned sneakers for kids with a hook-and-loop closure. All-day play comfort.", fabric: "Mesh & Rubber", material: "Mesh upper, EVA sole", wash: "Wipe with damp cloth.", price: 899, mrp: 1599, stock: 48, rating: 4.4, reviewCount: 26, sold: 64, colors: ["White","Pink","Navy"], sizes: ["11C","12C","13C","1Y","2Y","3Y"], patterns: ["Solid"], images: [IMG.footwear[3],IMG.footwear[4]], tags: ["kids","footwear"], gender: "kids", brandIdx: 9, catSlug: "kids-boys", isNew: true },
]

const coupons = [
  { code: "AMRUT10", type: "percent", value: 10, minOrder: 999, maxDiscount: 500, active: true },
  { code: "FESTIVE200", type: "flat", value: 200, minOrder: 1999, active: true },
  { code: "WELCOME15", type: "percent", value: 15, minOrder: 1499, maxDiscount: 750, active: true },
  { code: "DIWALI25", type: "percent", value: 25, minOrder: 2999, maxDiscount: 1500, active: true },
]

const banners = [
  { title: "Festive Collection 2024", subtitle: "Drape yourself in heritage. Handwoven sarees & ethnic wear up to 40% off.", image: IMG.hero[0], ctaText: "Shop Festive", ctaLink: "women-sarees", position: "hero", order: 0, active: true },
  { title: "New Arrivals", subtitle: "Fresh drops every week. Discover the latest in men's & women's fashion.", image: IMG.hero[1], ctaText: "Explore New", ctaLink: "new", position: "hero", order: 1, active: true },
  { title: "Mega Sale — Up to 60% Off", subtitle: "Premium styles at irresistible prices. Limited time only.", image: IMG.hero[2], ctaText: "Shop Sale", ctaLink: "sale", position: "hero", order: 2, active: true },
]

const reviewTemplates = [
  { name: "Priya Sharma", avatar: "PS", rating: 5, title: "Absolutely stunning!", body: "The quality exceeded my expectations. The fabric is so rich and the color is exactly as shown. Got so many compliments at the wedding!" },
  { name: "Rohit Patil", avatar: "RP", rating: 5, title: "Perfect fit & finish", body: "Great craftsmanship. Stitching is neat and the fit is true to size. Will definitely buy again from Amrut Collection." },
  { name: "Anjali Deshmukh", avatar: "AD", rating: 4, title: "Beautiful but slight delay", body: "The product is gorgeous and well packaged. Delivery took a day longer than expected but customer support was helpful." },
  { name: "Vikram More", avatar: "VM", rating: 5, title: "Premium quality", body: "Feels luxurious. The embroidery detail is top notch. Worth every rupee. Highly recommend for festive occasions." },
  { name: "Sneha Joshi", avatar: "SJ", rating: 4, title: "Lovely design", body: "The design is elegant and the material is comfortable. Would have liked more color options but overall very happy." },
  { name: "Amit Pawar", avatar: "AP", rating: 5, title: "Excellent service", body: "From ordering to delivery, the experience was smooth. Product matches the description perfectly. Five stars!" },
]

const cities = ["Jalgaon","Pune","Mumbai","Nashik","Aurangabad","Nagpur","Dhule","Parola","Bhusawal","Amravati"]
const states = ["Maharashtra"]
const names = ["Priya Sharma","Rohit Patil","Anjali Deshmukh","Vikram More","Sneha Joshi","Amit Pawar","Kavya Nair","Saurabh Kale","Meera Iyer","Nikhil Rao"]
const paymentMethods = ["upi","card","cod","wallet"]
const statuses = ["ordered","packed","shipped","out_for_delivery","delivered","delivered","delivered","cancelled","returned"]

async function main() {
  console.log("Clearing existing data...")
  await db.wishlistItem.deleteMany()
  await db.orderItem.deleteMany()
  await db.order.deleteMany()
  await db.review.deleteMany()
  await db.product.deleteMany()
  await db.category.deleteMany()
  await db.brand.deleteMany()
  await db.coupon.deleteMany()
  await db.banner.deleteMany()

  console.log("Creating brands...")
  const brandMap: Record<string, any> = {}
  for (const b of brands) {
    const rec = await db.brand.create({ data: { name: b.name, slug: b.slug, country: b.country } })
    brandMap[b.slug] = rec
  }

  console.log("Creating categories...")
  const catMap: Record<string, any> = {}
  for (const c of categories) {
    let parentId: string | undefined
    if (c.parent) parentId = catMap[c.parent].id
    const rec = await db.category.create({
      data: { name: c.name, slug: c.slug, gender: c.gender, icon: c.icon || null, image: c.image || null, parentId: parentId || null }
    })
    catMap[c.slug] = rec
  }

  console.log("Creating products...")
  const prodMap: Record<string, any> = {}
  for (const p of products) {
    const discount = 0
    const rec = await db.product.create({
      data: {
        name: p.name,
        slug: p.slug,
        description: p.desc,
        fabric: p.fabric,
        material: p.material,
        washCare: p.wash,
        sku: "AMR-" + p.slug.replace(/-/g, "").slice(0, 6).toUpperCase() + "-" + Math.floor(Math.random() * 900 + 100),
        barcode: "890" + Math.floor(Math.random() * 9000000000 + 1000000000).toString(),
        price: p.price,
        mrp: p.mrp,
        discount,
        stock: p.stock,
        rating: p.rating,
        reviewCount: p.reviewCount,
        sold: 0,
        colors: S(p.colors),
        sizes: S(p.sizes),
        patterns: S(p.patterns),
        images: S(p.images),
        tags: S(p.tags),
        isTrending: p.isTrending || false,
        isNew: p.isNew || false,
        isBestseller: p.isBestseller || false,
        isFeatured: p.isFeatured || false,
        gender: p.gender,
        categoryId: catMap[p.catSlug].id,
        brandId: brandMap[brands[p.brandIdx].slug].id,
      },
    })
    prodMap[p.slug] = rec

    // create a few reviews per product
    const rcount = Math.min(3, Math.floor(Math.random() * 3) + 1)
    for (let i = 0; i < rcount; i++) {
      const t = reviewTemplates[Math.floor(Math.random() * reviewTemplates.length)]
      await db.review.create({
        data: {
          productId: rec.id,
          userName: t.name,
          userAvatar: t.avatar,
          rating: t.rating,
          title: t.title,
          body: t.body,
          verified: true,
          helpful: Math.floor(Math.random() * 40),
          status: "approved",
        }
      })
    }
  }

  console.log("Creating coupons...")
  for (const c of coupons) {
    await db.coupon.create({ data: c })
  }

  console.log("Creating banners...")
  for (const b of banners) {
    await db.banner.create({ data: b })
  }

  console.log("Creating sample orders...")
  const productSlugs = Object.keys(prodMap)
  const now = Date.now()
  for (let i = 0; i < 60; i++) {
    const daysAgo = Math.floor(Math.random() * 30)
    const date = new Date(now - daysAgo * 86400000 - Math.floor(Math.random() * 86400000))
    const pSlug = productSlugs[Math.floor(Math.random() * productSlugs.length)]
    const p = prodMap[pSlug]
    const qty = Math.floor(Math.random() * 3) + 1
    const subtotal = p.price * qty
    const shipping = subtotal > 999 ? 0 : 49
    const discount = Math.random() > 0.6 ? Math.round(subtotal * 0.1) : 0
    const total = subtotal + shipping - discount
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    const pm = paymentMethods[Math.floor(Math.random() * paymentMethods.length)]
    const name = names[Math.floor(Math.random() * names.length)]
    const orderNo = "AMR" + date.getFullYear() + String(date.getMonth() + 1).padStart(2, "0") + String(1000 + i)
    const colors = JSON.parse(p.colors)
    const sizes = JSON.parse(p.sizes)
    const order = await db.order.create({
      data: {
        orderNo,
        customerName: name,
        email: name.toLowerCase().replace(/\s+/g, ".") + "@email.com",
        phone: "+91 9" + Math.floor(100000000 + Math.random() * 899999999),
        address: `${Math.floor(Math.random() * 200) + 1}, Main Road, Near Bus Stand`,
        city: cities[Math.floor(Math.random() * cities.length)],
        state: states[0],
        pincode: String(425000 + Math.floor(Math.random() * 500)),
        paymentMethod: pm,
        paymentStatus: pm === "cod" ? "pending" : "paid",
        status,
        subtotal,
        shipping,
        discount,
        total,
        createdAt: date,
        items: {
          create: {
            productId: p.id,
            name: p.name,
            image: JSON.parse(p.images)[0],
            price: p.price,
            qty,
            color: colors[0],
            size: sizes[0],
          }
        }
      }
    })
  }

  console.log("Seed complete!")
  console.log("Brands:", await db.brand.count())
  console.log("Categories:", await db.category.count())
  console.log("Products:", await db.product.count())
  console.log("Reviews:", await db.review.count())
  console.log("Orders:", await db.order.count())
  console.log("Coupons:", await db.coupon.count())
  console.log("Banners:", await db.banner.count())
}

main().catch((e) => { console.error(e); process.exit(1) }).finally(async () => { await db.$disconnect() })
