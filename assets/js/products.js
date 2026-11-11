/* =========================================================
   ANTRA — product catalogue
   Prices, sizes & INCI ingredients per the official
   "Antra Botanicals — Ingredients & Price List, 2026 Edition".
   Collections: vero · shakti · grove · apothecary
   ========================================================= */
var ANTRA_ZERO = "No added synthetic fragrance, parabens or phthalates · no musk, civet, ambergris or endangered oud.";

window.ANTRA_PRODUCTS = [
  /* ---------------- THE VERO COLLECTION (perfume oils · 13 ml) ---------------- */
  {
    id: "initiation",
    name: "The Initiation",
    collection: "vero",
    type: "Perfume Oil Trio",
    price: 1450,
    size: "Set of three · 3 × 3 ml",
    accent: "#c9a86a",
    image: "assets/img/initiation-1.jpg",
    gallery: ["assets/img/initiation-1.jpg", "assets/img/initiation-2.jpg", "assets/img/initiation-3.jpg", "assets/img/initiation-4.jpg"],
    eyebrow: "Begin the ritual",
    short: "A curated trio of natural perfumes — an ode to the goddess within.",
    story: "You are not a student of the divine—you are its living embodiment. The Initiation is not a rite of passage but a ritual of return, a journey back to the primal power that hums in your bones. This curated set of three natural perfumes is an ode to the goddess within you, the one who needs no permission to reign.",
    quote: "You are already sovereign. Roll to awaken, not to aspire.",
    contents: [
      { name: "Lilith’s Dark Moon", notes: "Lotus • Night-Blooming Jasmine • Lily of the Valley" },
      { name: "Sappho’s Embrace", notes: "Vetiver • Lavender • Chamomile" },
      { name: "Siren’s Call", notes: "Salt-Sprayed Jasmine • Vanilla • Frankincense" }
    ],
    why: [
      ["For the Woman Who Remembers", "These scents are not invented—they are recalled. Each drop is a dialogue with ancestral divinity."],
      ["No Initiation Required", "You are already sovereign. Roll to awaken, not to aspire."],
      ["Slow Perfumery", "Small-batch, wild-harvested, and blended with moon-charged intentionality."]
    ]
  },
  {
    id: "lilith",
    name: "Lilith’s Dark Moon",
    collection: "vero",
    type: "Perfume Oil",
    price: 3500,
    size: "13 ml",
    accent: "#9d8cc4",
    image: "assets/img/lilith-1.jpg",
    gallery: ["assets/img/lilith-1.jpg", "assets/img/lilith-2.jpg", "assets/img/lilith-3.jpg", "assets/img/lilith-4.jpg"],
    eyebrow: "The forbidden bloom",
    ctaLine: "Embrace the shadow",
    archetypeLine: "Mysterious, haunting, nocturnal — she wears like a shadow-glow.",
    short: "For the rebel labeled “too much.” Lotus coils with forbidden jasmine, blooming only under moonlight.",
    story: "For the rebel labeled “too much.” A fragrance as untamed as the first woman who refused to kneel. Lotus coils with forbidden jasmine, blooming only under moonlight.",
    quote: "This isn’t a scent. It’s a rebellion.",
    notes: { top: "Lily of the Valley", middle: "Lotus", base: "Jasmine, Sandalwood" },
    ingredients: {
      carrier: "Full INCI · in descending order",
      essentials: [
        "Simmondsia Chinensis (Jojoba) Seed Oil",
        "Nelumbo Nucifera (Lotus) Flower Extract",
        "Santalum Spicatum (Australian Sandalwood) Wood Extract",
        "Santalum Spicatum Wood Oil",
        "Jasminum Grandiflorum (Jasmine) Flower Extract",
        "Convallaria Majalis (Lily of the Valley) Flower Extract",
        "Cocos Nucifera (Coconut) Oil",
        "Cera Alba (Organic Beeswax)",
        "Vanilla Planifolia (Vanilla) Fruit Extract",
        "Pelargonium Graveolens (Geranium) Flower Oil",
        "Tocopherol (Plant-Based Vitamin E)"
      ],
      zero: ANTRA_ZERO
    }
  },
  {
    id: "persephone",
    name: "Persephone’s Seed",
    collection: "vero",
    type: "Perfume Oil",
    price: 3500,
    size: "13 ml",
    accent: "#c0334d",
    image: "assets/img/persephone-1.jpg",
    gallery: ["assets/img/persephone-1.jpg", "assets/img/persephone-2.jpg", "assets/img/persephone-3.jpg", "assets/img/persephone-4.jpg"],
    eyebrow: "Dark fruit, blooming power",
    ctaLine: "Enter the underworld",
    archetypeLine: "She carries spring in every pulse. The descent and the return.",
    short: "For the woman who’s survived her own underworld. Pomegranate melds with roses grown through the cracks.",
    story: "For the woman who’s survived her own underworld. A crown of thorns and triumph. Juicy pomegranate—the fruit of rebirth—melds with roses that grew through cracks in hell’s soil.",
    quote: "You are both queen of spring and queen of the underworld.",
    notes: { top: "Pomegranate", middle: "Rose Otto, Juniper Berry", base: "Patchouli, Vanilla, Jasmine" },
    ingredients: {
      carrier: "Full INCI · in descending order",
      essentials: [
        "Simmondsia Chinensis (Jojoba) Seed Oil",
        "Punica Granatum (Pomegranate) Seed Extract",
        "Punica Granatum Oil",
        "Rosa Damascena (Rose) Flower Extract",
        "Jasminum Grandiflorum (Jasmine) Flower Extract",
        "Vanilla Planifolia (Vanilla) Fruit Extract",
        "Pogostemon Cablin (Patchouli) Leaf Extract",
        "Pogostemon Cablin Leaf Oil",
        "Juniperus Communis (Juniper) Fruit Extract",
        "Juniperus Communis Fruit Oil",
        "Tocopherol (Plant-Based Vitamin E)"
      ],
      zero: ANTRA_ZERO
    }
  },
  {
    id: "siren",
    name: "Siren’s Call",
    collection: "vero",
    type: "Perfume Oil",
    price: 3500,
    size: "13 ml",
    accent: "#3e83b0",
    image: "assets/img/siren-1.jpg",
    gallery: ["assets/img/siren-1.jpg", "assets/img/siren-2.jpg", "assets/img/siren-3.jpg"],
    eyebrow: "A coastal spell",
    ctaLine: "Answer her call",
    archetypeLine: "Drenched in longing and allure — for the wild-hearted and water-bound.",
    short: "For the woman who commands the tide. Midnight jasmine drips with hypnotic secrecy.",
    story: "For the woman who commands the tide. A melody of danger and allure. Midnight jasmine drips with hypnotic secrecy, vanilla cloaks steel in velvet, and frankincense crackles like a truth too potent to ignore. Marjoram? That’s the salt-sting of a storm you chose to walk into.",
    quote: "Wear this when you want the world to lean in—and forget how to look away.",
    notes: { top: "Marjoram", middle: "Rose Otto, Frankincense, Frangipani", base: "Jasmine, Vanilla" },
    ingredients: {
      carrier: "Full INCI · in descending order",
      essentials: [
        "Simmondsia Chinensis (Jojoba) Seed Oil",
        "Jasminum Grandiflorum (Jasmine) Flower Extract",
        "Boswellia Carterii (Frankincense) Resin Extract",
        "Boswellia Carterii Oil",
        "Plumeria Rubra (Frangipani) Flower Extract",
        "Rosa Damascena Flower Oil",
        "Rosa Damascena (Rose) Flower Extract",
        "Vanilla Planifolia (Vanilla) Fruit Extract",
        "Origanum Majorana (Marjoram) Leaf Extract",
        "Origanum Majorana Leaf Oil",
        "Tocopherol (Plant-Based Vitamin E)"
      ],
      zero: ANTRA_ZERO
    }
  },
  {
    id: "hera",
    name: "Hera’s Fury",
    collection: "vero",
    type: "Perfume Oil",
    price: 3500,
    size: "13 ml",
    accent: "#cf9646",
    image: "assets/img/hera-1.webp",
    gallery: ["assets/img/hera-1.webp", "assets/img/hera-2.webp"],
    eyebrow: "Sovereign rage, sacred protection",
    ctaLine: "Summon the storm",
    archetypeLine: "Regal, complex, commanding — she is the matriarch, not to be denied.",
    short: "For the woman done playing small. The Queen of Olympus in liquid form.",
    story: "For the woman done playing small. The Queen of Olympus in liquid form. Smoldering patchouli and sacred frankincense ignite your regal rage, while neroli whispers a single command.",
    quote: "Burn the throne. Build an empire.",
    notes: { top: "Neroli, Juniper Berry", middle: "Geranium, Frankincense, Cedarwood, Ylang Ylang", base: "Jasmine, Vanilla, Patchouli, Sandalwood" },
    ingredients: {
      carrier: "Full INCI · in descending order",
      essentials: [
        "Simmondsia Chinensis (Jojoba) Seed Oil",
        "Santalum Spicatum (Australian Sandalwood) Wood Extract",
        "Santalum Spicatum Wood Oil",
        "Pogostemon Cablin (Patchouli) Leaf Extract",
        "Pogostemon Cablin Leaf Oil",
        "Vanilla Planifolia (Vanilla) Fruit Extract",
        "Boswellia Carterii (Frankincense) Resin Extract",
        "Boswellia Carterii Oil",
        "Pelargonium Graveolens (Geranium) Flower Extract",
        "Pelargonium Graveolens Flower Oil",
        "Citrus Aurantium Amara (Neroli) Flower Extract",
        "Citrus Aurantium Amara Flower Oil",
        "Juniperus Communis (Juniper) Fruit Extract",
        "Juniperus Communis Fruit Oil",
        "Cananga Odorata (Ylang Ylang) Flower Extract",
        "Cananga Odorata Flower Oil",
        "Jasminum Grandiflorum (Jasmine) Flower Extract",
        "Cedrus Deodara (Himalayan Cedarwood) Wood Extract",
        "Cedrus Deodara Wood Oil",
        "Tocopherol (Plant-Based Vitamin E)"
      ],
      zero: ANTRA_ZERO
    }
  },
  {
    id: "hades",
    name: "Hades’s Touch",
    collection: "vero",
    type: "Perfume Oil",
    price: 900,
    size: "3 ml",
    accent: "#5b4a63",
    image: "assets/img/banner-bottles.jpg",
    gallery: ["assets/img/banner-bottles.jpg"],
    eyebrow: "The underworld’s warmth",
    short: "A dark, resinous spell — myrrh and labdanum smoulder beneath clove, black pepper and bright neroli.",
    story: "Hades’s Touch is the warmth beneath the dark. Smoked myrrh and labdanum are wrapped in clove, black pepper and green petitgrain, then lifted by neroli and a whisper of lime. A scent for the one unafraid of depth.",
    quote: "Not all who descend are lost.",
    notes: { top: "Petitgrain, Lime", middle: "Clove, Black Pepper, Neroli, Basil", base: "Myrrh, Labdanum, Vanilla" },
    ingredients: {
      carrier: "Full INCI · in descending order",
      essentials: [
        "Simmondsia Chinensis (Jojoba) Seed Oil",
        "Citrus Aurantium Amara (Petitgrain) Leaf Extract",
        "Citrus Aurantium Amara Leaf/Twig Oil",
        "Eugenia Caryophyllus (Clove) Bud Extract",
        "Eugenia Caryophyllus Bud Oil",
        "Commiphora Myrrha (Myrrh) Resin Extract",
        "Commiphora Myrrha Oil",
        "Citrus Aurantium Amara (Neroli) Flower Extract",
        "Citrus Aurantium Amara Flower Oil",
        "Piper Nigrum (Black Pepper) Fruit Extract",
        "Piper Nigrum Fruit Oil",
        "Cananga Odorata (Ylang Ylang) Flower Extract",
        "Cananga Odorata Flower Oil",
        "Vanilla Planifolia (Vanilla) Fruit Extract",
        "Ocimum Basilicum (Basil) Leaf Extract",
        "Ocimum Basilicum Leaf Oil",
        "Cistus Ladaniferus (Labdanum) Resin Extract",
        "Cistus Ladaniferus Oil",
        "Citrus Aurantifolia (Lime) Peel Extract",
        "Citrus Aurantifolia Oil",
        "Punica Granatum (Pomegranate) Seed Extract",
        "Punica Granatum Oil"
      ],
      zero: ANTRA_ZERO
    }
  },

  /* ---------------- THE SHAKTI COLLECTION (perfume oils · 3 ml) ---------------- */
  {
    id: "ma-brahmacharini",
    name: "Ma Brahmacharini",
    collection: "shakti",
    type: "Perfume Oil · Shakti",
    price: 1200,
    size: "3 ml",
    accent: "#b79a5e",
    image: "assets/img/packaging-1.jpg",
    gallery: ["assets/img/packaging-1.jpg"],
    eyebrow: "Devotion & stillness",
    short: "Serene and grounding — jasmine and bergamot rest over myrrh, clove and deep vetiver.",
    story: "Ma Brahmacharini honours the path of devotion and penance. Luminous jasmine and bright bergamot settle into sacred myrrh, warm clove and earthen vetiver — a quiet, grounding scent for focus, patience and inner stillness. An artisanal oil perfume, placed on the skin, never layered.",
    quote: "Stillness is its own kind of power.",
    notes: { top: "Bergamot", middle: "Jasmine, Clove", base: "Myrrh, Vetiver" },
    ingredients: {
      carrier: "Full INCI · in descending order",
      essentials: [
        "Simmondsia Chinensis (Jojoba) Seed Oil",
        "Jasminum Grandiflorum (Jasmine) Flower Extract",
        "Commiphora Myrrha (Myrrh) Resin Extract",
        "Commiphora Myrrha Oil",
        "Citrus Aurantium Bergamia (Bergamot) Peel Extract",
        "Citrus Aurantium Bergamia Fruit Oil",
        "Eugenia Caryophyllus (Clove) Bud Extract",
        "Eugenia Caryophyllus Bud Oil",
        "Vetiveria Zizanoides (Vetiver) Root Extract",
        "Vetiveria Zizanoides Root Oil"
      ],
      zero: ANTRA_ZERO
    }
  },
  {
    id: "ma-kaalratri",
    name: "Ma Kaalratri",
    collection: "shakti",
    type: "Perfume Oil · Shakti",
    price: 1200,
    size: "3 ml",
    accent: "#6e3b44",
    image: "assets/img/packaging-2.jpg",
    gallery: ["assets/img/packaging-2.jpg"],
    eyebrow: "Fierce & protective",
    short: "Dark and powerful — patchouli, rosewood and black pepper over frankincense, cedar, sandalwood and myrrh.",
    story: "Ma Kaalratri is the fiercest form — the destroyer of fear. Smoky patchouli and warm rosewood meet black pepper, sacred frankincense and a deep forest of Himalayan cedar, sandalwood and myrrh. Protective, commanding, unafraid of the dark. An artisanal oil perfume, placed on the skin, never layered.",
    quote: "She is the night that devours fear.",
    notes: { top: "Black Pepper", middle: "Patchouli, Rosewood, Frankincense", base: "Cedarwood, Sandalwood, Myrrh" },
    ingredients: {
      carrier: "Full INCI · in descending order",
      essentials: [
        "Simmondsia Chinensis (Jojoba) Seed Oil",
        "Pogostemon Cablin (Patchouli) Leaf Extract",
        "Pogostemon Cablin Leaf Oil",
        "Aniba Rosaeodora (Rosewood) Wood Extract",
        "Aniba Rosaeodora Wood Oil",
        "Piper Nigrum (Black Pepper) Fruit Extract",
        "Piper Nigrum Fruit Oil",
        "Boswellia Carterii (Frankincense) Resin Extract",
        "Boswellia Carterii Oil",
        "Cedrus Deodara (Himalayan Cedarwood) Wood Extract",
        "Cedrus Deodara Wood Oil",
        "Santalum Spicatum (Australian Sandalwood) Wood Extract",
        "Santalum Spicatum Wood Oil",
        "Commiphora Myrrha (Myrrh) Resin Extract",
        "Commiphora Myrrha Oil"
      ],
      zero: ANTRA_ZERO
    }
  },

  /* ---------------- GODDESS GROVE (botanical face oils · 15 ml) ---------------- */
  {
    id: "luna-celeste",
    name: "Luna Celeste Face Oil",
    collection: "grove",
    type: "Botanical Face Oil • Sensitive Skin",
    price: 1500,
    size: "15 ml",
    accent: "#d2a6ad",
    image: "assets/img/luna-1.jpg",
    gallery: ["assets/img/luna-1.jpg", "assets/img/luna-2.jpg"],
    eyebrow: "For sensitive skin",
    short: "A gentle, soothing blend of pomegranate, sea buckthorn & hibiscus. Dried chamomile flowers rest in every bottle.",
    story: "A careful selection of ingredients that are gentle and soothing. Pomegranate oil, sea buckthorn oil, and hibiscus extract are combined with blue chamomile into a nourishing blend — gentle yet effective for sensitive skin, providing hydration, repair, and a subtle glow without causing irritation. Dried chamomile flowers rest in every bottle.",
    quote: "Glow is the offering. You are the altar.",
    ingredients: {
      carrier: "Full INCI · in descending order",
      essentials: [
        "Punica Granatum (Pomegranate) Seed Oil",
        "Hippophae Rhamnoides (Sea Buckthorn) Seed Oil",
        "Hibiscus Sabdariffa (Hibiscus) Flower Extract",
        "Chamomilla Recutita (Blue Chamomile) Flower Oil",
        "Chamomilla Recutita (Chamomile) Flower"
      ],
      zero: "Alcohol, parabens, mineral oils, synthetic stabilisers, artificial fragrance"
    }
  },
  {
    id: "velvet-dew",
    name: "Velvet Dew Face Oil",
    collection: "grove",
    type: "Botanical Face Oil • Oily / Combination",
    price: 1500,
    size: "15 ml",
    accent: "#5a86b8",
    image: "assets/img/velvet-1.jpg",
    gallery: ["assets/img/velvet-1.jpg", "assets/img/velvet-2.jpg"],
    eyebrow: "Lightweight & balancing",
    short: "Grapeseed, argan, black seed & blue tansy — balances without greasiness. Dried rose & rhododendron rest in every bottle.",
    story: "A blend of grapeseed oil, argan oil, black seed oil, blue tansy and witch hazel extract. Lightweight, non-comedogenic, and balancing for sebum production — with anti-inflammatory, antioxidant and pore-refining benefits. Hydrates without greasiness while nourishing and protecting. Dried rose petals and rhododendron flowers rest in every bottle.",
    quote: "Glow is the offering. You are the altar.",
    ingredients: {
      carrier: "Full INCI · in descending order",
      essentials: [
        "Vitis Vinifera (Grapeseed) Seed Oil",
        "Argania Spinosa (Argan) Kernel Oil",
        "Nigella Sativa (Black Seed) Seed Oil",
        "Hamamelis Virginiana (Witch Hazel) Leaf Extract",
        "Tanacetum Annuum (Blue Tansy) Flower Oil",
        "Rosa Damascena (Rose) Flower",
        "Rhododendron Arboreum (Rhododendron) Flower"
      ],
      zero: "Alcohol, parabens, mineral oils, synthetic stabilisers, artificial fragrance"
    }
  },
  {
    id: "skin-witch",
    name: "Skin Witch Face Oil",
    collection: "grove",
    type: "Botanical Face Oil • Dry Skin",
    price: 1500,
    size: "15 ml",
    accent: "#9a8f4a",
    image: "assets/img/skinwitch-1.jpg",
    gallery: ["assets/img/skinwitch-1.jpg", "assets/img/skinwitch-2.jpg"],
    eyebrow: "For dry skin",
    short: "Rosehip, castor & frankincense with patchouli and geranium — a luxurious treatment for dry skin.",
    story: "A blend of rosehip oil, castor oil, and the essential oils of frankincense, patchouli and geranium — highly beneficial for dry skin. A luxurious, nourishing treatment providing hydration, repair, and a radiant glow.",
    quote: "Face oils for the goddess who needs no fixing.",
    ingredients: {
      carrier: "Full INCI · in descending order",
      essentials: [
        "Rosa Canina (Rosehip) Fruit Oil",
        "Ricinus Communis (Castor) Seed Oil",
        "Boswellia Carterii (Frankincense) Oil",
        "Pogostemon Cablin (Patchouli) Leaf Oil",
        "Pelargonium Graveolens (Geranium) Flower Oil"
      ],
      zero: "Alcohol, parabens, mineral oils, synthetic stabilisers, artificial fragrance"
    }
  },

  /* ---------------- THE APOTHECARY (balms, tint & mist) ---------------- */
  {
    id: "moon-veil",
    name: "Moon Veil",
    collection: "apothecary",
    type: "Botanical All-Purpose Balm",
    price: 1600,
    size: "10 g",
    accent: "#6f7a45",
    image: "assets/img/moon-veil-1.jpg",
    gallery: ["assets/img/moon-veil-1.jpg", "assets/img/moon-veil-2.jpg"],
    eyebrow: "Nourish · soothe · protect",
    short: "A rich, restorative balm for lips, hands, cuticles & dry patches — mugwort in jojoba with kokum & sea buckthorn.",
    story: "Moon Veil is a handcrafted botanical balm designed to nourish, soothe, and protect the skin. Mugwort and calendula are blended with kokum butter, castor oil, coconut oil, sea buckthorn fruit oil, vitamin E, and organic beeswax to create a rich, restorative balm for lips, hands, cuticles, dry patches, and everyday rituals of care.",
    quote: "For lips, hands, cuticles — and every small ritual of care.",
    ingredients: {
      carrier: "Full INCI · in descending order",
      essentials: [
        "Artemisia Vulgaris (Mugwort) Extract",
        "Calendula Officinalis Flower Extract",
        "Ricinus Communis (Castor) Seed Oil",
        "Garcinia Indica (Kokum) Seed Butter",
        "Calendula Officinalis (Calendula) Flower Oil",
        "Cocos Nucifera (Coconut) Oil",
        "Cera Alba (Organic Beeswax)",
        "Hippophae Rhamnoides (Sea Buckthorn) Seed Oil",
        "Tocopherol (Plant-Based Vitamin E)"
      ],
      zero: "Synthetic fragrance, parabens, artificial colour"
    }
  },
  {
    id: "red-moon",
    name: "Red Moon",
    collection: "apothecary",
    type: "Cyclical Support Balm",
    price: 2000,
    size: "15 g",
    accent: "#9a3b3b",
    image: "assets/img/red-moon-1.jpg",
    gallery: ["assets/img/red-moon-1.jpg", "assets/img/red-moon-2.jpg"],
    eyebrow: "Rest · ritual · cyclical care",
    short: "A warming balm for the lower abdomen — motherwort & yarrow infused in castor oil, sealed with beeswax.",
    story: "Red Moon is a handcrafted botanical balm created to support you during your cycle. Motherwort and yarrow are slowly infused into nourishing castor, coconut and jojoba oils, then sealed with organic beeswax to create a warming, comforting balm for the lower abdomen. Rooted in traditional herbal wisdom, it is designed to support moments of rest, ritual, and cyclical care.",
    quote: "Warmth for the lower belly — in moments of rest and ritual.",
    ingredients: {
      carrier: "Full INCI · in descending order",
      essentials: [
        "Ricinus Communis (Castor) Seed Oil",
        "Cocos Nucifera (Coconut) Oil",
        "Simmondsia Chinensis (Jojoba) Seed Oil",
        "Cera Alba (Organic Beeswax)",
        "Leonurus Cardiaca (Motherwort) Extract",
        "Achillea Millefolium (Yarrow) Extract",
        "Tocopherol (Plant-Based Vitamin E)"
      ],
      zero: "Synthetic fragrance, parabens, artificial colour"
    },
    caution: "Contains motherwort & yarrow. Not for use during pregnancy. For external use only."
  },
  {
    id: "dragons-blood",
    name: "Dragon’s Blood Lip & Cheek Tint",
    collection: "apothecary",
    type: "Lip & Cheek Tint",
    price: 1000,
    size: "5 g",
    accent: "#c23b3b",
    image: "assets/img/tint-1.jpg",
    gallery: ["assets/img/tint-1.jpg", "assets/img/tint-2.jpg"],
    eyebrow: "A stain of strength. A balm of healing.",
    short: "Sacred Dragon’s Blood resin reborn as a botanical tint — nature’s own red.",
    story: "The sacred Dragon’s Blood resin, drawn from the heart of ancient trees, has been revered for centuries — used by healers and priestesses alike to seal wounds, restore skin, and ward off harm. In this ritual of beauty, that same essence is reborn as a botanical tint, merging myth with medicine. No artificial pigment. No synthetic dyes. Just nature’s own red — vivid, powerful, eternal.",
    quote: "Warm it between your fingers. Anoint your lips, your cheeks, your pulse points. Whisper your becoming.",
    ingredients: {
      carrier: "Full INCI · in descending order",
      essentials: [
        "Helianthus Annuus (Sunflower) Seed Oil",
        "Dracaena Draco (Dragon’s Blood) Resin Extract",
        "Cera Alba (Organic Beeswax)",
        "Simmondsia Chinensis (Jojoba) Seed Oil",
        "Rosa Damascena (Rose) Flower Oil",
        "Tocopherol (Plant-Based Vitamin E)"
      ],
      zero: "Artificial pigment, synthetic dyes"
    },
    shelfLife: "12 months from opening. Store away from heat and direct sunlight."
  },
  {
    id: "enchantee-mist",
    name: "Enchantée Mist",
    collection: "apothecary",
    type: "Magnesium Body Mist",
    price: 899,
    size: "20 ml",
    accent: "#4f9d7a",
    image: "assets/img/mist-1.jpg",
    gallery: ["assets/img/mist-1.jpg", "assets/img/mist-2.jpg", "assets/img/mist-3.jpg"],
    eyebrow: "A ritual in a bottle",
    short: "Magnesium brine, rose hydrosol & firangi pani — a refreshing daily mist.",
    story: "A hand-poured blend of magnesium chloride, rose hydrosol, jojoba oil, and the rare fragrance of firangi pani (frangipani). Together they create a refreshing daily mist that neutralises odour, softens skin, and leaves behind the subtle aura of tropical blossoms. Light, breathable, and preservative-free — designed to be shaken before use, and treasured within three moons of opening.",
    quote: "Shake. Mist. Enchant.",
    bullets: [
      "100% natural — no aluminium, no parabens",
      "Small-batch, hand-crafted with intention",
      "Use within 3 months of purchase",
      "For external use only"
    ],
    ingredients: {
      carrier: "Full INCI · in descending order",
      essentials: [
        "Aqua (Distilled Water)",
        "Magnesium Chloride",
        "Rosa Damascena (Rose) Flower Water",
        "Simmondsia Chinensis (Jojoba) Seed Oil",
        "Plumeria Rubra (Frangipani) Flower Extract"
      ],
      zero: "Aluminium, parabens, synthetic fragrance"
    }
  }
];
