// TODO add icons 
// TODO add dropdown

document.addEventListener('DOMContentLoaded', function() {
    // Inject small stylesheet for inline icons (idempotent)
    if(!document.getElementById('sphinx-launch-buttons-icons-style')) {
        const style = document.createElement('style');
        style.id = 'sphinx-launch-buttons-icons-style';
        style.textContent = `
        .lb-icon { display: inline-block; vertical-align: -0.125em; margin-right: 0.35em; }
        .lb-icon svg { width: 1em; height: 1em; display: inline-block; vertical-align: middle; }
        .dropdown-item .lb-icon, .btn .lb-icon { margin-right: 0.4em; }
        `;
        document.head.appendChild(style);
    }
    // Fetch json file with launch buttons
    fetch('_static/_launch_buttons.json')
    .then((response) => response.json())
    .then((response) => {
        if(response) {
            // If the YAML contained a 'site_base_url' key we use it.
            const siteBase = response.site_base_url || null;

            // Start with any explicit button definitions from the YAML.
            let buttons = Array.isArray(response.custom_launch_buttons) ? response.custom_launch_buttons.slice() : [];

            // For backwards compatibility, if version_switch exists, convert it
            // into a dropdown called 'Versions' and append to the buttons.
            if(Array.isArray(response.version_switch) && response.version_switch.length > 0) {
                const versionItems = response.version_switch.map(function(m) {
                    return {
                        // keep the mapping fields so addButtons can compute URLs
                        label: (typeof m === 'object' ? (m.label || m.version || m.name) : m),
                        version: (typeof m === 'object' ? (m.version || m.value || m.name) : m),
                        base_url: (typeof m === 'object' ? (m.base_url || null) : null),
                        root: (typeof m === 'object' ? !!m.root : false),
                        preserve_path: (typeof m === 'object' && typeof m.preserve_path !== 'undefined') ? !!m.preserve_path : true
                    };
                });

                buttons.push({ type: 'dropdown', label: 'Versions', items: versionItems });
            }

            if(buttons.length > 0) {
                addButtons(buttons, siteBase);
            }
        }
    })
    .catch((err) => {
        // Missing or malformed JSON — nothing to do.
        console.debug('sphinx-launch-buttons: no valid custom_launch_buttons JSON found', err);
    });

});

/**
 * Build an href from a mapping object that may contain:
 * - version, root, base_url, preserve_path
 * Returns null if a base cannot be resolved.
 */
function buildHrefFromMapping(m, siteBaseUrl) {
    let version = m.version || m.value || m.name || null;
    let base_url = m.base_url || null;

    const effectiveBase = base_url || siteBaseUrl;
    if(!effectiveBase) {
        return null;
    }

    let parsedBase;
    try {
        parsedBase = new URL(effectiveBase, window.location.origin);
    } catch (err) {
        console.debug('sphinx-launch-buttons: invalid base_url for entry, skipping:', effectiveBase);
        return null;
    }

    const baseSegments = parsedBase.pathname.split('/').filter(Boolean);
    const currentPath = window.location.pathname || '/';
    const currentSegments = currentPath.split('/').filter(Boolean);
    const restSegments = currentSegments.slice(baseSegments.length);

    const preservePath = typeof m.preserve_path !== 'undefined' ? !!m.preserve_path : true;
    const isRoot = !!m.root || !version;

    if(isRoot) {
        if(preservePath) {
            const pathSegments = baseSegments.concat(restSegments).filter(Boolean);
            const newPath = '/' + pathSegments.join('/');
            return parsedBase.origin.replace(/\/$/, '') + newPath + window.location.search + window.location.hash;
        } else {
            const newPath = '/' + baseSegments.filter(Boolean).join('/');
            return parsedBase.origin.replace(/\/$/, '') + newPath + window.location.search + window.location.hash;
        }
    } else {
        if(preservePath) {
            let newSegments = baseSegments.slice();
            newSegments.push(version);
            if(restSegments.length > 1) {
                newSegments = newSegments.concat(restSegments.slice(1));
            }
            newSegments = newSegments.filter(Boolean);
            const newPath = '/' + newSegments.join('/');
            return parsedBase.origin.replace(/\/$/, '') + newPath + window.location.search + window.location.hash;
        } else {
            const newPath = '/' + baseSegments.concat([version]).filter(Boolean).join('/');
            return parsedBase.origin.replace(/\/$/, '') + newPath + window.location.search + window.location.hash;
        }
    }
}

let addButtons = (buttons, siteBase) => {
    // Append launch buttons to the page
    buttons.forEach(function(button) {
        // Top-level button (simple link) or dropdown
        if(button.type === 'button') {
            var buttonElement = document.createElement('button');
            // If an inline icon (SVG or HTML) is provided, render it verbatim
            // and prepend to the label. This is the 'trusted' inline-icon
            // behavior (see README). If no icon is provided, fall back to
            // textContent to avoid interpreting HTML.
            if(button.icon) {
                buttonElement.innerHTML = '<span class="lb-icon">' + button.icon + '</span>' + (button.label || '');
            } else {
                buttonElement.textContent = button.label || '';
            }
            buttonElement.classList.add("btn", "btn-sm", "navbar-btn");

            // Determine href: explicit url wins; otherwise try to build from mapping
            let href = null;
            if(button.url) href = button.url;
            else if(button.version || button.root || button.base_url || typeof button.preserve_path !== 'undefined') {
                href = buildHrefFromMapping(button, siteBase);
            }

            if(href) {
                buttonElement.addEventListener('click', function() { window.location.href = href; });
            }

            const header = document.getElementsByClassName('article-header-buttons')[0];
            if(header) header.prepend(buttonElement);
        } else if(button.type === 'dropdown') {
            var container = document.createElement('div');
            container.classList.add('dropdown', 'dropdown-source-buttons');

            var buttonElement = document.createElement('button');
            buttonElement.classList.add('btn', 'dropdown-toggle');
            buttonElement.setAttribute('data-bs-toggle', 'dropdown');
            // allow icon in the dropdown toggle label as well
            if(button.icon) {
                buttonElement.innerHTML = '<span class="lb-icon">' + button.icon + '</span>' + (button.label || 'Dropdown');
            } else {
                buttonElement.textContent = button.label || 'Dropdown';
            }

            var dropdownList = document.createElement('ul');
            dropdownList.classList.add('dropdown-menu');

            const items = Array.isArray(button.items) ? button.items : [];
            items.forEach(function(item) {
                let label = item.label || item.version || item.name || 'Item';
                let href = null;
                if(item.url) href = item.url;
                else if(item.version || item.root || item.base_url || typeof item.preserve_path !== 'undefined') {
                    href = buildHrefFromMapping(item, siteBase);
                }

                let listItem = document.createElement('li');
                let linkItem = document.createElement('a');
                linkItem.classList.add('btn', 'btn-sm', 'dropdown-item');
                linkItem.setAttribute('data-bs-placement', 'left');
                if(href) linkItem.href = href;
                // Render inline icon HTML if provided (trusted input)
                if(item.icon) {
                    linkItem.innerHTML = '<span class="lb-icon">' + item.icon + '</span>' + label;
                } else {
                    linkItem.innerHTML = label;
                }

                listItem.appendChild(linkItem);
                dropdownList.appendChild(listItem);
            });

            container.appendChild(buttonElement);
            container.appendChild(dropdownList);

            const header = document.getElementsByClassName('article-header-buttons')[0];
            if(header) header.prepend(container);
        }
    });
}

// old addVersionSwitch removed — version_switch is now merged into `buttons`
