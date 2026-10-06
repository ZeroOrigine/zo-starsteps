# Star Steps Library: how to write a book

You are writing illustrated non-fiction books for children for the Star Steps Library (starsteps.zeroorigine.com/library/). Each book is ONE JSON file. The reader app adds a cover, a contents page and a "The End" page, so a book with N content pages shows as N+3 pages. Every book must end up between 23 and 54 pages in total.

Write the file to: `/tmp/claude-0/-home-claude/4b3afc06-246e-5478-b440-46a46d6cfa84/scratchpad/ssproj/public/library/books/<id>.json`
Then validate: `node /tmp/claude-0/-home-claude/4b3afc06-246e-5478-b440-46a46d6cfa84/scratchpad/libtest/validate.mjs <that file>` and fix every ERROR (warnings are advice). Do not finish until all your files PASS.

## Voice and accuracy
- Plain, warm, direct. Short sentences. No filler, no "In this chapter we will". Talk to the reader as "you".
- Every fact must be true and current (2026). Use metric units and Canadian spelling (colour, metre, centre). Give real numbers with units. If scientists disagree, say so in one line.
- Make the reader feel surprise: lead with the strange, big or beautiful fact, then explain it simply. One idea per page.
- No song lyrics, no quotes from books, no copyrighted characters. No AI product names anywhere. Straight quotes only (" and '), no curly quotes. No line breaks inside a paragraph string.
- Reading level is set by grade (see the word budget). Younger = fewer, shorter words; concrete pictures; one sentence per line of thought. Older = explain the "why", include a number and a comparison.

## JSON schema (exact keys)
```json
{
 "id": "g2-magnets",
 "title": "The Invisible Pull",
 "subtitle": "What magnets do and why",
 "grade": 2,
 "subject": "Physics",
 "minutes": 12,
 "cover": {"scene": "magnet", "c": ["#d9463a", "#3b7dd8"]},
 "pages": [
  {"k":"ch", "h":"Chapter heading", "p":["paragraph", "paragraph"], "art":{"s":"magnet"}, "cap":"one-line picture caption", "fact":"Did you know? one surprising true line (optional)"},
  {"k":"big", "h":"One short punchy line", "p":["one or two sentences, under 60 words"], "art":{"s":"orbit"}},
  {"k":"try", "h":"Try it: float a needle", "p":["one-line intro"], "steps":["step","step","step"], "art":{"s":"float"}, "cap":"caption", "safe":"optional safety line"},
  {"k":"quiz", "q":"Question?", "opts":["a","b","c"], "a":1, "why":"one line explaining the right answer"},
  {"k":"words", "items":[["word","child-friendly meaning"], ["word","meaning"]]},
  {"k":"think", "qs":["open question with no single right answer", "another"]}
 ]
}
```
- `id`: grade prefix then slug: `sk-` (Senior Kindergarten, grade 0), `g1-` … `g6-`, `g7-` (Grade 7 and up). Lowercase, hyphens.
- `grade`: 0 (SK) to 7. `subject`: one of Physics, Chemistry, Biology, Earth, Space, Body, History, Inventions, Maths, Nature, Oceans, Technology.
- `minutes`: honest reading time (about 1 minute per 80 words for grade 3+, 1 minute per 40 words for younger).
- `cover.c`: two hex colours for the cover gradient that suit the topic.
- `art.s`: a scene name from the catalogue below. Optional `art.v`: values for scenes that take them.
- Page order rules: chapters ("ch") are at least 55% of pages; 2–6 quiz pages spread through the book (never two in a row); 1–4 "big" spreads; 1–3 "try" pages; exactly one "words" page as the second-to-last page; exactly one "think" page as the last page.

## Word budget per "ch" page (all paragraphs together) and content-page count
| grade | words per chapter page | content pages ("pages" array) | total pages shown |
|---|---|---|---|
| 0 (SK) | 12–40 | 20–28 | 23–31 |
| 1 | 20–55 | 20–30 | 23–33 |
| 2 | 35–80 | 22–34 | 25–37 |
| 3 | 50–100 | 24–38 | 27–41 |
| 4 | 70–130 | 26–42 | 29–45 |
| 5 | 90–155 | 28–46 | 31–49 |
| 6 | 110–185 | 30–51 | 33–54 |
| 7 | 130–240 | 32–51 | 35–54 |
Vary the pictures: use at least 6 different scenes per book, and put a picture (`art` + `cap`) on every chapter page.

## Scene catalogue (use the exact name in `art.s`)
Physics: `prism` (white light splits into a rainbow), `pendulum` (swinging pendulum; v.len 0.4–0.8), `ramp` (ball rolls down a ramp and keeps rolling), `magnet` (bar magnet with field lines), `circuit` (battery, switch, bulb; v.on true/false to freeze), `sound` (speaker, sound waves, ear), `orbit` (planet orbiting the Sun with gravity and speed arrows), `lever` (seesaw lifting a heavy load), `gears` (three meshing gears), `rocket` (rocket launch, action and reaction), `float` (boat floats, stone sinks), `heat` (hot cup, heat flowing to a thermometer), `lightning` (storm, lightning strike), `rainbow` (sun, rain, rainbow), `shadow` (sun moves, a child's shadow changes), `echo` (bat, sound bouncing off a wall), `wing` (airflow over a wing, lift), `pulley` (pulley lifting a load).
Chemistry: `states` (water molecules as solid/liquid/gas; v.state "solid"|"liquid"|"gas" to freeze), `molecule` (H2O molecule), `reaction` (two liquids mix, colour change, bubbles), `candle` (burning candle with oxygen in, gases out), `dissolve` (salt dissolving in water).
Life and body: `cell` (animal cell with nucleus and organelles), `dna` (double helix), `heart` (beating heart, blood in and out), `lungs` (breathing), `seed` (seed to flower time-lapse), `foodchain` (sun, grass, rabbit, fox), `butterfly` (egg, caterpillar, chrysalis, butterfly), `neuron` (signal jumping between neurons), `reef` (coral reef with fish), `deepsea` (anglerfish in the dark), `seasons` (one tree through four seasons), `bee` (bee carrying pollen between flowers), `germs` (germs and a white blood cell), `bones` (skeleton).
Earth and weather: `volcano` (cross-section eruption), `watercycle`, `layers` (Earth's crust, mantle, core), `plates` (plates collide, mountains rise), `iceberg` (9/10 under water), `tilt` (Earth's tilt around the Sun = seasons), `moonphases` (8 phases), `daynight` (spinning Earth, day and night), `strata` (rock layers with fossils, older below), `dinowalk` (walking sauropod), `tornado`.
History and inventions: `pyramid` (building the pyramid with ramps), `castle`, `wheel` (cart with wheels), `timeline` (v.items [["3000 BC","writing"],...] up to 6 items, v.title), `ship` (sailing ship under the North Star), `bridge` (suspension bridge with a car), `lightbulb` (filament glowing on/off), `train` (steam train), `telescope` (Galileo looking at the Moon), `computer` (8 bits make a byte and a number), `robot`.
Maths: `fractions` (pie; v.n slices of v.d), `numberline` (frog hopping; v.max, v.hop), `shapes` (triangle, square, pentagon, hexagon), `symmetry` (butterfly with a mirror line), `graph` (bar chart; v.bars [["Mon",3],...], v.title), `spiral` (sunflower Fibonacci spiral), `compare` (two balls to scale; v.a, v.b widths, v.la, v.lb names, v.ca, v.cb colours, v.title), `scale` (balance scale), `dice` (rolling die, chance), `coins` (v.items [[1,"1¢"],[5,"5¢"],...]), `clock` (analogue clock), `city` (night skyline), `people` (six different children; v.title).
Space (code-drawn, from The Edge of Knowing): `space:bang` (Big Bang), `space:light` (first light, cosmic map), `space:stars` (first stars, supernova), `space:galaxy` (spiral galaxy), `space:sun` (Sun and disk forming), `space:moon` (giant impact makes the Moon), `space:life` (first cells dividing), `space:cambrian` (strange sea animals), `space:dino` (asteroid strikes), `space:fire` (early humans around a fire), `space:earth` (Earth at night with satellites), `space:hole` (black hole with glowing disk), `space:kilonova` (two neutron stars collide, gold), `space:transit` (planet crossing its star, brightness dip), `space:mars` (Mars drying out), `space:jupiter` (Jupiter and the Red Spot with Earth to scale), `space:voyager` (Voyager leaving the Sun), `space:andromeda` (two galaxies approaching), `space:fade` (stars going out), `space:giant` (red giant Sun), `space:saturnart` (Saturn's rings), `space:atomart` (an atom: nucleus and electron cloud), `space:cometart` (comet with two tails), `space:pulsarart` (pulsar beams), `space:nothing` (before time: flickers in the dark).

Pick the scene that truly matches the page. If no scene fits a page exactly, choose the closest one and write the caption so it makes sense (for example, `compare` can show any two sizes with the right v values; `timeline` can hold any six dated events; `graph` any five numbers).
