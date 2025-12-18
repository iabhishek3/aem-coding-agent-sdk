# Sling Models Knowledge Base

## Basic Sling Model Pattern

```java
package com.company.core.models;

import org.apache.sling.api.SlingHttpServletRequest;
import org.apache.sling.api.resource.Resource;
import org.apache.sling.models.annotations.Model;
import org.apache.sling.models.annotations.DefaultInjectionStrategy;
import org.apache.sling.models.annotations.injectorspecific.*;

import javax.annotation.PostConstruct;
import java.util.List;

@Model(
    adaptables = {SlingHttpServletRequest.class, Resource.class},
    adapters = {ComponentModel.class},
    resourceType = "company/components/content/component-name",
    defaultInjectionStrategy = DefaultInjectionStrategy.OPTIONAL
)
public class ComponentModel {

    @Self
    private SlingHttpServletRequest request;

    @SlingObject
    private Resource resource;

    @ValueMapValue
    private String title;

    @ValueMapValue(name = "jcr:description")
    private String description;

    @ValueMapValue
    private String[] tags;

    @ChildResource(name = "items")
    private List<ItemModel> items;

    @OSGiService
    private MyService myService;

    @ScriptVariable
    private Page currentPage;

    @RequestAttribute(name = "customAttr")
    private String customAttribute;

    private String computedValue;

    @PostConstruct
    protected void init() {
        // Initialization logic
        if (title != null) {
            computedValue = title.toUpperCase();
        }
    }

    // Getters (no setters for immutability)
    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public String getComputedValue() {
        return computedValue;
    }

    public boolean isEmpty() {
        return title == null || title.isEmpty();
    }
}
```

## Injection Annotations

| Annotation | Purpose | Example |
|------------|---------|---------|
| `@ValueMapValue` | Inject property from resource | `@ValueMapValue String title;` |
| `@ChildResource` | Inject child resource | `@ChildResource Resource child;` |
| `@SlingObject` | Inject Sling objects | `@SlingObject Resource resource;` |
| `@OSGiService` | Inject OSGi service | `@OSGiService MyService service;` |
| `@Self` | Inject adaptable itself | `@Self SlingHttpServletRequest request;` |
| `@RequestAttribute` | Inject request attribute | `@RequestAttribute String attr;` |
| `@ScriptVariable` | Inject script binding | `@ScriptVariable Page currentPage;` |
| `@ResourcePath` | Inject resource by path | `@ResourcePath(path="/content") Resource r;` |

## Model with Interface (Recommended)

```java
// Interface
public interface HeroModel {
    String getTitle();
    String getImagePath();
    boolean isEmpty();
}

// Implementation
@Model(
    adaptables = SlingHttpServletRequest.class,
    adapters = HeroModel.class,
    resourceType = "company/components/hero"
)
public class HeroModelImpl implements HeroModel {

    @ValueMapValue
    private String title;

    @ValueMapValue
    private String imagePath;

    @Override
    public String getTitle() {
        return title;
    }

    @Override
    public String getImagePath() {
        return imagePath;
    }

    @Override
    public boolean isEmpty() {
        return StringUtils.isBlank(title);
    }
}
```

## Sling Model Exporter (JSON)

```java
@Model(
    adaptables = SlingHttpServletRequest.class,
    adapters = {CardModel.class, ComponentExporter.class},
    resourceType = "company/components/card"
)
@Exporter(
    name = ExporterConstants.SLING_MODEL_EXPORTER_NAME,
    extensions = ExporterConstants.SLING_MODEL_EXTENSION
)
public class CardModelImpl implements CardModel, ComponentExporter {

    @ValueMapValue
    private String title;

    @Override
    public String getTitle() {
        return title;
    }

    @Override
    @NotNull
    public String getExportedType() {
        return "company/components/card";
    }
}
```

## Delegation Pattern

```java
@Model(
    adaptables = SlingHttpServletRequest.class,
    adapters = CustomImage.class,
    resourceType = "company/components/custom-image"
)
public class CustomImageImpl implements CustomImage {

    @Self
    @Via(type = ResourceSuperType.class)
    @Delegate(excludes = DelegationExclusion.class)
    private Image delegate;

    @ValueMapValue
    private String customCaption;

    public String getCustomCaption() {
        return customCaption;
    }

    private interface DelegationExclusion {
        String getAlt();
    }

    @Override
    public String getAlt() {
        return customCaption != null ? customCaption : delegate.getAlt();
    }
}
```

## Testing Sling Models

```java
@ExtendWith(AemContextExtension.class)
class ComponentModelTest {

    private final AemContext context = new AemContext();

    @BeforeEach
    void setUp() {
        context.addModelsForClasses(ComponentModel.class);
        context.load().json("/component-data.json", "/content/test");
    }

    @Test
    void testGetTitle() {
        Resource resource = context.resourceResolver()
            .getResource("/content/test/component");
        ComponentModel model = resource.adaptTo(ComponentModel.class);

        assertNotNull(model);
        assertEquals("Expected Title", model.getTitle());
    }

    @Test
    void testIsEmpty_WhenNoTitle() {
        context.build().resource("/content/test/empty-component")
            .commit();

        Resource resource = context.resourceResolver()
            .getResource("/content/test/empty-component");
        ComponentModel model = resource.adaptTo(ComponentModel.class);

        assertTrue(model.isEmpty());
    }
}
```
