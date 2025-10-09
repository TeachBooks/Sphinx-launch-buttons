# Custom launch buttons

## Introduction
The custom launch button extension allows you to create a customizable button in the top right of your jupyter book.
This may have many applications:

- multilingual books
- no-solution/solution versions of the book available for the user.
- Link to different versions of the book for different academic years.

## What does it do?
This extension adds buttons to the top bar which allow you to link to other websites.

## Installation

1. Install the `sphinx-launch-buttons` package using `pip` if you'd like to build your book locally:

```bash
pip install sphinx-launch-buttons
```

2. Make sure that the package is included in your project's `requirements.txt` to track the dependency:

```
sphinx-launch-buttons
```

3. To use the extension in your book, add the extension to the list of Sphinx extra extensions in your `_config.yml` file, (**important**: underscore, not dash this time):

```yaml
sphinx:
  extra_extensions:
    - sphinx-launch-buttons
```

or in plain Sphinx `conf.py`:

```py
extensions.append('sphinx_launch_buttons')
```

## Usage
This section describes the common usages. The extension is flexible and the buttons are fully configurable via `_launch_buttons.yml`.

1. Include a `_launch_buttons.yml` file in the same location (root directory of your book) as your `_config.yml` file. The following snippet shows the main structure:

```yaml
buttons:
  - type: dropdown

  - type: button
```

## Version mappings

Version mappings are integrated into the `buttons` configuration. You can
provide version mappings as regular `button` items or as `dropdown` items.

A mapping entry (used for both `button` and `dropdown` items) supports these keys:

- `label` – visible text for the entry (shown in the UI)
- `url` – a concrete href; if present it is used as-is and takes precedence
  over other mapping fields (use this when you want a fixed target)
- `icon` – optional icon HTML or name to display alongside the label. Note:
  the extension accepts an `icon` key in the YAML but the lightweight
  front-end currently treats icons as a no-op (there is a TODO to render
  icons in the client). You can still include inline SVG here for
  downstream themes that render it.
- `version` – a version path segment to insert when building a mapping-based
  URL
- `root: true` – mark the entry as the no-version/root target
- `base_url` – optional per-entry base URL (overrides `html_baseurl`)
- `preserve_path` – boolean, default true; when true the remainder of the
  current page path is preserved, when false the entry points to the base
  root (or base + version root) without appending the remainder of the URL

Additional top-level/button keys

- `type` – on top-level `buttons` entries this should be `button` or
  `dropdown` (controls whether a single control or a menu is shown)
- `items` – for `dropdown` entries, an array of mapping objects (each
  item supports the keys above)

Aliases and fallbacks

- `name` or `value` may be used as alternative keys for `label`/`version` in
  some YAML snippets; the front-end will fall back to these when building
  labels or versions.

You can use these mappings either as individual `button` items or as items
inside a `dropdown`. Example (preferred):

```yaml
buttons:
  - type: dropdown
    label: Versions
    items:
      - label: "Workbook 2025"
        version: "workbook-2025"
        preserve_path: true

      - label: "Workbook root"
        root: true
        preserve_path: false
```

Or you can define a single `button` which itself is a version mapping (a
convenience for a single-link button):

```yaml
buttons:
  - type: button
    label: "Go to 2025"
    version: "workbook-2025"
    preserve_path: true
```

Prefer embedding mappings directly in `buttons` for clearer layout and
finer control.

#### When to use `url` vs `base_url`

Use `url` when you already have a concrete target URL for a button or menu
item. `url` is used as-is and takes precedence over other mapping fields.

Use `base_url` when you want the extension to compute a link to another
version/root of the same site: provide `base_url` plus `version` (or
`root: true`) and the extension will combine them and optionally append the
remainder of the current path according to `preserve_path`.

Examples:

1) Fixed external link (use `url`):

```yaml
buttons:
  - type: dropdown
    label: Resources
    items:
      - label: Project site
        url: https://example.com/project
```

2) Version mapping (use `base_url` + `version`):

```yaml
buttons:
  - type: button
    label: "Go to 2025"
    base_url: "https://teachbooks.github.io/workbook"
    version: "workbook-2025"
    preserve_path: true
```


Each `buttons` entry may be of type `dropdown` or `button`. Dropdowns can contain `items:` with `label` and `url`.

Example with icon and items:

```yaml
buttons:
  - type: dropdown
    label: Language
  - type: button
    icon : <svg> ... </svg>
    items:
      - label: English
        url: https://teachbooks.github.io/files-and-folders/EN
      - label: Nederlands
        url: https://teachbooks.github.io/files-and-folders/NL
```

Note: the `_launch_buttons.yml` file is optional. If it is not present when building HTML, the extension will not install any launch-button assets and no buttons will be shown.

### Setting up your repository for multilingual books

For the implementation to your book, it is handy to create a branch for each language version you want to offer. Make a new branch using for example `main` as a source. Translate the content in the language branch and merge changes between branches as needed.

You'll need to add (merge) the updated `_config.yml` and the new `_launch_buttons.yml` to all of your branches.

For the implementation to your book, it is handy to create a branch for each language version you want to offer. Make a new branch using for example `main` as a source. Assuming we want to create a Dutch version you can call this branch `Dutch` or `Nederlands`.

You will then need to translate the content in the Dutch branch to Dutch which can take some time. From experience, the DeepL translator is a good tool for this but any translation tool or AI assistant may be helpful as well. Make sure to proofread the translation.

*Suggested tool:* [DeepL translator](https://www.deepl.com/en/translator)

You'll need to add (merge) the updated `_config.yml` and the new `_launch_buttons.yml` to all of your branches so the buttons and configuration are available on every built branch.

### Example (visual)

The following `_launch_buttons.yml` shows a dropdown with two language links:

```yaml
buttons:
  - type: dropdown
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-globe" viewBox="0 0 16 16">
            <path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m7.5-6.923c-.67.204-1.335.82-1.887 1.855A8 8 0 0 0 5.145 4H7.5zM4.09 4a9.3 9.3 0 0 1 .64-1.539 7 7 0 0 1 .597-.933A7.03 7.03 0 0 0 2.255 4zm-.582 3.5c.03-.877.138-1.718.312-2.5H1.674a7 7 0 0 0-.656 2.5zM4.847 5a12.5 12.5 0 0 0-.338 2.5H7.5V5zM8.5 5v2.5h2.99a12.5 12.5 0 0 0-.337-2.5zM4.51 8.5a12.5 12.5 0 0 0 .337 2.5H7.5V8.5zm3.99 0V11h2.653c.187-.765.306-1.608.338-2.5zM5.145 12q.208.58.468 1.068c.552 1.035 1.218 1.65 1.887 1.855V12zm.182 2.472a7 7 0 0 1-.597-.933A9.3 9.3 0 0 1 4.09 12H2.255a7 7 0 0 0 3.072 2.472M3.82 11a13.7 13.7 0 0 1-.312-2.5h-2.49c.062.89.291 1.733.656 2.5zm6.853 3.472A7 7 0 0 0 13.745 12H11.91a9.3 9.3 0 0 1-.64 1.539 7 7 0 0 1-.597.933M8.5 12v2.923c.67-.204 1.335-.82 1.887-1.855q.26-.487.468-1.068zm3.68-1h2.146c.365-.767.594-1.61.656-2.5h-2.49a13.7 13.7 0 0 1-.312 2.5m2.802-3.5a7 7 0 0 0-.656-2.5H12.18c.174.782.282 1.623.312 2.5zM11.27 2.461c.247.464.462.98.64 1.539h1.835a7 7 0 0 0-3.072-2.472c.218.284.418.598.597.933M10.855 4a8 8 0 0 0-.468-1.068C9.835 1.897 9.17 1.282 8.5 1.077V4z"/>
          </svg>
    items:
      - label: English
        url: https://teachbooks.github.io/files-and-folders/EN
      - label: Nederlands
        url: https://teachbooks.github.io/files-and-folders/NL
```

Icons example
-------------

You can add inline SVG or small HTML snippets in the `icon` key. The
front-end will render that HTML verbatim and prepend it to the label. This
is convenient for trusted repositories where you control the YAML.

Example (inline SVG in a dropdown item and a single button):

```yaml
buttons:
  - type: dropdown
    label: "Languages"
    items:
      - label: "EN"
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0L6 4H2l3 2-1 4 4-2 4 2-1-4 3-2H10L8 0z"/></svg>'
        url: https://example.org/en

  - type: button
    label: "Open"
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M2 2h12v12H2z"/></svg>'
    url: https://example.org/open
```

Security note: this inline-HTML approach is intended for trusted YAML in
your repository. If you expect untrusted inputs, consider using image URLs
or a named-icon approach instead (see README discussion).
