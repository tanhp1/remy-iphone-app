export const PANTRY_SUGGESTIONS = [
  { id: 'r1', title: 'Garlic Butter Chicken',    cuisine: 'American', time: 28, tag: 'Keto',        match: 97, emoji: '🍗', color: '#B85042' },
  { id: 'r3', title: 'Sesame Broccoli Stir-Fry', cuisine: 'Asian',    time: 18, tag: 'Vegan',       match: 91, emoji: '🥦', color: '#6B9E72' },
  { id: 'r2', title: 'Egg Fried Rice',            cuisine: 'Asian',    time: 22, tag: 'Vegetarian', match: 88, emoji: '🍳', color: '#BA7517' },
];

// Per-step contextual responses — keyed by step number (0-indexed)
export const STEP_RESPONSES = {
  0: [
    "For step 1, the most common mistake is rushing the heat. Give your pan a full minute to reach the right temperature before adding anything — a drop of water should evaporate instantly.",
    "Take your time here. The prep in this step sets up everything that comes after. A clean workspace and prepped ingredients make the whole cook smoother.",
    "Don't skip this step even if you're in a hurry. This foundation step directly affects the texture and flavor of the final dish.",
  ],
  1: [
    "This step is where most of the flavor develops. High heat and minimal stirring is the key — let the food make contact with the pan.",
    "If things are moving too fast, reduce the heat slightly. You want a steady sizzle, not a furious one.",
    "Smell is your best indicator here. When the aromatics are ready you'll smell a deep, toasted fragrance — that's your cue to move on.",
  ],
  2: [
    "Patience is critical here. The temptation to stir is strong — resist it. Contact time with the heat is what creates color and depth of flavor.",
    "If you see smoke, your heat is too high. Drop it down a notch and give the pan 30 seconds to recover before continuing.",
    "This is a good moment to prep anything you haven't finished yet — get your next ingredients ready while this step does its thing.",
  ],
  3: [
    "Taste as you go from this point on. Seasoning at this stage is much more effective than correcting at the end.",
    "The consistency should be changing noticeably by now. If it looks the same as when you started, your heat may need adjusting.",
    "Add any liquid slowly and in stages — you can always add more but you can't take it away.",
  ],
  4: [
    "You're in the home stretch. Don't rush the finish — the last few minutes are where everything comes together.",
    "This is the moment to do a final seasoning check. A pinch of salt and a squeeze of acid (lemon, vinegar) can elevate everything right at the end.",
    "Lower and slower is better at this stage. You've built the flavors — now just let the heat finish the job gently.",
  ],
};

// Keyword-matched responses for freeform questions
export const ASK_REMY_RESPONSES = {
  fold:        "Folding means gently combining with a rubber spatula in a wide circular motion — you're preserving air, not beating it out. Think of it as turning the bowl, not stirring the batter.",
  substitute:  "For sesame oil, a small amount of toasted sunflower oil works well, or skip it entirely. Avoid regular olive oil — the flavor profile is too dominant for this dish.",
  done:        "The chicken is done at 165°F internally. No thermometer? Cut the thickest piece — juices should run clear with zero pink. If in doubt, give it another 2 minutes.",
  temperature: "Medium-high heat means your pan should be hot enough that a drop of water balls up and dances across the surface before evaporating. If it just sits and steams, go hotter.",
  timing:      "Timing in cooking is a guide, not a rule. Use visual and smell cues more than the clock — color, texture, and aroma tell you more than a timer ever could.",
  salt:        "Season in layers — a little at each stage builds depth. Salt added only at the end sits on the surface. Taste as you go and trust your palate.",
  oil:         "The oil is ready when it shimmers and flows easily across the pan. A tiny piece of food dropped in should sizzle immediately. If it doesn't, wait another 30 seconds.",
  heat:        "If things are burning, pull the pan off the heat entirely for 30 seconds rather than just lowering the burner — pans hold heat longer than people expect.",
  rest:        "Resting meat after cooking lets the muscle fibers relax and reabsorb the juices. Cut too early and the juices run straight onto your cutting board. 5 minutes minimum.",
  spicy:       "To reduce heat, add dairy (cream, yogurt, butter) or a starchy element (potato, bread). Acid like lemon juice can also help balance capsaicin without diluting flavor.",
  default:     "Great question. For this step, trust your senses more than the recipe — the goal is the texture and color described, not a specific minute count. You're doing great.",
};

// Contextual responses based on step keywords
export const getStepContextResponse = (stepText, stepIndex) => {
  const lower = stepText.toLowerCase();

  if (lower.includes('sear') || lower.includes('brown'))
    return "The sear is everything here. Don't move the food once it's in the pan — contact time is what creates the crust. If it sticks, it's not ready to flip yet.";
  if (lower.includes('simmer') || lower.includes('reduce'))
    return "A simmer is small bubbles breaking the surface every second or two — not a rolling boil. Too hot and you'll cook off your liquid too fast and cloud the sauce.";
  if (lower.includes('rest') || lower.includes('cool'))
    return "This rest period is doing real work. The residual heat continues cooking gently while the proteins relax. Don't skip it even when you're hungry.";
  if (lower.includes('season') || lower.includes('taste'))
    return "Season, taste, adjust. Repeat until it tastes like it's almost too good. Most home cooks under-season — be a little bolder than feels comfortable.";
  if (lower.includes('mix') || lower.includes('combine') || lower.includes('stir'))
    return "Mix until just combined unless instructed otherwise — overworking develops gluten in flour-based recipes and can make proteins tough.";
  if (lower.includes('heat') || lower.includes('preheat'))
    return "A properly preheated surface is non-negotiable. Cold pan = food steams instead of sears. Give it at least 60–90 seconds on medium-high before adding anything.";

  // Fall back to step-indexed responses
  const pool = STEP_RESPONSES[Math.min(stepIndex, 4)] ?? STEP_RESPONSES[4];
  return pool[Math.floor(Math.random() * pool.length)];
};
