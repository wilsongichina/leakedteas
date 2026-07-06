# TEAS Set Folder Structure

Use this structure for every generated question set so files and assets do not mix.

For a current working snapshot of the active set generators, folder state, and recent fixes, see:

```text
SESSION_STATE.md
```

## Naming convention

Use the same naming convention everywhere in the project.

Folders:

```text
sets/
set-1/
set-2/
set-3/
...
set-10/
assets/
```

Rules:

- Use lowercase folder names.
- Use hyphens, not spaces or underscores.
- Use `set-N` for every set folder.
- Do not create folders like `set 10`, `Set 10`, `set_10`, or `teas-version-7-set-10`.
- Each set page must be named `index.html`.
- Each set must keep its own images in its own `assets/` folder.
- Public/deployed folders must mirror the local/source folder structure exactly.
- Set 7 is now generated at `sets/set-7/` and `public/sets/set-7/`.

Correct:

```text
sets/set-10/index.html
sets/set-10/assets/
public/sets/set-10/index.html
public/sets/set-10/assets/
```

Incorrect:

```text
set 10/
set_10/
Set 10/
set10-assets/
teas-version-7-set-10.html
```

## Canonical set layout

Local/source copy:

```text
sets/
  set-1/
    index.html
    assets/
  set-2/
    index.html
    assets/
  set-7/
    index.html
    assets/
  ...
  set-10/
    index.html
    assets/
```

Deployed/Vercel copy:

```text
public/
  sets/
    set-1/
      index.html
      assets/
    set-2/
      index.html
      assets/
    ...
    set-10/
      index.html
      assets/
```

## URL format

Use folder URLs without `.html`:

```text
/sets/set-1/
/sets/set-2/
...
/sets/set-10/
```

Do not link to `.html` question pages for new sets. Use the folder route only.

For Set 9, the active deployed page is:

```text
public/sets/set-9/index.html
```

and the online route is:

```text
/sets/set-9/
```

## Asset rule

Each set must keep its images and diagrams inside its own `assets` folder.

Example:

```text
public/sets/set-9/assets/math-set9-q23-scale.png
```

Inside that set page, reference the asset as:

```html
assets/math-set9-q23-scale.png
```

Do not place set-specific images in the global `assets/` folder.

Global `assets/` is only for shared site assets, such as:

```text
assets/whatsapp-popup.css
assets/whatsapp-popup.js
```

## Shared site files

Set pages are two folders deep, so shared root files should use `../../`.

Examples from a set page:

```html
<link rel="stylesheet" href="../../assets/whatsapp-popup.css">
<script src="../../quiz-config.js"></script>
<script src="../../assets/whatsapp-popup.js" defer></script>
```

Shared navigation links from a set page should also go up two folders:

```html
<a href="../../">Home</a>
<a href="../../about-us/">About Us</a>
<a href="../../contact-us/">Contact</a>
<a href="../../pricing/">Pricing</a>
<a href="../../#practice-tests">View Other Sets</a>
```

Public pages follow the same rule because they also live two folders deep:

```text
public/sets/set-N/index.html
```

When cloning a template from another set, rewrite every internal reference that still points at the source set:

```text
TEAS Version 7 Set 9 -> TEAS Version 7 Set N
/sets/set-9/ -> /sets/set-N/
sets/set-9/ -> sets/set-N/
set-9/index.html -> set-N/index.html
```

Do not leave any template-only Set 9 labels or links in the generated Set N page.

## When adding a new set

1. Create the local source page:

```text
sets/set-N/index.html
sets/set-N/assets/
```

2. Create the deployed copy:

```text
public/sets/set-N/index.html
public/sets/set-N/assets/
```

3. Put all set-specific images in that set's `assets/` folder.

4. Use the reusable question container inside the set page:

```js
const quizPageConfig = {
  titlePrefix: "TEAS Version 7 Set N",
  defaultSubject: "reading",
  subjects: [
    { key: "reading", label: "Reading" },
    { key: "math", label: "Math" },
    { key: "science", label: "Science" },
    { key: "english", label: "English" }
  ]
};
```

5. Update homepage links to point to:

```text
sets/set-N/
```

For public homepage links, use:

```text
./sets/set-N/
```

6. Update `sitemap.xml` and `public/sitemap.xml` with:

```xml
<loc>https://www.teasgurus.com/sets/set-N/</loc>
```

7. If using Render routes, add a rewrite:

```yaml
- type: rewrite
  source: /sets/set-N/
  destination: /sets/set-N/index.html
```

8. If using Vercel, update `vercel.json` with an explicit rewrite:

```json
{
  "source": "/sets/set-N/",
  "destination": "/sets/set-N/index.html"
}
```

This prevents folder routes from depending only on static hosting defaults.

9. Keep the same link style everywhere:

Root-level pages:

```html
<a href="sets/set-N/">Start Practice</a>
```

Public root page:

```html
<a href="./sets/set-N/">Start Practice</a>
```

Public subpages such as `public/about-us/index.html`:

```html
<a href="../sets/set-N/">Start Practice</a>
```

Set pages:

```html
<a href="../../sets/set-N/">Start Practice</a>
```

10. If the new set is the newest set in a year collection, update both links on the home page:

```html
<a class="set-link" href="sets/set-N/">
<a class="btn btn-primary" href="sets/set-N/">Start 2026 Practice</a>
```

For `public/index.html`, use:

```html
<a class="set-link" href="./sets/set-N/">
<a class="btn btn-primary" href="./sets/set-N/">Start 2026 Practice</a>
```

Do not update only the set card and forget the year-level primary button.

## Compatibility redirects

Old Set 9 paths are kept only as compatibility redirects:

```text
teas-version-7-set-9.html
teas-version-7-set-9/index.html
public/teas-version-7-set-9/index.html
```

New sets should use `/sets/set-N/` directly.

## Shared question page container

The common reusable question-page container is stored in the root:

```text
question-page-container.js
```

Use this root file as the source for shared quiz logic when generating future question pages. It contains the common structure for:

- normalizing `quizData`
- creating `quizContainer`
- creating per-subject quiz state
- timer formatting
- preview limit config
- safe image attribute handling
- question scrolling

Generated set pages should still keep their own `quizData` and set-specific assets inside their own folder:

```text
public/sets/set-N/index.html
public/sets/set-N/assets/
```

## Question data format

Use the same data shape for every generated question page:

```js
const quizData = {
  reading: {
    title: "Reading",
    duration: "00:55:00",
    totalOriginal: 45,
    questions: [
      {
        questionNumber: 1,
        question: "<div>Question text goes here.</div>",
        image: "assets/example.png",
        imageAlt: "Description of image",
        options: ["A", "B", "C", "D"],
        correct: 0,
        explanation: "Explanation goes here."
      }
    ]
  }
};
```

Notes:

- `image` is optional.
- If a question has an image, the image path should start with `assets/`.
- `correct` is zero-based: `0` means option A, `1` means option B, etc.
- Keep subject keys lowercase: `reading`, `math`, `science`, `english`.
- Keep subject labels in `quizPageConfig`.

## Preview configuration

Preview limits are controlled by:

```text
quiz-config.js
public/quiz-config.js
```

The important setting is:

```js
previewPercent: 100
```

Set pages should read this config on page load. Do not hard-code preview limits inside individual set pages.

## Current Set 9 status

Set 9 has already been moved into the correct structure:

```text
sets/set-9/index.html
sets/set-9/assets/
public/sets/set-9/index.html
public/sets/set-9/assets/
```

The old Set 9 asset folders were replaced by the new per-set asset folders:

```text
set9-assets/
public/set9-assets/
```

Those old folders should not be used again.

## Current Set 8 status

Set 8 is generated from the uploaded source folder:

```text
set 8/
```

The source subject folders are title case, not uppercase:

```text
set 8/Reading/
set 8/Math/
set 8/Science/
set 8/English/
```

Generated files should live here:

```text
sets/set-8/index.html
sets/set-8/assets/
public/sets/set-8/index.html
public/sets/set-8/assets/
```

The Set 8 builder is:

```text
build-set8-page.js
```

The source arrays currently parse to:

```text
Reading: 44 questions
Math: 38 questions
Science: 49 questions
English: 36 questions
```

These counts come from the source HTML arrays, even when the screenshot file names imply a larger original total.

## Current Set 4 status

Set 4 is generated from the uploaded source folder:

```text
Set 4/
```

The source subject folders include the full TEAS prefix:

```text
Set 4/ATI TEAS Version 7 - Reading/
Set 4/ATI TEAS Version 7 - Math/
Set 4/ATI TEAS Version 7 - Science/
Set 4/ATI TEAS Version 7 - English/
```

Generated files should live here:

```text
sets/set-4/index.html
sets/set-4/assets/
public/sets/set-4/index.html
public/sets/set-4/assets/
```

The Set 4 builder is:

```text
build-set4-page.js
```

The source arrays currently parse to:

```text
Reading: 25 questions
Math: 28 questions
Science: 33 questions
English: 26 questions
```

The Set 4 source has empty `extracted-diagrams/` folders and no embedded question image references at generation time.

## Current Set 5 status

Set 5 is generated from the uploaded source folder:

```text
Set 5/
```

The source subject folders include the full TEAS prefix:

```text
Set 5/ATI TEAS Version 7 - Math/
Set 5/ATI TEAS Version 7 - Science/
Set 5/ATI TEAS Version 7 - English/
```

No Reading extracted-question HTML file is present in the current Set 5 source folder. The generated page therefore starts with Math as the default subject.

Generated files should live here:

```text
sets/set-5/index.html
sets/set-5/assets/
public/sets/set-5/index.html
public/sets/set-5/assets/
```

The Set 5 builder is:

```text
build-set5-page.js
```

The source arrays currently parse to:

```text
Math: 29 questions
Science: 45 questions
English: 29 questions
```

The Set 5 source has empty `extracted-diagrams/` folders and no embedded question image references at generation time.

## Current Set 1 status

Set 1 is generated from the uploaded source folder:

```text
Set 1/
```

The source subject folders include:

```text
Set 1/ATI TEAS Version 7 - Reading/
Set 1/ATI TEAS Version 7 - Math/
Set 1/ATI TEAS Version 7 - Science/
Set 1/ATI TEAS Version 7 - English Language and Usage/
```

Generated files should live here:

```text
sets/set-1/index.html
sets/set-1/assets/
public/sets/set-1/index.html
public/sets/set-1/assets/
```

The Set 1 builder is:

```text
build-set1-page.js
```

The source arrays currently parse to:

```text
Reading: 45 questions
Math: 38 questions
Science: 50 questions
English: 37 questions
```

The Set 1 source has empty `extracted-diagrams/` folders and no embedded question image references at generation time.

Set 1 image-backed questions are mapped by question number:

```text
Reading: 42
Math: 6
Science: 25
```

The current English source does not include a diagram image file to attach.

## Current Set 2 status

Set 2 is generated from the uploaded source folder:

```text
Set 2/
```

The source subject folders include:

```text
Set 2/ATI TEAS Version 7 - Reading/
Set 2/ATI TEAS Version 7 - Math/
Set 2/ATI TEAS Version 7 - Science/
Set 2/ATI TEAS Version 7 - English Language and Usage/
```

Generated files should live here:

```text
sets/set-2/index.html
sets/set-2/assets/
public/sets/set-2/index.html
public/sets/set-2/assets/
```

The Set 2 builder is:

```text
build-set2-page.js
```

The source arrays currently parse to:

```text
Reading: 45 questions
Math: 38 questions
Science: 49 questions
English: 37 questions
```

The Set 2 source has embedded diagram images only in Science. Those images are already inline in the question source, so the generator should not add a second external `image` field for them. The relevant question numbers are:

```text
Science: 4, 8, 17, 24, 38, 39, 45
```

## Current Set 3 status

Set 3 is generated from the source folder:

```text
set 3/
```

The Set 3 source folders include:

```text
set 3/READING/
set 3/MATH/
set 3/SCIENCE/
set 3/ENGLISH/
```

Generated files should live here:

```text
sets/set-3/index.html
sets/set-3/assets/
public/sets/set-3/index.html
public/sets/set-3/assets/
```

Set 3 Reading uses inline diagram references in the ChatGPT HTML. If the exact file is missing in `set 3/READING/`, copy the equivalent asset from Set 2 and save it under the Set 3 asset filename.

Set 3 Reading image-backed questions:

```text
Reading: 35, 41
```

Set 3 Science image-backed questions:

```text
Science: 4, 8, 17, 24, 38, 39, 45
```

## Current Set 6 status

Set 6 is generated from the source folder:

```text
set 6/
```

The Set 6 source folders use title case:

```text
set 6/Reading/
set 6/Math/
set 6/Science/
set 6/English/
```

Generated files live here:

```text
sets/set-6/index.html
sets/set-6/assets/
public/sets/set-6/index.html
public/sets/set-6/assets/
```

The current extracted source counts are:

```text
Reading: 45 questions
Math: 38 questions
Science: 50 questions
English: 37 questions
```

The Set 6 source HTML did not expose inline image references in the parsed question arrays, so the generated page uses the question text and options only.

## Important cleanup note

There is an unrelated root folder named:

```text
set 10/
```

That folder does not follow the naming convention. Do not use it for generated pages. Future Set 10 files should go here instead:

```text
sets/set-10/
public/sets/set-10/
```

## Local vs deployed set links

Use different link styles for source/local files and deployed `public/` files:

```text
Local root pages: sets/set-N/index.html
Local subpages: ../sets/set-N/index.html
Local folder pages: about-us/index.html, contact-us/index.html, pricing/index.html
Local folder-page nav: ../about-us/index.html, ../contact-us/index.html
Deployed public pages: ./sets/set-N/ or ../sets/set-N/
```

Reason: when the site is opened locally with `file://`, folder links like `sets/set-10/` or `../about-us/` can open the Windows folder listing instead of loading the page. Vercel should keep clean folder URLs and use `vercel.json` rewrites.

## Image placement rule

When a set source includes diagram or question images, the generator must confirm that each image is attached to the correct question number before the page is published.

Required checks:

```text
Image file exists in the set assets folder.
Image is mapped to the intended question number.
Image appears in both sets/set-N/index.html and public/sets/set-N/index.html.
No extra image is injected into the wrong question.
If the source question already contains an inline `<img>` inside `stimulusHtml`, do not add a second external `image` field for that question.
Only use assets from `extracted-diagrams/` for question images. Do not attach standalone question screenshots from the subject root.
```

## Verification checklist

After adding or moving a set, verify:

- The page exists in both `sets/set-N/index.html` and `public/sets/set-N/index.html`.
- Images exist in both `sets/set-N/assets/` and `public/sets/set-N/assets/`.
- Image references inside the page use `assets/file-name.png`.
- Shared files use `../../`.
- Local home/about/contact/pricing links point directly to `sets/set-N/index.html` or `../sets/set-N/index.html`.
- Local navigation links point directly to folder `index.html` files, including hash anchors such as `pricing/index.html#pricing-options`.
- Public home/about/contact/pricing links use clean `/sets/set-N/` routes.
- The home page set card and year-level primary button both point to the correct set.
- `sitemap.xml` and `public/sitemap.xml` use `/sets/set-N/`.
- `vercel.json` has a rewrite for `/sets/set-N/`.
- JavaScript parses without errors.
- Static link checks pass for `index.html` and `public/index.html`.
- Image-backed questions are checked against the source folder before finalizing the set.
