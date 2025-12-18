# AEM Unit Testing Skill

## Capability Description
Write comprehensive unit tests for AEM components using AEM Mocks (wcm.io), JUnit 5, and Mockito.

## When to Use
- After creating a new Sling Model
- When modifying existing component logic
- When fixing bugs (add regression test)
- Code coverage requirements

## Testing Dependencies

```xml
<!-- pom.xml dependencies -->
<dependency>
    <groupId>io.wcm</groupId>
    <artifactId>io.wcm.testing.aem-mock.junit5</artifactId>
    <version>5.3.0</version>
    <scope>test</scope>
</dependency>
<dependency>
    <groupId>org.mockito</groupId>
    <artifactId>mockito-core</artifactId>
    <version>5.4.0</version>
    <scope>test</scope>
</dependency>
<dependency>
    <groupId>org.mockito</groupId>
    <artifactId>mockito-junit-jupiter</artifactId>
    <version>5.4.0</version>
    <scope>test</scope>
</dependency>
```

## Test Class Template

```java
package com.company.core.models;

import io.wcm.testing.mock.aem.junit5.AemContext;
import io.wcm.testing.mock.aem.junit5.AemContextExtension;
import org.apache.sling.api.resource.Resource;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith({AemContextExtension.class, MockitoExtension.class})
class ComponentModelTest {

    private final AemContext context = new AemContext();

    private static final String COMPONENT_PATH = "/content/test/component";

    @BeforeEach
    void setUp() {
        // Register Sling Model
        context.addModelsForClasses(ComponentModel.class);

        // Load test content
        context.load().json("/com/company/core/models/ComponentModelTest.json", "/content/test");
    }

    @Test
    void testGetTitle() {
        // Arrange
        Resource resource = context.resourceResolver().getResource(COMPONENT_PATH);

        // Act
        ComponentModel model = resource.adaptTo(ComponentModel.class);

        // Assert
        assertNotNull(model);
        assertEquals("Test Title", model.getTitle());
    }

    @Test
    void testIsEmpty_WhenTitlePresent_ReturnsFalse() {
        Resource resource = context.resourceResolver().getResource(COMPONENT_PATH);
        ComponentModel model = resource.adaptTo(ComponentModel.class);

        assertFalse(model.isEmpty());
    }

    @Test
    void testIsEmpty_WhenNoTitle_ReturnsTrue() {
        // Create empty component
        context.create().resource("/content/test/empty-component");
        Resource resource = context.resourceResolver().getResource("/content/test/empty-component");

        ComponentModel model = resource.adaptTo(ComponentModel.class);

        assertTrue(model.isEmpty());
    }
}
```

## Test Data JSON

Location: `src/test/resources/com/company/core/models/ComponentModelTest.json`

```json
{
    "component": {
        "jcr:primaryType": "nt:unstructured",
        "sling:resourceType": "company/components/content/component-name",
        "title": "Test Title",
        "description": "Test description",
        "linkUrl": "/content/company/en/page",
        "items": {
            "item1": {
                "jcr:primaryType": "nt:unstructured",
                "title": "Item 1",
                "value": "value1"
            },
            "item2": {
                "jcr:primaryType": "nt:unstructured",
                "title": "Item 2",
                "value": "value2"
            }
        }
    }
}
```

## Testing Patterns

### Testing with OSGi Service Mock
```java
@Mock
private MyService myService;

@BeforeEach
void setUp() {
    context.addModelsForClasses(ComponentModel.class);
    context.registerService(MyService.class, myService);

    when(myService.getData()).thenReturn("mocked data");
}
```

### Testing with Request Attributes
```java
@Test
void testWithRequestAttribute() {
    context.request().setAttribute("customAttr", "customValue");
    context.currentResource(context.resourceResolver().getResource(COMPONENT_PATH));

    ComponentModel model = context.request().adaptTo(ComponentModel.class);

    assertEquals("customValue", model.getCustomAttribute());
}
```

### Testing with Page Context
```java
@BeforeEach
void setUp() {
    context.addModelsForClasses(ComponentModel.class);
    context.load().json("/test-content.json", "/content");

    // Set current page
    context.currentPage("/content/company/en/test-page");
    context.currentResource("/content/company/en/test-page/jcr:content/component");
}

@Test
void testGetCurrentPageTitle() {
    ComponentModel model = context.request().adaptTo(ComponentModel.class);

    assertEquals("Test Page", model.getCurrentPageTitle());
}
```

### Testing Exception Handling
```java
@Test
void testHandlesNullResource() {
    context.currentResource((Resource) null);

    ComponentModel model = context.request().adaptTo(ComponentModel.class);

    assertNull(model);
}

@Test
void testHandlesMissingProperty() {
    context.create().resource("/content/test/minimal", "sling:resourceType", "company/components/component");
    Resource resource = context.resourceResolver().getResource("/content/test/minimal");

    ComponentModel model = resource.adaptTo(ComponentModel.class);

    assertNotNull(model);
    assertNull(model.getOptionalProperty());
}
```

### Testing Multifield Items
```java
@Test
void testGetItems() {
    Resource resource = context.resourceResolver().getResource(COMPONENT_PATH);
    ComponentModel model = resource.adaptTo(ComponentModel.class);

    List<ItemModel> items = model.getItems();

    assertNotNull(items);
    assertEquals(2, items.size());
    assertEquals("Item 1", items.get(0).getTitle());
}
```

## Running Tests

```bash
# Run all tests
mvn test -f core/pom.xml

# Run specific test class
mvn test -Dtest=ComponentModelTest -f core/pom.xml

# Run with coverage report
mvn test jacoco:report -f core/pom.xml

# Run tests in watch mode (with surefire)
mvn surefire:test -Dtest=ComponentModelTest -f core/pom.xml
```

## Test Failure Troubleshooting

### Model Returns Null
- Check `@Model` annotation has correct `resourceType`
- Verify model class is registered: `context.addModelsForClasses()`
- Check adaptable type matches (Resource vs SlingHttpServletRequest)

### Service Not Injected
- Register mock service: `context.registerService()`
- Check `@OSGiService` annotation
- Verify service interface matches

### Properties Not Loaded
- Check JSON test data path matches
- Verify property names in JSON
- Check `@ValueMapValue` name parameter

## Quality Checklist
- [ ] All public methods tested
- [ ] Null/empty scenarios covered
- [ ] Edge cases tested
- [ ] Mocks verified (no unnecessary stubbing)
- [ ] Test names describe behavior
- [ ] Tests are independent (no shared state)
- [ ] Test data is realistic
