# AP Cybersecurity — Lessons Site

A static, student-facing lessons page for La Salle College High School's AP Cybersecurity course, mapped day-by-day to the BDFH rotation schedule (78 sessions, August 25, 2026 – May 21, 2027). Thanks to PhillyComputerScience [phillycomputerscience.com/lessons](https://phillycomputerscience.com/lessons/) for the idea!

## What's in here

```
site/
  index.html          the page itself
  assets/
    style.css         all styling (LSCHS navy/gold branding)
    app.js            fetches the JSON, renders cards, search, unit nav, "today" banner
    logo-color.png     OIT shield logo (used in the header)
    logo-white.png
  data/
    schedule.json      the 78 sessions — this is the file you'll edit most often
    meta.json          unit list + summary stats, derived from schedule.json
```

## Editing the schedule

Don't hand-edit `schedule.json` unless you have to — it's generated. If the school calendar changes (snow day, schedule shuffle, new unit pacing), the cleanest path is:

1. Update the source data (the same `full_plan.json` used to build the Excel calendar) with the corrected dates/content.
2. Re-run the transform script that produced `schedule.json` and `meta.json` (ask me to regenerate it, or if you're comfortable with Python, the script is a short one that maps each session dict onto a date and writes the two JSON files).
3. Replace `data/schedule.json` and `data/meta.json` in this folder — no other files need to change.

If you just need to tweak wording on one lesson, editing the matching object in `schedule.json` directly is fine too — it's plain JSON, one object per session, with fields: `date`, `dateLabel`, `letter`, `unitKey`, `unitLabel`, `unitColor`, `topic`, `stype`, `stypeLabel`, `title`, `activity`, `resources` (array of `{label, kind}`), `anchor`.

## Publishing with GitHub Pages

1. **Create a repository.** On [github.com](https://github.com), click **New repository**. Name it something like `ap-cybersecurity-lessons`. Public repos get free GitHub Pages hosting; if this needs to be private, GitHub Pages for private repos requires a paid GitHub plan.
2. **Upload these files.** Easiest path if you're not using git day-to-day: on the new repo's page, click **Add file → Upload files**, and drag in everything from this `site/` folder (keep the `assets/` and `data/` subfolders intact). Commit directly to `main`.
   - If you do use git: `git init`, `git add .`, `git commit -m "Initial site"`, `git remote add origin <your-repo-url>`, `git push -u origin main`.
3. **Turn on Pages.** In the repo, go to **Settings → Pages**. Under "Build and deployment," set **Source** to **Deploy from a branch**, branch **main**, folder **/ (root)**. Save.
4. **Wait about a minute**, then refresh — GitHub shows the live URL at the top of that same Pages settings screen. It'll look like `https://<your-username>.github.io/ap-cybersecurity-lessons/`.
5. **(Optional) Custom domain.** If you'd rather this live at something like `cyber.lschs.org`, add a `CNAME` file to the repo root containing just that domain name, then in LSCHS's DNS add a `CNAME` record pointing `cyber` (or whatever subdomain) to `<your-username>.github.io`. GitHub's Pages settings page has a "Custom domain" field that automates the `CNAME` file creation for you.

Every time you push an updated `schedule.json` (or any file) to `main`, GitHub Pages rebuilds automatically within a minute or two — no separate deploy step.

## Notes

- The "Jump to Today" button and the today banner use the visitor's own browser clock, so they'll correctly reflect whatever day it is when a student loads the page — nothing to update yourself as the year goes on.
- All content in `schedule.json` was written to be classroom-appropriate for public display (no answer keys or internal-only notes) — the one exception scrubbed out was an internal proctor-logistics note on the AP Exam day entry.
- If you want a page per lesson instead of one scrolling page, the `schedule.json` data is already structured to make that straightforward later — it's a bigger lift (78 individual HTML files or a static-site generator like 11ty/Jekyll) and wasn't necessary for a first version.
