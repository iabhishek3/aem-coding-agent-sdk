# Component Creation Workflow

## Trigger
User requests creation of a new AEM component.

## Input Required
- Component name
- Component purpose/description
- Required fields/properties
- Target project/path

## Workflow Steps

### Step 1: Gather Requirements
```yaml
action: ask_user
questions:
  - "What is the component name? (e.g., hero-banner)"
  - "What fields does the component need? (e.g., title, description, image, CTA)"
  - "Should it extend an existing component?"
  - "Does it need JavaScript/CSS?"
defaults:
  componentGroup: "Project - Content"
  componentType: "content"
```

### Step 2: Analyze Project Structure
```yaml
action: explore_codebase
tasks:
  - Find project base path (look for pom.xml with aem-archetype)
  - Identify package naming convention (com.company.project)
  - Check existing component patterns
  - Locate ui.apps and core modules
outputs:
  - projectPath
  - packageName
  - componentBasePath
  - existingPatterns
```

### Step 3: Generate Component Definition
```yaml
action: create_file
path: "ui.apps/src/main/content/jcr_root/apps/{project}/components/{type}/{name}/.content.xml"
template: |
  <?xml version="1.0" encoding="UTF-8"?>
  <jcr:root xmlns:cq="http://www.day.com/jcr/cq/1.0"
            xmlns:jcr="http://www.jcp.org/jcr/1.0"
      jcr:primaryType="cq:Component"
      jcr:title="{displayName}"
      jcr:description="{description}"
      componentGroup="{componentGroup}"/>
```

### Step 4: Generate Sling Model
```yaml
action: create_file
path: "core/src/main/java/{packagePath}/models/{ModelName}.java"
template: sling_model_template
includes:
  - All identified fields with @ValueMapValue
  - isEmpty() method
  - @PostConstruct if computed values needed
  - Proper imports
```

### Step 5: Generate Dialog
```yaml
action: create_file
path: "ui.apps/.../components/{type}/{name}/_cq_dialog/.content.xml"
template: dialog_template
includes:
  - Tab structure
  - Field for each identified property
  - Validation rules
  - Help text
```

### Step 6: Generate HTL Template
```yaml
action: create_file
path: "ui.apps/.../components/{type}/{name}/{name}.html"
template: htl_template
includes:
  - Sling Model use statement
  - Empty check
  - Output for all fields
  - BEM CSS class naming
```

### Step 7: Generate Unit Test
```yaml
action: create_file
path: "core/src/test/java/{packagePath}/models/{ModelName}Test.java"
template: test_template
includes:
  - Test class setup with AemContext
  - Test for each public method
  - Test for isEmpty scenarios
  - Test JSON data file
```

### Step 8: Generate Test Data
```yaml
action: create_file
path: "core/src/test/resources/{packagePath}/models/{ModelName}Test.json"
template: test_json_template
```

### Step 9: Build and Verify
```yaml
action: execute_commands
commands:
  - "mvn clean install -f core/pom.xml"
  - "mvn test -Dtest={ModelName}Test -f core/pom.xml"
condition: on_success
  next: step_10
condition: on_failure
  action: debug_and_fix
```

### Step 10: Deploy to AEM
```yaml
action: execute_commands
commands:
  - "mvn clean install -PautoInstallBundle -f core/pom.xml"
  - "mvn clean install -PautoInstallPackage -f ui.apps/pom.xml"
verify:
  - Bundle is active
  - Component appears in sidekick
```

### Step 11: Report Completion
```yaml
action: report
include:
  - List of created files
  - Build status
  - Test results
  - How to use the component
  - Next steps (add to template policy, etc.)
```

## Error Handling

### Build Failure
```yaml
on_error: build_failure
actions:
  - Parse error message
  - Identify root cause
  - Apply fix from debugging skill
  - Retry build (max 3 attempts)
```

### Test Failure
```yaml
on_error: test_failure
actions:
  - Analyze assertion error
  - Check test data
  - Fix model or test
  - Rerun specific test
```

## Success Criteria
- [ ] All files created
- [ ] Build succeeds
- [ ] All tests pass
- [ ] Component renders in AEM
- [ ] Dialog saves data correctly
