# AEM Component Development Skill

## Capability Description
Create complete AEM components including Sling Models, HTL templates, dialogs, clientlibs, and unit tests following Adobe best practices.

## When to Use
- User asks to create a new AEM component
- User needs to modify an existing component
- User wants to add dialog fields to a component
- User needs help with Sling Model implementation

## Execution Steps

### Step 1: Analyze Requirements
1. Understand the component purpose and functionality
2. Identify required dialog fields
3. Determine if component needs JS/CSS
4. Check for similar existing components to extend

### Step 2: Create Component Structure
```bash
# Component folder structure
ui.apps/src/main/content/jcr_root/apps/<project>/components/content/<component-name>/
├── .content.xml
├── _cq_dialog/.content.xml
├── _cq_editConfig.xml
├── <component-name>.html
└── README.md
```

### Step 3: Create Component Definition (.content.xml)
```xml
<?xml version="1.0" encoding="UTF-8"?>
<jcr:root xmlns:cq="http://www.day.com/jcr/cq/1.0"
          xmlns:jcr="http://www.jcp.org/jcr/1.0"
    jcr:primaryType="cq:Component"
    jcr:title="Component Title"
    jcr:description="Component description"
    componentGroup="Project - Content"/>
```

### Step 4: Create Sling Model
Location: `core/src/main/java/com/<company>/core/models/<ComponentName>Model.java`

Required annotations:
- `@Model` with adaptables, adapters, resourceType
- `@DefaultInjectionStrategy.OPTIONAL`
- Implement `isEmpty()` method
- Add `@PostConstruct` for initialization

### Step 5: Create HTL Template
Location: `ui.apps/.../components/content/<component>/<component>.html`

Requirements:
- Use `data-sly-use` to load Sling Model
- Include `data-sly-test` for empty check
- Apply proper context for output
- Add data attributes for JS if needed

### Step 6: Create Dialog
Location: `ui.apps/.../components/content/<component>/_cq_dialog/.content.xml`

Structure:
- Use tabs for organization
- Group related fields
- Add validation (required, maxlength)
- Include field descriptions

### Step 7: Create Unit Tests
Location: `core/src/test/java/com/<company>/core/models/<ComponentName>ModelTest.java`

Test coverage:
- All public methods
- Empty/null scenarios
- Edge cases
- Integration with services

### Step 8: Build and Verify
```bash
# Build core module
mvn clean install -PautoInstallBundle -f core/pom.xml

# Build ui.apps
mvn clean install -PautoInstallPackage -f ui.apps/pom.xml

# Run tests
mvn test -f core/pom.xml
```

## Code Templates

### Minimal Component Sling Model
```java
@Model(
    adaptables = SlingHttpServletRequest.class,
    adapters = ComponentModel.class,
    resourceType = "project/components/content/component-name",
    defaultInjectionStrategy = DefaultInjectionStrategy.OPTIONAL
)
public class ComponentModel {

    @ValueMapValue
    private String title;

    public String getTitle() {
        return title;
    }

    public boolean isEmpty() {
        return StringUtils.isBlank(title);
    }
}
```

### Minimal HTL Template
```html
<sly data-sly-use.model="com.company.core.models.ComponentModel"
     data-sly-test="${!model.isEmpty}">
    <div class="cmp-component">
        <h2 class="cmp-component__title">${model.title}</h2>
    </div>
</sly>
```

## Quality Checklist
- [ ] Component compiles without errors
- [ ] Dialog fields save correctly
- [ ] HTL renders expected output
- [ ] Unit tests pass
- [ ] No hardcoded paths
- [ ] Proper i18n for labels
- [ ] Accessibility attributes added
- [ ] Component documented in README
