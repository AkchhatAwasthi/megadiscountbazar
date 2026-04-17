# Mega Discount Bazar — Hero Banner Guide

This guide contains both the **AI Image Prompts** for generating banner assets and the **UI Content** to be inserted into the `hero_slides` Supabase table.

**Brand palette:** Deep red `#CC1B1B`, Gold `#FFD700`, Warm cream `#F5F0E8`  
**Aspect ratio:** 16:5 wide banner  
**Design Principle:** High contrast, legible text regions, and luxury hypermarket aesthetics.

---

## Slide 1 — Kids & Toys Wonderland

### 1. UI Content (Add to Supabase)
| Field | Value |
| :--- | :--- |
| **Subtitle** | THE JOY OF PLAY |
| **Title** | KIDS CARNIVAL |
| **Description** | Unleash their imagination with our premium collection of educational toys and plushies. Quality that sparks joy for every age. |
| **CTA Text** | Explore Toys |

### 2. AI Image Prompt
```
Ultra-wide promotional banner for Mega Discount Bazar. Background: A premium kids toy section with wooden castles and plushies on gold-trimmed ivory shelves. Right side mostly clear for text placement. Modern logo placeholder in top left corner. Warm golden lighting, playful yet luxury vibe, cinematic depth of field, 1920x600, hyperrealistic marketing photography.
```

---

## Slide 2 — Next-Gen Electronics

### 1. UI Content (Add to Supabase)
| Field | Value |
| :--- | :--- |
| **Subtitle** | NEXT-GEN GADGETS |
| **Title** | TECH REVOLUTION |
| **Description** | Upgrade your lifestyle with the latest smartphones, premium laptops, and high-fidelity accessories. Future-ready tech at unbeatable prices. |
| **CTA Text** | Shop Electronics |

### 2. AI Image Prompt
```
Ultra-wide luxury electronics sale banner for Mega Discount Bazar. Background: Minimalist display of flagship smartphones and laptops on dark maroon #1C0A0A glass pedestals. Dynamic lighting with gold neon trails, premium futuristic tech aesthetic, sharp focus on metallic and glass textures, 1920x600, hyperrealistic cinematic render.
```

---

## Slide 3 — Gourmet Groceries & Fresh Finds

### 1. UI Content (Add to Supabase)
| Field | Value |
| :--- | :--- |
| **Subtitle** | FARM TO TABLE |
| **Title** | THE FRESH MARKET |
| **Description** | From organic farm-fresh produce to global gourmet delicacies. Experience the highest quality ingredients for your kitchen daily. |
| **CTA Text** | Order Fresh |

### 2. AI Image Prompt
```
Ultra-wide hypermarket marketing banner. Background: Beautifully organized fresh produce and gourmet grocery aisles. Soft focus on vibrant stacked fruits and premium artisanal goods. Large clean space on the left for text. Bright, natural pantry lighting, clean and trust-building aesthetic, 1920x600, high-res commercial photography.
```

---

## Slide 4 — Modern Home Appliances

### 1. UI Content (Add to Supabase)
| Field | Value |
| :--- | :--- |
| **Subtitle** | SMART HOME STYLE |
| **Title** | MODERN LIVING |
| **Description** | Elegance meets efficiency. Discover smart appliances designed for the contemporary home, from designer coffee machines to smart air-fryers. |
| **CTA Text** | View Collection |

### 2. AI Image Prompt
```
Ultra-wide home appliance promo banner. Background: Sleek stainless steel kitchen appliances in a high-end modern kitchen. Warm golden backlighting, luxury interior design aesthetic. Sophisticated cream #F5F0E8 and Gold #FFD700 color accents. Sharp focus on premium appliance finishes, 1920x600, cinematic interior photography.
```

---

## Slide 5 — Grand Mega Sale (Store Launch)

### 1. UI Content (Add to Supabase)
| Field | Value |
| :--- | :--- |
| **Subtitle** | YOUR ONE-STOP BAZAR |
| **Title** | MEGA DISCOUNT BAZAR |
| **Description** | Everything you need under one roof. Experience the ultimate hypermarket destination with exclusive deals across all categories. |
| **CTA Text** | Shop Now |

### 2. AI Image Prompt
```
Ultra-wide grand bazar banner for Mega Discount Bazar. Background: A vast, polished hypermarket space with festive gold and red banners hanging subtly from high ceilings. Wide-angle cinematic view of bright, organized aisles. High-trust, aspirational shopping experience, vibrant atmosphere, 1920x600, hyperrealistic commercial photography.
```

---

## Technical Instructions for Implementation
1. **CMS Update:** Link the matching AI-generated images to these slide records in Supabase.
2. **Animation:** The `Hero.tsx` component will automatically animate this text with staggered entry effects.
3. **Logo:** Always maintain the "Mega Discount Bazar" logo in a fixed top-corner position.
