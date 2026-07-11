# Curator App — Project Brief

## What this is
A furniture curation tool built for a freelance furniture curator (transitioning from architect). The curator sources furniture for clients in Singapore, creates moodboards for presentations, and tracks a database of vetted furniture items across local SG shops, Taobao, and premium suppliers.

## Business context
- Owner: Vivi, architect turning freelance furniture curator
- Market: Singapore HDB + condo owners who skip full renovation and buy furniture instead
- Value prop: curating furniture by mood, budget, and quality — especially vetting Taobao items
- Phase 1: Vivi uses this app herself as a client presentation tool
- Phase 2: Public-facing website where clients self-serve

## Live site
https://enirehtacs.github.io/curator-app

## GitHub repo
https://github.com/enirehtacs/curator-app

## Tech stack
- React (Create React App)
- Plain CSS (App.css)
- localStorage for project persistence
- No backend — all data is in src/data/furniture.js
- Deployed via git subtree to GitHub Pages

## App structure
Three main tabs in the nav:
1. **Projects** — list of client projects
2. **Database** — full furniture catalogue with search + filters

### Projects flow
- Create project → enter client name, total budget (SGD), vibe tags (multi-select), optional notes
- NO room type on creation — rooms are added inside the project
- Inside a project: add rooms one by one (Living Room, Bedroom, Dining Room, Kitchen etc)
- Each room has two tabs:
  - **Workspace** — drag and drop board. Left panel = database filtered by project vibes. Right panel = section drop zones (Seating, Storage, Lighting, Accents etc based on room type)
  - **Visualisation** — toggle between Collage view (client presentation) and List view (internal use)
- **🏠 Full house** tab — sees all rooms together as one moodboard

### Visualisation — Collage view
- ALL items for that room appear on ONE single canvas (warm beige background #F5F1EC)
- Items shown as photos in rounded rectangle boxes, arranged together (not in a grid)
- Layout adapts based on number of items (1-8 different arrangements)
- Number badges (①②③) on each photo
- **Info button** — toggles info panel below canvas (name, shop, SKU, description, grouped by section)
- **Budget button** — toggles price tags on photos + budget breakdown below canvas by section + grand total
- Room label watermark bottom right of canvas

### Visualisation — List view
- Clean row list: number, photo thumbnail, name, shop/SKU (when Info on), price (when Budget on)
- For internal use / working sessions

### Database
- Search by name, shop, vibe, description
- Filter by: Category, Vibe, Colour, Source Type, Price Tier
- Colour filter uses colourTags on each item (pre-assigned, user-editable)
- Colour dots shown in the Colours column
- Click ▼ on any row → inline drawer expands with product photo + full details
- Columns: ID, Name, Category, Colours (dots), Vibes, Shop, Price, Tier, Lead Time, Avail

## Data model

### furniture.js fields
```js
{
  id: "SF-3S-001",           // Your ID: CATEGORY-SUBTYPE-NUMBER
  name: "Dawson 3-Seater Sofa",
  category: "Sofa",          // Sofa|Chair|Ottoman|Table|Storage|Bed|Lighting|Accent|Outdoor|Kitchen/Dining
  subtype: "3-Seater",
  rooms: ["Living Room"],    // which rooms it suits
  vibes: ["Retro","Modern"], // multi-select style tags
  shop: "Castlery",
  sourceType: "Local SG",    // Local SG|Taobao|International|Supplier Direct
  url: "https://...",
  sku: "CST-DAW-3S",         // brand's own product code
  price: 2299,               // listed price SGD
  colourTags: ["Beige","Cream"], // dominant colours for filtering
  description: "...",
  materials: "Fabric",
  colours: "Warm grey, Oatmeal",
  dimensions: "W224 D97 H72cm",
  quality: "Top seller ★★★★★",
  rating: 5,
  leadTime: "In stock",
  availability: "In stock",
  notes: "Curator notes...",
  photo: "https://..."       // product image URL
}
```

### ID naming system
- SF = Sofa (2S=2-seater, 3S=3-seater, SC=Sectional)
- CH = Chair (AC=Accent, DN=Dining, DS=Desk)
- OT = Ottoman/Bean Bag
- TB = Table (CF=Coffee, DN=Dining, SD=Side, CS=Console)
- ST = Storage (SH=Shelf, TV=TV Console, CB=Cabinet)
- BD = Bed (BF=Bed Frame)
- LT = Lighting (FL=Floor, TL=Table, PD=Pendant)
- AC = Accent (VS=Vase, RG=Rug, CS=Cushion, TR=Tray, PT=Art Print)
- OD = Outdoor
- KT = Kitchen/Dining

### Vibe tags
Retro, Modern, Minimalist, Japandi, Ambient, Grunge, Bohemian, Organic, Luxe, Coastal, Scandi, Industrial

### Room types + sections
- Living Room → Seating, Storage, Lighting, Accents, Rugs
- Bedroom → Bed, Storage, Lighting, Accents
- Master Bedroom → Bed, Storage, Lighting, Accents
- Dining Room → Dining Table, Chairs, Lighting, Accents
- Kitchen → Bar Stools, Lighting, Accents
- Home Office → Desk, Chair, Storage, Lighting
- Outdoor / Patio → Seating, Tables, Lighting, Accents

### Project data shape (stored in localStorage)
```js
{
  id: 1234567890,
  clientName: "Tan family",
  budget: 30000,
  vibes: ["Retro", "Ambient"],
  notes: "...",
  createdAt: "2026-07-11T...",
  rooms: [
    {
      id: 1234567891,
      type: "Living Room",
      sections: {
        "Seating": [ /* furniture items */ ],
        "Lighting": [ /* furniture items */ ],
      }
    }
  ]
}
```

## Current furniture suppliers in database
- **Castlery** (Local SG) — sofas, cushions
- **HipVan** (Local SG) — sofas, chairs, tables, storage, lighting, rugs, beds
- **Scene Shang** (Local SG) — arc floor lamp
- **In The Mood For Love** (Local SG) — stoneware vases
- **Space Furniture** (Local SG) — Kartell, B&B Italia, Poliform, Serralunga
- **Stacked Store** (Local SG) — DOIY, Bloomingville, &klevering, Hubsch, HKLIVING, The Poster Club
- **Taobao** — bean bags, table lamps, pampas/rattan trays

## Known issues / limitations
- Product photos: many URLs are placeholder paths that won't load (shops block direct linking). When image fails, shows a coloured fallback with category name. Real fix = upload photos manually or find CDN-accessible image URLs
- No backend — adding furniture requires editing furniture.js directly. Next step is an "Add item" form in the app
- Supplier price field exists in the schema but isn't editable in the UI yet

## Roadmap (things discussed, not yet built)
In priority order:

1. **Add item form** — form inside the app to add new furniture without touching code. Fields: name, category, subtype, room types, vibes, shop, source type, URL, SKU, price, colour tags, description, materials, colours, dimensions, quality notes, lead time, availability, curator notes, photo URL

2. **Edit item** — click any database item and edit its fields. Especially needed for: updating supplier price once negotiated, fixing colour tags, updating availability

3. **Export moodboard to PDF** — the visualisation collage exported as a clean PDF slide for sending to clients. Should include: project name, client name, room name, all item photos in collage, info panel, budget breakdown

4. **Colour palette section** — before the collage, a row of colour swatches showing the palette used in that room (like a paint/material palette strip). Already partially designed in an earlier prototype

5. **Material palette** — swatches for fabric/finish used (bouclé, walnut, brass, rattan etc) — set per project/room

6. **Connect to Airtable** — migrate furniture database from static JS file to Airtable with API. Enables: AI auto-fill of descriptions/tags when you add a URL, supplier price updates, live availability status

7. **AI suggestions (Claude API)** — "Suggest with AI" button in Workspace that reads project vibe + budget and recommends items from the database for each section

8. **Client intake form** — form that clients fill in before Vivi builds their board: room type, items needed, style references, budget

9. **Public website** — Phase 2: clients can browse the curated catalogue themselves and filter by vibe/budget/room

## Deploy commands (run from ~/Downloads/curator-app)
```bash
# Test locally
npm start

# Deploy to live site
npm run build
git add build -f
git commit -m "describe changes"
git subtree push --prefix build origin gh-pages

# Push source code
git add .
git commit -m "describe changes"
git push origin main
```

## File structure
```
curator-app/
├── src/
│   ├── components/
│   │   ├── Database.js         — furniture catalogue with search/filter/colour
│   │   ├── Projects.js         — project list + new project form
│   │   ├── ProjectDetail.js    — room tabs, workspace, visualisation
│   │   ├── MoodboardCollage.js — single-canvas collage component
│   │   └── Moodboard.js        — legacy (original hardcoded demo, can be deleted)
│   ├── data/
│   │   ├── furniture.js        — all furniture items (add new items here)
│   │   └── projects.js         — room types, sections, category mappings
│   ├── App.js                  — routing between views
│   ├── App.css                 — all styles
│   └── index.js                — entry point
├── public/
│   └── index.html
└── package.json
```

---

## PRIORITY NEXT TASK — Collage redesign

The current collage (MoodboardCollage.js) shows items in separate rounded boxes arranged on a canvas. This needs to be replaced with a presentation-board style layout like a real interior design moodboard.

### What it should look like
A single warm beige canvas (#F5F1EC) where:
- Product photos are placed together on the canvas, side by side like objects in a room — NOT in isolated boxes
- Each item has a **leader line** (thin dashed vertical line) dropping from a label at the top down to the item photo
- Labels sit at the top of the canvas: item number (① ② ③) + item name, positioned above their leader line
- Items arranged in the bottom 55% of the canvas
- Anchor pieces (sofa, bed, large table) are centred and larger
- Smaller items (vases, lamps, cushions, trays) sit to the sides and are proportionally smaller
- Overall feel: Antonio Citterio / B&B Italia catalogue style — top-down flatlay with labelled leader lines

### Key rules
- Use real product photos (img tags with item.photo URL) — NOT SVG graphics or geometric placeholders
- If photo fails to load → neutral warm coloured rectangle placeholder, no cartoon furniture
- All items for the room on ONE canvas — not split by section
- Leader lines: thin dashed line, colour #888780, 0.5px, drops vertically from label to top of photo
- Canvas background: #F5F1EC
- Photo style: object-fit cover, border-radius 8-10px, NO box shadow (keep it flat and editorial)
- Vary photo sizes: sofa ~35% canvas width, chairs ~20%, lamps ~15%, vases/accents ~10%
- No section dividers on the canvas — sections only show in Info/Budget panels below canvas

### Canvas layout zones
- Top zone (y 5–18%): item name labels + number badges, spread horizontally
- Middle zone (y 18–38%): leader lines dropping down
- Bottom zone (y 38–95%): photos arranged side by side, anchor items centre-bottom

### Info + Budget panels below canvas (keep as-is)
- Info panel: grouped by section, name/shop/SKU/description per item
- Budget panel: grouped by section with subtotals + grand total
- Toggled by existing Info and Budget buttons — no change needed here

### Also add: colour palette strip above the canvas
- A row of colour swatches showing the colourTags of all items in the room combined (deduplicated)
- Small rounded squares (~40x40px) with the colour filled, and the colour name below
- Swatches sourced from the COLOUR_HEX map already in Database.js
- Sits between the Workspace/Visualisation tabs and the canvas
- Label: "Room palette"
