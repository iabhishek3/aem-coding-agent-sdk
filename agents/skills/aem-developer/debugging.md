# AEM Debugging Skill

## Capability Description
Diagnose and fix common AEM issues including build errors, runtime exceptions, component rendering problems, and OSGi service issues.

## When to Use
- Build fails with errors
- Component not rendering correctly
- Sling Model returns null
- OSGi service not available
- Test failures

## Debugging Decision Tree

```
Problem Identified
├── Build Error?
│   ├── Compilation Error → Check Java syntax, imports, dependencies
│   ├── Test Failure → Run specific test, check assertions
│   └── Package Install Error → Check content conflicts, permissions
├── Runtime Error?
│   ├── NullPointerException → Check object initialization, @Optional
│   ├── ClassNotFoundException → Check bundle exports/imports
│   └── ResourceNotFoundException → Verify path exists
├── Component Issue?
│   ├── Not Rendering → Check resourceType, dialog data
│   ├── Wrong Data → Check Sling Model bindings
│   └── Styling Wrong → Check clientlib categories
└── Service Issue?
    ├── Not Found → Check component annotations, bundle state
    └── Wrong Instance → Check service ranking, filters
```

## Common Errors and Solutions

### Error: Sling Model Returns Null

**Symptoms**: `adaptTo()` returns null

**Diagnostic Steps**:
```java
// 1. Check if model is registered
// In test: context.addModelsForClasses(MyModel.class);

// 2. Verify resourceType matches
@Model(resourceType = "exact/path/to/component")

// 3. Check adaptable type
// If model uses @Self SlingHttpServletRequest, must adapt from request
Model model = request.adaptTo(Model.class); // Not resource.adaptTo()

// 4. Check for exceptions in logs
tail -f crx-quickstart/logs/error.log | grep -i model
```

**Common Fixes**:
```java
// Fix 1: Add correct resourceType
@Model(
    adaptables = Resource.class,
    resourceType = "company/components/mycomponent" // Must match .content.xml
)

// Fix 2: Use correct injection strategy
@Model(defaultInjectionStrategy = DefaultInjectionStrategy.OPTIONAL)

// Fix 3: Check package scanning
// In core bundle, ensure package is exported
<Export-Package>com.company.core.models</Export-Package>
```

### Error: OSGi Bundle Not Active

**Diagnostic**:
```bash
# Check bundle status
curl -u admin:admin "http://localhost:4502/system/console/bundles.json" | \
  jq '.data[] | select(.symbolicName | contains("company"))'

# Check for unresolved imports
curl -u admin:admin "http://localhost:4502/system/console/bundles/<bundle-id>" | \
  grep -A 20 "Unresolved"
```

**Common Causes**:
1. Missing dependency in pom.xml
2. Version mismatch
3. Package not exported by provider bundle

**Fix**:
```xml
<!-- Add missing dependency -->
<dependency>
    <groupId>missing.package</groupId>
    <artifactId>artifact</artifactId>
    <scope>provided</scope>
</dependency>
```

### Error: Component Not Rendering

**Diagnostic Checklist**:
```
1. Check resourceType in .content.xml matches dialog path
2. Verify component is in allowed parsys (template policy)
3. Check componentGroup for Author visibility
4. Look for HTL errors in error.log
5. Check Sling Model isEmpty() isn't blocking render
```

**Debug HTL**:
```html
<!-- Add debug output -->
<sly data-sly-use.model="com.company.core.models.MyModel">
    <!-- Debug: Show model state -->
    <pre data-sly-test="${wcmmode.edit}">
        Title: ${model.title}
        Empty: ${model.isEmpty}
        Resource: ${resource.path}
    </pre>
</sly>
```

### Error: NullPointerException in Sling Model

**Common Causes & Fixes**:
```java
// Cause 1: Accessing null injected value
@ValueMapValue
private String title;

public String getUpperTitle() {
    return title.toUpperCase(); // NPE if title is null
}

// Fix: Null check
public String getUpperTitle() {
    return title != null ? title.toUpperCase() : "";
}

// Cause 2: Service not injected
@OSGiService
private MyService service; // null if service not registered

// Fix: Add null check or use Optional
public String getData() {
    return service != null ? service.getData() : "default";
}
```

### Error: Test Assertion Failure

**Debug Steps**:
```java
@Test
void debugTest() {
    Resource resource = context.resourceResolver().getResource(PATH);

    // Debug: Print resource properties
    System.out.println("Resource exists: " + (resource != null));
    if (resource != null) {
        ValueMap props = resource.getValueMap();
        props.forEach((k, v) -> System.out.println(k + ": " + v));
    }

    Model model = resource.adaptTo(Model.class);
    System.out.println("Model: " + model);
    if (model != null) {
        System.out.println("Title: " + model.getTitle());
    }
}
```

## Log Analysis Commands

```bash
# Watch error log
tail -f crx-quickstart/logs/error.log

# Filter for specific package
tail -f crx-quickstart/logs/error.log | grep "com.company"

# Find recent exceptions
grep -A 10 "Exception" crx-quickstart/logs/error.log | tail -50

# Check request log
tail -f crx-quickstart/logs/request.log

# Search for specific error
grep -r "ResourceNotFoundException" crx-quickstart/logs/
```

## AEM Console URLs

| Console | URL | Purpose |
|---------|-----|---------|
| Bundles | `/system/console/bundles` | Check bundle status |
| Components | `/system/console/components` | OSGi components |
| Services | `/system/console/services` | Service registry |
| Sling Models | `/system/console/status-slingmodels` | Model registration |
| Config | `/system/console/configMgr` | OSGi configuration |
| Log Support | `/system/console/slinglog` | Log configuration |

## Execution Flow for Debugging

1. **Identify Error Type**
   - Build error, runtime error, or logic error?

2. **Gather Information**
   - Full error message and stack trace
   - Relevant code context
   - Recent changes

3. **Isolate the Problem**
   - Can you reproduce consistently?
   - What's the minimal reproduction case?

4. **Apply Fix**
   - Make targeted change
   - Don't fix multiple things at once

5. **Verify Fix**
   - Run build
   - Run affected tests
   - Test manually if needed

6. **Prevent Regression**
   - Add unit test for the bug
   - Document if non-obvious
