# HTL (HTML Template Language) Knowledge Base

## Basic HTL Syntax

### Variable Output
```html
<!-- Text output (escaped) -->
<h1>${properties.title}</h1>

<!-- Unescaped HTML (use with caution) -->
<div>${properties.richText @ context='html'}</div>

<!-- URI context -->
<a href="${properties.linkUrl @ context='uri'}">${properties.linkText}</a>

<!-- Attribute context -->
<div class="${properties.cssClass @ context='attribute'}"></div>
```

### Conditionals
```html
<!-- data-sly-test -->
<div data-sly-test="${properties.showSection}">
    Visible when showSection is truthy
</div>

<!-- data-sly-test with variable assignment -->
<sly data-sly-test.hasItems="${model.items.size > 0}">
    <div data-sly-test="${hasItems}">Has items</div>
</sly>

<!-- Negation -->
<div data-sly-test="${!properties.hideSection}">
    Visible when hideSection is falsy
</div>
```

### Loops
```html
<!-- data-sly-list -->
<ul data-sly-list.item="${model.items}">
    <li>
        Index: ${itemList.index}
        Count: ${itemList.count}
        First: ${itemList.first}
        Last: ${itemList.last}
        Value: ${item.title}
    </li>
</ul>

<!-- data-sly-repeat (preserves element) -->
<div data-sly-repeat.card="${model.cards}" class="card">
    <h3>${card.title}</h3>
    <p>${card.description}</p>
</div>
```

### Use API (Sling Models)
```html
<!-- Recommended: Use Sling Model -->
<sly data-sly-use.model="com.company.core.models.HeroModel">
    <section class="hero">
        <h1>${model.title}</h1>
        <p>${model.description}</p>
    </section>
</sly>

<!-- With request attribute -->
<sly data-sly-use.card="${'com.company.core.models.CardModel' @
    cardId=properties.cardId}">
    ${card.title}
</sly>
```

### Include & Template
```html
<!-- data-sly-include -->
<div data-sly-include="partials/header.html"></div>

<!-- data-sly-template (define) -->
<template data-sly-template.button="${@ text, url, style}">
    <a href="${url}" class="btn btn-${style}">${text}</a>
</template>

<!-- data-sly-call (use) -->
<sly data-sly-call="${button @ text='Click Me', url='/page.html', style='primary'}"/>

<!-- External template -->
<sly data-sly-use.templates="partials/templates.html">
    <sly data-sly-call="${templates.button @ text='Submit'}"/>
</sly>
```

### Resource Inclusion
```html
<!-- data-sly-resource -->
<div data-sly-resource="${'header' @ resourceType='company/components/header'}"></div>

<!-- With selectors -->
<div data-sly-resource="${'content' @
    resourceType='company/components/text',
    selectors='mobile'}"></div>

<!-- Wrap mode -->
<article data-sly-resource="${'article' @
    resourceType='company/components/article',
    decorationTagName='section',
    cssClassName='article-wrapper'}">
</article>
```

## Context Options

| Context | Use For | Example |
|---------|---------|---------|
| `text` | Plain text (default) | `${title}` |
| `html` | HTML content | `${richText @ context='html'}` |
| `attribute` | HTML attributes | `${className @ context='attribute'}` |
| `uri` | URLs | `${linkUrl @ context='uri'}` |
| `scriptToken` | JS identifiers | `${varName @ context='scriptToken'}` |
| `scriptString` | JS strings | `${message @ context='scriptString'}` |
| `styleToken` | CSS identifiers | `${className @ context='styleToken'}` |
| `unsafe` | No escaping | `${trusted @ context='unsafe'}` |

## Common Patterns

### Component with Empty Check
```html
<sly data-sly-use.model="com.company.core.models.ComponentModel"
     data-sly-test="${!model.isEmpty}">
    <div class="component">
        <h2>${model.title}</h2>
        <div data-sly-test="${model.description}">
            ${model.description}
        </div>
    </div>
</sly>
```

### Responsive Image
```html
<sly data-sly-use.model="com.company.core.models.ImageModel">
    <picture data-sly-test="${model.src}">
        <source srcset="${model.srcMobile}" media="(max-width: 768px)">
        <source srcset="${model.srcTablet}" media="(max-width: 1024px)">
        <img src="${model.src}"
             alt="${model.alt}"
             loading="lazy"
             width="${model.width}"
             height="${model.height}">
    </picture>
</sly>
```

### Link with Analytics
```html
<a href="${model.linkUrl @ context='uri'}"
   target="${model.openInNewTab ? '_blank' : ''}"
   rel="${model.openInNewTab ? 'noopener noreferrer' : ''}"
   data-analytics-click="${model.analyticsId @ context='attribute'}"
   class="cta-link ${model.linkStyle}">
    ${model.linkText}
    <span data-sly-test="${model.openInNewTab}" class="sr-only">(opens in new tab)</span>
</a>
```

### Component Dialog Data Attributes
```html
<div class="carousel"
     data-sly-use.model="com.company.core.models.CarouselModel"
     data-component="carousel"
     data-autoplay="${model.autoplay}"
     data-interval="${model.interval}"
     data-cmp-data-layer="${model.data.json}">
    <!-- carousel content -->
</div>
```

## Best Practices

1. **Always use Sling Models** instead of WCMUsePojo or Use-API JavaScript
2. **Check for null/empty** before rendering optional content
3. **Use appropriate context** for security (XSS prevention)
4. **Keep HTL simple** - move logic to Sling Models
5. **Use data-sly-unwrap** to remove wrapper elements when not needed
6. **Prefer data-sly-list** over data-sly-repeat for cleaner output
7. **Use templates** for reusable HTML fragments
